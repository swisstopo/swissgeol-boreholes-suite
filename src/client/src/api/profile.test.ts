// @vitest-environment jsdom
import { createElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchApiV2WithApiError } from "./fetchApiV2.ts";
import { OcrStatus, ProfileOcrStatus } from "./generated";
import { decidePollInterval, ocrStatusIsTerminal, useProfileOcrStatusOf, useReloadProfiles } from "./profile";

vi.mock("./fetchApiV2.ts", () => ({
  fetchApiV2Legacy: vi.fn(),
  fetchApiV2WithApiError: vi.fn(),
  upload: vi.fn(),
}));

const allTerminal: ProfileOcrStatus[] = [
  { id: 1, ocrStatus: "Success" },
  { id: 2, ocrStatus: "WillNotBeProcessed" },
  { id: 3, ocrStatus: "Error" },
];

const someProcessing: ProfileOcrStatus[] = [
  { id: 1, ocrStatus: "Success" },
  { id: 2, ocrStatus: "Processing" },
];

describe("ocrStatusIsTerminal", () => {
  it.each<OcrStatus>(["Success", "Error", "WillNotBeProcessed"])("returns true for terminal status %s", status => {
    expect(ocrStatusIsTerminal(status)).toBe(true);
  });

  it.each<OcrStatus>(["Created", "Processing"])("returns false for non-terminal status %s", status => {
    expect(ocrStatusIsTerminal(status)).toBe(false);
  });
});

describe("OCR polling decision", () => {
  it("returns false when data is undefined", () => {
    expect(decidePollInterval(undefined)).toBe(false);
  });

  it("returns false when list is empty", () => {
    expect(decidePollInterval([])).toBe(false);
  });

  it("returns false when every entry is terminal", () => {
    expect(decidePollInterval(allTerminal)).toBe(false);
  });

  it("returns 2000 ms while any entry is non-terminal", () => {
    expect(decidePollInterval(someProcessing)).toBe(2000);
  });
});

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useProfileOcrStatusOf", () => {
  const pollIntervalMs = 2000;
  const statusRequests = () => vi.mocked(fetchApiV2WithApiError).mock.calls.length;
  const renderOcrStatus = (profileId: number) =>
    renderHook(() => useProfileOcrStatusOf(42, profileId), {
      wrapper: createWrapper(new QueryClient({ defaultOptions: { queries: { retry: false } } })),
    });

  afterEach(() => {
    cleanup();
    vi.mocked(fetchApiV2WithApiError).mockReset();
  });

  it("polls until the profile's OCR has finished", async () => {
    vi.mocked(fetchApiV2WithApiError)
      .mockResolvedValueOnce([{ id: 1, ocrStatus: "Processing" }])
      .mockResolvedValue([{ id: 1, ocrStatus: "Success" }]);
    const { result } = renderOcrStatus(1);

    await waitFor(() => expect(result.current.ocrStatus).toBe("Processing"));
    await waitFor(() => expect(result.current.ocrStatus).toBe("Success"), { timeout: pollIntervalMs * 2 });
  });

  it("reports an unavailable status, stops polling and recovers on retry", async () => {
    vi.mocked(fetchApiV2WithApiError).mockRejectedValueOnce(new Error("Server unavailable"));
    const { result } = renderOcrStatus(1);

    await waitFor(() => expect(result.current.isStatusUnavailable).toBe(true));
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs + 500));
    expect(statusRequests()).toBe(1);

    vi.mocked(fetchApiV2WithApiError).mockResolvedValue([{ id: 1, ocrStatus: "Success" }]);
    act(() => result.current.reloadStatus());

    await waitFor(() => expect(result.current.ocrStatus).toBe("Success"));
    expect(result.current.isStatusUnavailable).toBe(false);
  });
});

describe("useReloadProfiles", () => {
  it("invalidates both profiles and OCR status queries", () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useReloadProfiles(42), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current();
    });

    expect(invalidateSpy).toHaveBeenCalledTimes(2);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["profiles", 42] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["profileOcrStatus", 42] });
  });
});
