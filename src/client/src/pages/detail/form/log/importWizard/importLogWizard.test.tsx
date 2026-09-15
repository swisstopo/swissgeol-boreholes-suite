// @vitest-environment jsdom
import { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TransferOptions } from "../../../../../api/transferProgress.ts";
import { LogImportResultItem } from "../logInterfaces.ts";
import { ImportLogWizard } from "./importLogWizard.tsx";

const { importLogs, deleteLogFile, uploadResumable } = vi.hoisted(() => ({
  importLogs: vi.fn(),
  deleteLogFile: vi.fn(),
  uploadResumable: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("../log.ts", () => ({
  useImportLogs: () => ({ mutateAsync: importLogs, isPending: false, reset: vi.fn() }),
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
vi.mock("./importRunsStep.tsx", () => ({
  ImportRunsStep: ({ onFileChange }: { onFileChange: (file?: File) => void }) => (
    <button onClick={() => onFileChange(new File(["runNumber"], "runs.csv"))}>pick-runs-csv</button>
  ),
}));

vi.mock("./importFilesStep.tsx", () => ({
  ImportFilesStep: ({ onAttachmentsChange }: { onAttachmentsChange: (runNumber: string, files: File[]) => void }) => (
    <button onClick={() => onAttachmentsChange("RUN-1", stagedAttachments())}>pick-attachment</button>
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

/** Walks the wizard from the first step to the report, staging the attachments on the way. */
const runImportToReport = async () => {
  render(withProviders(<ImportLogWizard isImporting={true} setIsImporting={vi.fn()} />));

  fireEvent.click(screen.getByText("pick-runs-csv"));
  fireEvent.click(screen.getByText("Next"));
  fireEvent.click(screen.getByText("pick-attachment"));
  await act(async () => {
    fireEvent.click(screen.getByText("Import"));
  });
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

    expect(await screen.findByText("importUploadDone")).toBeDefined();
    expect(deleteLogFile).not.toHaveBeenCalled();
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

    await act(async () => {
      fireEvent.click(screen.getByLabelText("cancel"));
    });

    await waitFor(() => expect(deleteLogFile).toHaveBeenCalledWith(13));
    expect(deleteLogFile).toHaveBeenCalledWith(12);
    expect(deleteLogFile).not.toHaveBeenCalledWith(11);
    expect(uploadResumable).toHaveBeenCalledTimes(2);
  });
});
