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

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../log.ts", () => ({
  useImportLogs: () => ({ mutateAsync: importLogs, isPending: false, reset: vi.fn() }),
  useRequiredAttachments: () => ({
    mutateAsync: requiredAttachments,
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  }),
  deleteLogFile: async (logFileId: number) => deleteLogFile(logFileId),
  LogImportValidationError: class LogImportValidationError extends Error {},
}));

vi.mock("../../../../../api/resumableUpload.ts", () => ({
  uploadResumable: (file: File, metadata: Record<string, string>, options?: TransferOptions) =>
    uploadResumable(file, metadata, options),
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
    onAttachmentsChange,
    attachmentsPerRun,
  }: {
    onAttachmentsChange: (runNumber: string, files: File[]) => void;
    attachmentsPerRun: Record<string, File[]>;
  }) => (
    <>
      <button onClick={() => onAttachmentsChange("RUN-1", stagedAttachments())}>pick-attachment</button>
      <div data-testid="staged-attachments">{(attachmentsPerRun["RUN-1"] ?? []).map(f => f.name).join(",")}</div>
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

const withProviders = (element: ReactElement): ReactElement => (
  <QueryClientProvider client={new QueryClient()}>{element}</QueryClientProvider>
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

  it("returns from the report to the files step only once the uploads have stopped", async () => {
    importLogs.mockResolvedValue([addedFileItem("a.las", 11), addedFileItem("b.las", 12)]);
    uploadResumable.mockImplementation(
      (_file: File, _metadata: Record<string, string>, options: TransferOptions) =>
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
      (_file: File, _metadata: Record<string, string>, options: TransferOptions) =>
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
      (_file: File, _metadata: Record<string, string>, options: TransferOptions) =>
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
      (_file: File, _metadata: Record<string, string>, options: TransferOptions) =>
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
