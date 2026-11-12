// @vitest-environment jsdom
import { createElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildBulkEditRequest, useFilterStats } from "./borehole.ts";
import { fetchApiV2WithApiError } from "./fetchApiV2.ts";

vi.mock("./fetchApiV2.ts", () => ({
  fetchApiV2Base: vi.fn(),
  fetchApiV2Legacy: vi.fn(),
  fetchApiV2WithApiError: vi.fn(),
  upload: vi.fn(),
}));

const createWrapper =
  (queryClient: QueryClient) =>
  ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

const requestsTo = (url: string) =>
  vi.mocked(fetchApiV2WithApiError).mock.calls.filter(([calledUrl]) => calledUrl === url).length;

describe("buildBulkEditRequest", () => {
  it("maps changed entries into update + fieldsToUpdate mask", () => {
    const request = buildBulkEditRequest(
      [1, 2, 3],
      [
        ["projectName", "New project"],
        ["restrictionId", 20111003],
        ["totalDepth", 42],
      ],
    );

    expect(request.boreholeIds).toEqual([1, 2, 3]);
    expect(request.fieldsToUpdate).toEqual(["projectName", "restrictionId", "totalDepth"]);
    expect(request.update).toEqual({ projectName: "New project", restrictionId: 20111003, totalDepth: 42 });
  });

  it("keeps a null value in the update so the field is cleared", () => {
    const request = buildBulkEditRequest([5], [["restrictionId", null]]);

    expect(request.fieldsToUpdate).toEqual(["restrictionId"]);
    expect(request.update).toEqual({ restrictionId: null });
  });
});

describe("useFilterStats", () => {
  afterEach(() => {
    cleanup();
    vi.mocked(fetchApiV2WithApiError).mockReset();
  });

  it("requests the statistics only while enabled", async () => {
    vi.mocked(fetchApiV2WithApiError).mockResolvedValue({});
    const { result, rerender } = renderHook(({ enabled }) => useFilterStats({}, enabled), {
      initialProps: { enabled: false },
      wrapper: createWrapper(new QueryClient()),
    });

    expect(requestsTo("borehole/filter/stats")).toBe(0);

    rerender({ enabled: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requestsTo("borehole/filter/stats")).toBe(1);
  });
});
