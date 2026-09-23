// @vitest-environment jsdom
import { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TransferOptions } from "../../../../../api/transferProgress.ts";
import { LogImportResultItem } from "../logInterfaces.ts";
import { ImportLogWizard } from "./importLogWizard.tsx";

const { importLogs, requiredAttachments, deleteLogFile, uploadResumable } = vi.hoisted(() => ({
  importLogs: vi.fn(),
  requiredAttachments: vi.fn(),
  deleteLogFile: vi.fn(),
  uploadResumable: vi.fn(),
}));

// Translations are stubbed by their key. The transferred size is appended where one is passed, so
// that what the progress bar was handed can be read back off the rendered text.
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options && "transferred" in options ? `${key} ${options.transferred}` : key,
  }),
}));

// The wizard reads the report and the expected attachment names off these mutations rather than
// copying them into state, so the mocks wrap real mutations and only the request is faked.
vi.mock("../log.ts", async () => {
  const { useMutation } = await import("@tanstack/react-query");
  return {
    useImportLogs: () => useMutation({ mutationFn: importLogs }),
    useRequiredAttachments: () => useMutation({ mutationFn: requiredAttachments }),
    deleteLogFile: async (logFileId: number) => deleteLogFile(logFileId),
    LogImportValidationError: class LogImportValidationError extends Error {},
  };
});

vi.mock("../../../../../api/resumableUpload.ts", () => ({
  logFileUploadTarget: { endpoint: "/api/v2/log/upload/tus", resultHeader: "Log-File-Id" },
  uploadResumable: (file: File, target: unknown, metadata: Record<string, string>, options?: TransferOptions) =>
    uploadResumable(file, target, metadata, options),
}));

vi.mock("../../../../../api/borehole.ts", () => ({ boreholeQueryKey: "boreholes" }));
vi.mock("../../../../../hooks/useRequiredId.ts", () => ({ useRequiredId: () => 1 }));
vi.mock("../../../../../hooks/useResetTabStatus.ts", () => ({ useResetTabStatus: () => () => {} }));

// The two input steps are replaced by a single control each, so the wizard can be driven from
// the outside without dropping files into a dropzone.
// Each step also reports the selection it was handed back, so the tests can tell whether the
// wizard still holds it after navigating away and returning.
vi.mock("./importRunsStep.tsx", () => ({
  ImportRunsStep: ({ onFileChange, file }: { onFileChange: (file?: File) => void; file?: File }) => (
    <>
      <button onClick={() => onFileChange(new File(["runNumber"], "runs.csv"))}>pick-runs-csv</button>
      <div data-testid="staged-runs-csv">{file?.name ?? ""}</div>
    </>
  ),
}));

vi.mock("./importFilesStep.tsx", () => ({
  ImportFilesStep: ({
    onFileChange,
    onAttachmentsChange,
    attachmentsPerRun,
    requiredFilesPerRun,
  }: {
    onFileChange: (file?: File) => void;
    onAttachmentsChange: (runNumber: string, files: File[]) => void;
    attachmentsPerRun: Record<string, File[]>;
    requiredFilesPerRun: Record<string, string[]>;
  }) => (
    <>
      <button onClick={() => onFileChange(new File(["runNumber"], "files.csv"))}>pick-files-csv</button>
      <button onClick={() => onAttachmentsChange("RUN-1", stagedAttachments())}>pick-attachment</button>
      <div data-testid="staged-attachments">{(attachmentsPerRun["RUN-1"] ?? []).map(f => f.name).join(",")}</div>
      <div data-testid="required-files">{Object.keys(requiredFilesPerRun).join(",")}</div>
    </>
  ),
}));

const stagedAttachments = (): File[] => ["a.las", "b.las", "c.las"].map(name => new File(["content"], name));

const addedFileItem = (fileName: string, logFileId: number): LogImportResultItem => ({
  type: "File",
  identifier: `RUN-1 / ${fileName}`,
  outcome: "Added",
  messageKey: "importResultFileAdded",
  logRunId: 3,
  logFileId,
});

const addedFile = addedFileItem("a.las", 7);

/** Records the order of the record deletions and of the refreshes asking for the runs again. */
const cleanupOrder: string[] = [];

const makeQueryClient = (): QueryClient => {
  const client = new QueryClient();
  const invalidateQueries = client.invalidateQueries.bind(client);
  client.invalidateQueries = filters => {
    if (filters?.queryKey?.[0] === "logs") cleanupOrder.push("refresh");
    return invalidateQueries(filters);
  };
  return client;
};

