// @vitest-environment jsdom
import { createElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OcrStatus, ProfileOcrStatus } from "./generated";
import { decidePollInterval, ocrStatusIsTerminal, useReloadProfiles } from "./profile";

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

describe("useReloadProfiles", () => {
  const createWrapper = (queryClient: QueryClient) => {
    return ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
  };

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
