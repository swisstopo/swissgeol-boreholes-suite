// @vitest-environment jsdom
import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LogFile, LogRun } from "./logInterfaces.ts";

const fetchApiV2WithApiError = vi.hoisted(() => vi.fn());
vi.mock("../../../../api/fetchApiV2.ts", async () => {
  const actual = await vi.importActual<typeof import("../../../../api/fetchApiV2.ts")>("../../../../api/fetchApiV2.ts");
  return { ...actual, fetchApiV2WithApiError };
});
vi.mock("react-i18next", () => ({ useTranslation: () => ({ i18n: { language: "de" }, t: (key: string) => key }) }));

const { useLogsByBoreholeId, useSetCachedLogRuns } = await import("./log.ts");

const boreholeId = 42;
const otherBoreholeId = 43;

const storedFile: LogFile = { id: 99, logRunId: 7, name: "gamma.las", toolTypeCodelistIds: [], public: false };

const run = (id: number, forBorehole: number, logFiles: LogFile[]): LogRun => ({
  id,
  boreholeId: forBorehole,
  runNumber: "1",
  fromDepth: 0,
  toDepth: 100,
  logFiles,
});

/** The run before a file was uploaded, which is what the cache holds when a save is given up on. */
const withoutTheFile = run(7, boreholeId, []);

/** The run as the server holds it, with the file that got through before the cancel. */
const withTheStoredFile = run(7, boreholeId, [storedFile]);

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe("useSetCachedLogRuns", () => {
  beforeEach(() => {
    fetchApiV2WithApiError.mockReset();
    fetchApiV2WithApiError.mockResolvedValue([withoutTheFile]);
  });

  /**
   * Giving up on a save rejects the mutation, so nothing invalidates the runs and the cache keeps
   * saying what it said before the upload. Discarding the changes reads that cache, so a file that
   * did reach the server has to be put there before the user can ask for it back.
   */
  it("makes the stored file the one a discard would restore", async () => {
    const { result } = renderHook(
      () => ({
        logRuns: useLogsByBoreholeId(boreholeId).data ?? [],
        setCachedLogRuns: useSetCachedLogRuns(boreholeId),
      }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.logRuns).toHaveLength(1));
    expect(result.current.logRuns[0].logFiles).toHaveLength(0);

    act(() => result.current.setCachedLogRuns([withTheStoredFile]));

    await waitFor(() => expect(result.current.logRuns[0].logFiles).toHaveLength(1));
    expect(result.current.logRuns[0].logFiles?.[0].id).toBe(storedFile.id);

    // The server's answer is already in hand, so putting it in the cache costs no second request.
    expect(fetchApiV2WithApiError).toHaveBeenCalledTimes(1);
  });

  it("leaves the runs of another borehole alone", async () => {
    const { result } = renderHook(
      () => ({
        logRuns: useLogsByBoreholeId(boreholeId).data ?? [],
        setCachedRunsOfOtherBorehole: useSetCachedLogRuns(otherBoreholeId),
      }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.logRuns).toHaveLength(1));

    act(() => result.current.setCachedRunsOfOtherBorehole([run(8, otherBoreholeId, [storedFile])]));

    expect(result.current.logRuns[0].logFiles).toHaveLength(0);
  });
});