const withProviders = (element: ReactElement): ReactElement => (
  <QueryClientProvider client={makeQueryClient()}>{element}</QueryClientProvider>
);

/** Walks the already rendered wizard from the first step to the report, staging the attachments. */
const driveImportToReport = async () => {
  fireEvent.click(screen.getByText("pick-runs-csv"));
  fireEvent.click(screen.getByText("Next"));
  fireEvent.click(screen.getByText("pick-attachment"));
  // The click starts the uploads, whose state updates only settle once the pending promises are
  // flushed, so act() is doing more here than wrapping the event.
  await act(async () => {
    fireEvent.click(screen.getByText("Import"));
  });
};

/** Walks the wizard from the first step to the report, staging the attachments on the way. */
const runImportToReport = async () => {
  render(withProviders(<ImportLogWizard isImporting={true} setIsImporting={vi.fn()} />));
  await driveImportToReport();
};

describe("ImportLogWizard", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    cleanupOrder.length = 0;
  });

  // Closing asks for the runs again straight away, while the records of the attachments that never
  // arrived are only removed once the abort has worked its way through the running upload. The
  // list would hold those files until something asked for the runs after the removals.
  it("asks for the runs again after the records of the cancelled uploads are removed", async () => {
    importLogs.mockResolvedValue([addedFileItem("a.las", 11), addedFileItem("b.las", 12)]);
    uploadResumable.mockImplementation(
      (_file: File, _target: unknown, _metadata: Record<string, string>, options: TransferOptions) =>
        new Promise<number>((_resolve, reject) => {
          options.signal?.addEventListener("abort", () =>
            reject(new DOMException("The user aborted a request.", "AbortError")),
          );
        }),
    );
    deleteLogFile.mockImplementation(async (logFileId: number) => {
      cleanupOrder.push(`delete ${logFileId}`);
    });

    await runImportToReport();
    await waitFor(() => expect(uploadResumable).toHaveBeenCalledTimes(1));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
    });

    await waitFor(() => expect(deleteLogFile).toHaveBeenCalledTimes(2));
    expect(cleanupOrder.at(-1)).toBe("refresh");
  });

  it("deletes the record when its upload fails", async () => {
    importLogs.mockResolvedValue([addedFile]);
    uploadResumable.mockRejectedValue(new Error("network gone"));

    await runImportToReport();

    await waitFor(() => expect(deleteLogFile).toHaveBeenCalledWith(7));
    expect(screen.getByText("importUploadFailed")).toBeDefined();
  });

  it("keeps the record when its upload succeeds", async () => {
    importLogs.mockResolvedValue([addedFile]);
    uploadResumable.mockResolvedValue(7);

    await runImportToReport();

    // A finished upload is marked with a check, which carries the same wording as its label.
    expect(await screen.findByLabelText("importUploadDone")).toBeDefined();
    expect(deleteLogFile).not.toHaveBeenCalled();
  });

  it("keeps the staged runs csv when going back to the first step", () => {
    render(withProviders(<ImportLogWizard isImporting={true} setIsImporting={vi.fn()} />));

    fireEvent.click(screen.getByText("pick-runs-csv"));
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Back"));

    expect(screen.getByTestId("staged-runs-csv").textContent).toBe("runs.csv");
  });

  it("drops the expected attachment names of a csv read that answers after the wizard was closed", async () => {
    let answerRead: (requiredFilesPerRun: Record<string, string[]>) => void = () => {};
    requiredAttachments.mockImplementation(() => new Promise(resolve => (answerRead = resolve)));

    render(withProviders(<ImportLogWizard isImporting={true} setIsImporting={vi.fn()} />));

    fireEvent.click(screen.getByText("pick-runs-csv"));
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("pick-files-csv"));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await act(async () => {
      answerRead({ "RUN-1": ["a.las"] });
    });

    fireEvent.click(screen.getByText("pick-runs-csv"));
    fireEvent.click(screen.getByText("Next"));

    expect(screen.getByTestId("required-files").textContent).toBe("");
  });

  it("refreshes the transferred bytes on an interval rather than on every event", async () => {
    importLogs.mockResolvedValue([addedFile]);
    vi.spyOn(Date, "now").mockReturnValue(1_000_000);

    // The upload stays on the wire, so the progress of the burst is still on screen to read.
    uploadResumable.mockImplementation(
      (_file: File, _target: unknown, _metadata: Record<string, string>, options: TransferOptions) => {
        options.onProgress?.({ loaded: 2000, total: 900_000 });
        options.onProgress?.({ loaded: 500_000, total: 900_000 });
        return new Promise<number>(() => {});
      },
    );

    await runImportToReport();

    // Both events fall inside one interval, so only the first of them reached the bar.
    expect(await screen.findByText(/uploadProgressHintWithSize 2.0 KB/)).toBeDefined();
    expect(screen.queryByText(/500.0 KB/)).toBeNull();
  });

  it("returns from the report to the files step only once the uploads have stopped", async () => {
    importLogs.mockResolvedValue([addedFileItem("a.las", 11), addedFileItem("b.las", 12)]);
    uploadResumable.mockImplementation(
      (_file: File, _target: unknown, _metadata: Record<string, string>, options: TransferOptions) =>
        new Promise<number>((_resolve, reject) => {
          options.signal?.addEventListener("abort", () =>
            reject(new DOMException("The user aborted a request.", "AbortError")),
          );
        }),
    );

    await runImportToReport();
    await waitFor(() => expect(uploadResumable).toHaveBeenCalled());
    expect((screen.getByRole("button", { name: "Back" }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(screen.getByLabelText("cancel"));
    await waitFor(() => expect(deleteLogFile).toHaveBeenCalledWith(12));

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByTestId("staged-attachments").textContent).toBe("a.las,b.las,c.las");
    expect(screen.queryByText("importUploadFailed")).toBeNull();
  });

  it("leaves a later import alone when the run closed out of stops", async () => {
    importLogs.mockResolvedValue([addedFileItem("a.las", 11), addedFileItem("b.las", 12), addedFileItem("c.las", 13)]);

    // The first upload hangs until cancelled, so the closing run still has two records to remove
    // when the dialog goes away and the second import starts.
    uploadResumable.mockImplementationOnce(
      (_file: File, _target: unknown, _metadata: Record<string, string>, options: TransferOptions) =>
        new Promise<number>((_resolve, reject) => {
          options.signal?.addEventListener("abort", () =>
            reject(new DOMException("The user aborted a request.", "AbortError")),
          );
        }),
    );

    let releaseTail: () => void = () => {};
    const tailReached = new Promise<void>(resolve => {
      releaseTail = resolve;
    });
    deleteLogFile.mockImplementation(async () => await tailReached);

    await runImportToReport();
    await waitFor(() => expect(uploadResumable).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    // The second import takes over while the first run's tail is still deleting records.
    uploadResumable.mockImplementation(
      (_file: File, _target: unknown, _metadata: Record<string, string>, options: TransferOptions) =>
        new Promise<number>((_resolve, reject) => {
          options.signal?.addEventListener("abort", () =>
            reject(new DOMException("The user aborted a request.", "AbortError")),
          );
        }),
    );
    importLogs.mockResolvedValue([addedFileItem("a.las", 21)]);
    await driveImportToReport();
    await waitFor(() => expect(screen.getByRole("button", { name: "Back" })).toBeDefined());

    await act(async () => {
      releaseTail();
    });

    // The first run finishing must not report the second run's upload as done.
    expect((screen.getByRole("button", { name: "Back" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("cancellingStopsTheRunningUploadAndSkipsTheRest", async () => {
    importLogs.mockResolvedValue([addedFileItem("a.las", 11), addedFileItem("b.las", 12), addedFileItem("c.las", 13)]);
    uploadResumable.mockImplementationOnce(() => Promise.resolve(11));
    uploadResumable.mockImplementationOnce(
      (_file: File, _target: unknown, _metadata: Record<string, string>, options: TransferOptions) =>
        new Promise<number>((_resolve, reject) => {
          options.signal?.addEventListener("abort", () =>
            reject(new DOMException("The user aborted a request.", "AbortError")),
          );
        }),
    );

    await runImportToReport();
    await waitFor(() => expect(uploadResumable).toHaveBeenCalledTimes(2));

    fireEvent.click(screen.getByLabelText("cancel"));

    await waitFor(() => expect(deleteLogFile).toHaveBeenCalledWith(13));
    expect(deleteLogFile).toHaveBeenCalledWith(12);
    expect(deleteLogFile).not.toHaveBeenCalledWith(11);
    expect(uploadResumable).toHaveBeenCalledTimes(2);
  });
});
