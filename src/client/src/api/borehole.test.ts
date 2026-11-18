// @vitest-environment jsdom
import { createElement, ReactNode } from "react";
import { focusManager, hashKey, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toPolygonGeometry } from "../pages/overview/polygonFilter.ts";
import {
  buildBulkEditRequest,
  filterBoreholesMapQueryOptions,
  filterBoreholesQueryOptions,
  FilterRequest,
  toMapFilterCriteria,
  useFilterStats,
  useOverviewBoreholes,
} from "./borehole.ts";
import { fetchApiV2WithApiError } from "./fetchApiV2.ts";
import { FilterResponse } from "./generated";
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

describe("toMapFilterCriteria", () => {
  const filters: FilterRequest = { typeId: [20101001], totalDepthMin: 10, hasPhotos: "true" };
  const mapKey = (filterRequest: FilterRequest) => hashKey([toMapFilterCriteria(filterRequest)]);

  it("ignores paging and sorting of the borehole table", () => {
    const withTableFields: FilterRequest = {
      ...filters,
      pageNumber: 3,
      pageSize: 50,
      orderBy: "name",
      direction: "DESC",
    };

    expect(mapKey(withTableFields)).toBe(mapKey(filters));
  });

  it("changes with every filter criterion, including the polygon", () => {
    const polygon = toPolygonGeometry([
      [2600000, 1200000],
      [2610000, 1200000],
      [2610000, 1210000],
    ]);

    expect(mapKey({ ...filters, totalDepthMin: 20 })).not.toBe(mapKey(filters));
    expect(mapKey({ ...filters, hasPhotos: "false" })).not.toBe(mapKey(filters));
    expect(mapKey({ ...filters, polygon })).not.toBe(mapKey(filters));
  });
});

describe("filterBoreholesMapQueryOptions", () => {
  it("gives the prefetch after login the same key as the map in the overview", () => {
    const filters: FilterRequest = { typeId: [20101001], hasPhotos: "true" };
    const sessionFilterRequest: FilterRequest = {
      ...filters,
      pageNumber: 2,
      pageSize: 50,
      orderBy: "name",
      direction: "ASC",
    };

    expect(hashKey(filterBoreholesMapQueryOptions(sessionFilterRequest).queryKey)).toBe(
      hashKey(filterBoreholesMapQueryOptions(filters).queryKey),
    );
  });

  it("keeps the map data fresh as long as the table data", () => {
    expect(filterBoreholesMapQueryOptions({}).staleTime).toBe(filterBoreholesQueryOptions({}).staleTime);
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

describe("useOverviewBoreholes", () => {
  const filterResponse: FilterResponse = {
    totalCount: 1,
    pageNumber: 1,
    pageSize: 100,
    totalPages: 1,
    boreholes: [],
    selectableBoreholeIds: [],
  };

  const showOverview = (queryClient: QueryClient) =>
    renderHook(() => useOverviewBoreholes({}, true), { wrapper: createWrapper(queryClient) });

  const showLoadedOverview = async (queryClient: QueryClient) => {
    const overview = showOverview(queryClient);
    await waitFor(() => expect(overview.result.current.tableData).toBeDefined());
    return overview;
  };

  afterEach(() => {
    cleanup();
    focusManager.setFocused(undefined);
    vi.mocked(fetchApiV2WithApiError).mockReset();
  });

  const withLoadedMap = (queryClient: QueryClient) => {
    queryClient.setQueryData(filterBoreholesMapQueryOptions({}).queryKey, { type: "FeatureCollection", features: [] });
    return queryClient;
  };

  it("keeps the map when the table pages", async () => {
    vi.mocked(fetchApiV2WithApiError).mockResolvedValue(filterResponse);
    const overview = renderHook(({ pageNumber }) => useOverviewBoreholes({ pageNumber }, true), {
      initialProps: { pageNumber: 1 },
      wrapper: createWrapper(withLoadedMap(new QueryClient())),
    });
    await waitFor(() => expect(overview.result.current.tableData).toBeDefined());

    overview.rerender({ pageNumber: 2 });

    await waitFor(() => expect(requestsTo("borehole/filter")).toBe(2));
    expect(requestsTo("borehole/filter/map")).toBe(0);
  });

  it("reports the map as pending while only the table page is loaded", () => {
    vi.mocked(fetchApiV2WithApiError).mockReturnValue(new Promise(() => undefined));
    const queryClient = new QueryClient();
    queryClient.setQueryData(filterBoreholesQueryOptions({}).queryKey, filterResponse);

    const overview = showOverview(queryClient);

    expect(overview.result.current.isTablePending).toBe(false);
    expect(overview.result.current.isMapPending).toBe(true);
  });

  it("shows the loaded boreholes again without downloading them", async () => {
    vi.mocked(fetchApiV2WithApiError).mockResolvedValue(filterResponse);
    const queryClient = new QueryClient();
    const firstVisit = await showLoadedOverview(queryClient);
    firstVisit.unmount();

    const secondVisit = showOverview(queryClient);

    expect(secondVisit.result.current.tableData).toEqual(filterResponse);
    expect(requestsTo("borehole/filter")).toBe(1);
  });

  it("does not download the boreholes again when the window regains focus", async () => {
    vi.mocked(fetchApiV2WithApiError).mockResolvedValue(filterResponse);
    await showLoadedOverview(new QueryClient());

    await act(async () => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
      // The client resumes paused mutations before it tells the queries about the focus, so a refetch would only
      // start a few microtasks later.
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(requestsTo("borehole/filter")).toBe(1);
  });

  it("downloads the boreholes again after a change elsewhere in the app", async () => {
    vi.mocked(fetchApiV2WithApiError).mockResolvedValue(filterResponse);
    const queryClient = createQueryClient({ showAlert: vi.fn(), translate: key => key, retryQueries: false });
    const firstVisit = await showLoadedOverview(queryClient);
    firstVisit.unmount();

    await queryClient
      .getMutationCache()
      .build(queryClient, { mutationFn: () => Promise.resolve() })
      .execute(undefined);
    showOverview(queryClient);

    await waitFor(() => expect(requestsTo("borehole/filter")).toBe(2));
  });
});
