// @vitest-environment jsdom
import { useLocation } from "react-router";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useBoreholeDocumentTitle } from "./useDocumentTitle";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("react-router", () => ({
  useLocation: vi.fn(() => ({ pathname: "/45084/location" })),
}));

describe("useBoreholeDocumentTitle", () => {
  const defaultTitle = "swissgeol boreholes";

  beforeEach(() => {
    document.title = defaultTitle;
  });

  afterEach(() => {
    document.title = defaultTitle;
  });

  it("sets document title with borehole name and tab name", () => {
    renderHook(() => useBoreholeDocumentTitle("My Borehole"));

    expect(document.title).toBe("My Borehole - Location | swissgeol boreholes");
  });

  it("sets tab name when boreholeName is undefined", () => {
    renderHook(() => useBoreholeDocumentTitle(undefined));

    expect(document.title).toBe("Location | swissgeol boreholes");
  });

  it("resets to default title on unmount", () => {
    const { unmount } = renderHook(() => useBoreholeDocumentTitle("My Borehole"));

    expect(document.title).toBe("My Borehole - Location | swissgeol boreholes");

    unmount();

    expect(document.title).toBe(defaultTitle);
  });

  it("handles stratigraphy route", () => {
    vi.mocked(useLocation).mockReturnValue({ pathname: "/45084/stratigraphy/45822#lithology" } as ReturnType<
      typeof useLocation
    >);
    renderHook(() => useBoreholeDocumentTitle("Test Borehole"));
    expect(document.title).toBe("Test Borehole - Stratigraphy | swissgeol boreholes");
  });

  it("handles hydrotest route", () => {
    vi.mocked(useLocation).mockReturnValue({ pathname: "/45084/hydrogeology/hydrotest" } as ReturnType<
      typeof useLocation
    >);
    renderHook(() => useBoreholeDocumentTitle("Test Borehole"));
    expect(document.title).toBe("Test Borehole - Hydrotest | swissgeol boreholes");
  });

  it("uses only borehole name when URL has no tab segment", () => {
    vi.mocked(useLocation).mockReturnValue({ pathname: "/123" } as ReturnType<typeof useLocation>);
    renderHook(() => useBoreholeDocumentTitle("Test Borehole"));
    expect(document.title).toBe("Test Borehole | swissgeol boreholes");
  });
});
