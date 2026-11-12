import { QueryClient, QueryObserver } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { filterBoreholesQueryOptions, FilterResponse } from "./borehole.ts";
import { ApiError } from "./errorClasses.ts";
import { fetchApiV2WithApiError } from "./fetchApiV2.ts";
import { createQueryClient } from "./queryClient.ts";

vi.mock("./fetchApiV2.ts", () => ({
  fetchApiV2Base: vi.fn(),
  fetchApiV2Legacy: vi.fn(),
  fetchApiV2WithApiError: vi.fn(),
  upload: vi.fn(),
}));

const showAlert = vi.fn();
const createClient = () => createQueryClient({ showAlert, translate: key => key, retryQueries: false });

const runMutation = (client: QueryClient, mutationFn: () => Promise<unknown>) =>
  client.getMutationCache().build(client, { mutationFn, retry: false }).execute(undefined);

/** Runs a mutation that fails, so the client's error reporting can be observed. */
const runFailingMutation = async (error: Error) => {
  await expect(runMutation(createClient(), () => Promise.reject(error))).rejects.toBe(error);
};

const overviewResponse: FilterResponse = {
  totalCount: 0,
  pageNumber: 1,
  pageSize: 100,
  totalPages: 0,
  boreholes: [],
  geoJson: null,
  selectableBoreholeIds: [],
};

describe("createQueryClient", () => {
  beforeEach(() => {
    showAlert.mockClear();
  });

  it("reports an unexpected mutation failure to the user", async () => {
    await runFailingMutation(new Error("boom"));

    expect(showAlert).toHaveBeenCalledWith("errorMutationNotSuccessfull", "error");
  });

  it("leaves an ApiError to the caller that knows the context", async () => {
    await runFailingMutation(new ApiError("Not found", 404));

    expect(showAlert).not.toHaveBeenCalled();
  });

  it("stays quiet when the user cancels a transfer", async () => {
    await runFailingMutation(new DOMException("The user aborted a request.", "AbortError"));

    expect(showAlert).not.toHaveBeenCalled();
  });
});

describe("createQueryClient keeps the overview up to date", () => {
  const overviewQuery = filterBoreholesQueryOptions({});

  afterEach(() => {
    vi.mocked(fetchApiV2WithApiError).mockReset();
  });

  it("marks the overview stale after a change without downloading it right away", async () => {
    const client = createClient();
    client.setQueryData(overviewQuery.queryKey, overviewResponse);
    const shownOverview = new QueryObserver(client, { ...overviewQuery, refetchOnMount: false });
    const stopShowing = shownOverview.subscribe(() => undefined);

    await runMutation(client, () => Promise.resolve());

    expect(client.getQueryState(overviewQuery.queryKey)?.isInvalidated).toBe(true);
    expect(fetchApiV2WithApiError).not.toHaveBeenCalled();
    stopShowing();
  });

  it("marks the overview stale after a failed change, which may have changed part of the data", async () => {
    const client = createClient();
    client.setQueryData(overviewQuery.queryKey, overviewResponse);

    await expect(runMutation(client, () => Promise.reject(new ApiError("Forbidden", 403)))).rejects.toThrow();

    expect(client.getQueryState(overviewQuery.queryKey)?.isInvalidated).toBe(true);
  });

  it("leaves queries outside the overview fresh", async () => {
    const client = createClient();
    client.setQueryData(["workflows", 1], {});

    await runMutation(client, () => Promise.resolve());

    expect(client.getQueryState(["workflows", 1])?.isInvalidated).toBe(false);
  });
});
