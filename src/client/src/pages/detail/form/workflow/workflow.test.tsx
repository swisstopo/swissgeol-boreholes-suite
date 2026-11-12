// @vitest-environment jsdom
import { ReactNode } from "react";
import { WorkflowStatus } from "@swissgeol/ui-core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { filterBoreholesMapQueryOptions } from "../../../../api/borehole.ts";
import { TabType, useWorkflowMutation } from "./workflow.ts";

// No importActual: fetchApiV2.ts imports workflow.ts through useResetTabStatus, so the actual module
// would load workflow.ts with the real fetch before this mock is in place.
vi.mock("../../../../api/fetchApiV2.ts", () => ({ fetchApiV2Legacy: vi.fn(() => Promise.resolve()) }));

const mapQueryKey = filterBoreholesMapQueryOptions({ typeId: [20101001] }).queryKey;

const renderWorkflowMutation = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  queryClient.setQueryData(mapQueryKey, { type: "FeatureCollection", features: [] });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useWorkflowMutation(), { wrapper });
  const isMapDataInvalidated = () => queryClient.getQueryState(mapQueryKey)?.isInvalidated;
  return { result, isMapDataInvalidated };
};

describe("useWorkflowMutation", () => {
  afterEach(() => {
    cleanup();
  });

  it("invalidates the overview map data when the workflow status changes", async () => {
    const { result, isMapDataInvalidated } = renderWorkflowMutation();

    await result.current.updateWorkflow.mutateAsync({ boreholeId: 42, newStatus: WorkflowStatus.Published });

    await waitFor(() => expect(isMapDataInvalidated()).toBe(true));
  });

  it("keeps the overview map data when only a tab status changes", async () => {
    const { result, isMapDataInvalidated } = renderWorkflowMutation();

    await result.current.updateTabStatus.mutateAsync({
      boreholeId: 42,
      tab: TabType.Reviewed,
      changes: { general: true },
    });

    expect(isMapDataInvalidated()).toBe(false);
  });
});
