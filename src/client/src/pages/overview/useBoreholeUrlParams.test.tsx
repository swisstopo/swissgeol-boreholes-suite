// @vitest-environment jsdom
import { FC, PropsWithChildren } from "react";
import { act, renderHook } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SessionKeys } from "./SessionKey.ts";
import { useBoreholeUrlParamsState } from "./useBoreholeUrlParams.ts";

const Wrapper: FC<PropsWithChildren> = ({ children }) => (
  <NuqsTestingAdapter searchParams="?page=3&pageSize=10&direction=DESC" hasMemory>
    {children}
  </NuqsTestingAdapter>
);

// Leaving the overview makes nuqs drop its pending URL update and render the last flushed URL,
// which can be a page behind what was shown. showPage(2) after leaving simulates that render.
const showPage = async (setQueryState: ReturnType<typeof useBoreholeUrlParamsState>["setQueryState"], page: number) => {
  await act(async () => {
    await setQueryState({ page });
  });
};

describe("useBoreholeUrlParamsState", () => {
  beforeEach(() => {
    sessionStorage.clear();
    globalThis.history.replaceState(null, "", "/");
  });

  afterEach(() => {
    globalThis.history.replaceState(null, "", "/");
  });

  it("persists the table state shown on the overview, not the one rendered while navigating away", async () => {
    const { result } = renderHook(() => useBoreholeUrlParamsState(), { wrapper: Wrapper });

    globalThis.history.pushState(null, "", "/1000013/location");
    await showPage(result.current.setQueryState, 2);
    result.current.saveTableParamsInSession();

    expect(sessionStorage.getItem(SessionKeys.page)).toBe("3");
    expect(sessionStorage.getItem(SessionKeys.pageSize)).toBe("10");
    expect(sessionStorage.getItem(SessionKeys.direction)).toBe("DESC");
  });

  it("persists the legend theme, content segment and expanded state shown on the overview", async () => {
    const { result } = renderHook(() => useBoreholeUrlParamsState(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.setQueryState({ legend: "contents", legendContent: "photos", legendExpanded: false });
    });
    result.current.saveLegendParamsInSession();

    expect(sessionStorage.getItem(SessionKeys.legend)).toBe("contents");
    expect(sessionStorage.getItem(SessionKeys.legendContent)).toBe("photos");
    expect(sessionStorage.getItem(SessionKeys.legendExpanded)).toBe("false");
  });

  it("restores the legend theme, content segment and expanded state from the session when the URL has none", async () => {
    sessionStorage.setItem(SessionKeys.legend, "contents");
    sessionStorage.setItem(SessionKeys.legendContent, "documents");
    sessionStorage.setItem(SessionKeys.legendExpanded, "false");
    const { result } = renderHook(() => useBoreholeUrlParamsState(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.restoreLegendParamsFromSession();
    });

    expect(result.current.legend).toBe("contents");
    expect(result.current.legendContent).toBe("documents");
    expect(result.current.legendExpanded).toBe(false);
  });

  it("keeps the legend expanded on the profile segment when the session holds no state for it", async () => {
    const { result } = renderHook(() => useBoreholeUrlParamsState(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.restoreLegendParamsFromSession();
    });

    expect(result.current.legendExpanded).toBe(true);
    expect(result.current.legendContent).toBe("profile");
  });

  it("keeps the legend params of the URL instead of the ones in the session", async () => {
    sessionStorage.setItem(SessionKeys.legend, "restriction");
    sessionStorage.setItem(SessionKeys.legendContent, "photos");
    sessionStorage.setItem(SessionKeys.legendExpanded, "true");
    globalThis.history.replaceState(null, "", "/?legend=boreholeType&legendContent=documents&legendExpanded=false");
    const { result } = renderHook(() => useBoreholeUrlParamsState(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.restoreLegendParamsFromSession();
    });

    expect(result.current.legend).toBeNull();
    expect(result.current.legendContent).toBe("profile");
    expect(result.current.legendExpanded).toBe(true);
  });

  it("persists table state changes made on the overview", async () => {
    const { result } = renderHook(() => useBoreholeUrlParamsState(), { wrapper: Wrapper });

    await showPage(result.current.setQueryState, 2);
    result.current.saveTableParamsInSession();

    expect(sessionStorage.getItem(SessionKeys.page)).toBe("2");
  });
});
