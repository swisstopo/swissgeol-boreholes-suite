// @vitest-environment jsdom
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setFileSizeLimits } from "../../../../api/fileSize.ts";
import { LogRun } from "./logInterfaces.ts";

const { fetchApiV2WithApiError, uploadResumable } = vi.hoisted(() => ({
  fetchApiV2WithApiError: vi.fn(),
  uploadResumable: vi.fn(),
}));
vi.mock("../../../../api/fetchApiV2.ts", async () => {
  const actual = await vi.importActual<typeof import("../../../../api/fetchApiV2.ts")>("../../../../api/fetchApiV2.ts");
  return { ...actual, fetchApiV2WithApiError };
});
vi.mock("../../../../api/resumableUpload.ts", () => ({ uploadResumable }));
vi.mock("../../../../hooks/useResetTabStatus.ts", () => ({ useResetTabStatus: () => () => {} }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "de" }, t: (key: string) => key }) }));

const { useLogRunMutations } = await import("./log.ts");

/** A run with one file still to upload. Built per test, because the save writes to it. */
const runWithPendingFile = (): LogRun => ({
  id: 7,
  boreholeId: 42,
  runNumber: "1",
  fromDepth: 0,
  toDepth: 100,
  logFiles: [
    {
      id: 0,
      logRunId: 7,
      name: "gamma.las",
      file: new File(["123"], "gamma.las"),
      toolTypeCodelistIds: [],
      public: false,
    },
  ],
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe("useLogRunMutations update", () => {
  beforeEach(() => {
    fetchApiV2WithApiError.mockReset();
    uploadResumable.mockReset();
    setFileSizeLimits({ maxFileSize: 210_000_000, largeMaxFileSize: 5_000_000_000, chunkSize: 6 * 1024 * 1024 });
  });

  /**
   * The save tells a cancel from a failure by the AbortError, and only for a cancel reads back the
   * files that reached the server. A cancel turned into a failure would skip that and show an alert.
   */
  it("passes a cancelled upload on unchanged", async () => {
    const cancel = new DOMException("The user aborted a request.", "AbortError");
    uploadResumable.mockRejectedValue(cancel);
    const { result } = renderHook(() => useLogRunMutations(), { wrapper });

    await expect(result.current.update.mutateAsync({ logRun: runWithPendingFile() })).rejects.toBe(cancel);
    expect(fetchApiV2WithApiError).not.toHaveBeenCalled();
  });

  it("names the file whose upload failed", async () => {
    uploadResumable.mockRejectedValue(new Error("tus: failed to upload chunk"));
    const { result } = renderHook(() => useLogRunMutations(), { wrapper });

    await expect(result.current.update.mutateAsync({ logRun: runWithPendingFile() })).rejects.toMatchObject({
      messageKey: "logFileUploadFailed",
      details: { fileName: "gamma.las" },
    });
    expect(fetchApiV2WithApiError).not.toHaveBeenCalled();
  });
});
