// @vitest-environment jsdom
import { createElement, ReactNode } from "react";
import { focusManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildBulkEditRequest, FilterResponse, useFilterBoreholes, useFilterStats } from "./borehole.ts";
import { fetchApiV2WithApiError } from "./fetchApiV2.ts";
import { createQueryClient } from "./queryClient.ts";

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

  it("keeps the statistics when the drawer opens again", async () => {
    vi.mocked(fetchApiV2WithApiError).mockResolvedValue({});
    const { result, rerender } = renderHook(({ enabled }) => useFilterStats({}, enabled), {
      initialProps: { enabled: true },
      wrapper: createWrapper(new QueryClient()),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ enabled: false });
    rerender({ enabled: true });

    expect(requestsTo("borehole/filter/stats")).toBe(1);
  });
});

describe("useFilterBoreholes", () => {
  const filterResponse: FilterResponse = {
    totalCount: 1,
    pageNumber: 1,
    pageSize: 100,
    totalPages: 1,
    boreholes: [],
    geoJson: null,
    selectableBoreholeIds: [],
  };

  const showOverview = (queryClient: QueryClient) =>
    renderHook(() => useFilterBoreholes({}), { wrapper: createWrapper(queryClient) });

  const showLoadedOverview = async (queryClient: QueryClient) => {
    const overview = showOverview(queryClient);
    await waitFor(() => expect(overview.result.current.isSuccess).toBe(true));
    return overview;
  };

  afterEach(() => {
    cleanup();
    focusManager.setFocused(undefined);
    vi.mocked(fetchApiV2WithApiError).mockReset();
  });

  it("shows the loaded boreholes again without downloading them", async () => {
    vi.mocked(fetchApiV2WithApiError).mockResolvedValue(filterResponse);
    const queryClient = new QueryClient();
    const firstVisit = await showLoadedOverview(queryClient);
    firstVisit.unmount();

    const secondVisit = showOverview(queryClient);

    expect(secondVisit.result.current.data).toEqual(filterResponse);
    expect(requestsTo("borehole/filter")).toBe(1);
  });

  it("does not download the boreholes again when the window regains focus", async () => {
    vi.mocked(fetchApiV2WithApiError).mockResolvedValue(filterResponse);
    await showLoadedOverview(new QueryClient());

    // Async, because the client resumes paused mutations before it tells the queries about the focus.
    await act(async () => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
    });

    expect(requestsTo("borehole/filter")).toBe(1);
  });

  it("downloads the boreholes again after a change elsewhere in the app", async () => {
    vi.mocked(fetchApiV2WithApiError).mockResolvedValue(filterResponse);
    const queryClient = createQueryClient({ showAlert: vi.fn(), translate: key => key, retryQueries: false });
    const firstVisit = await showLoadedOverview(queryClient);
    firstVisit.unmount();

    await queryClient.getMutationCache().build(queryClient, { mutationFn: () => Promise.resolve() }).execute(undefined);
    showOverview(queryClient);

    await waitFor(() => expect(requestsTo("borehole/filter")).toBe(2));
  });
});
