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
  useLocation: vi.fn(() => ({ pathname: "/borehole/123/location" })),
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

  it("sets default title when boreholeName is undefined", () => {
    renderHook(() => useBoreholeDocumentTitle(undefined));

    expect(document.title).toBe(defaultTitle);
  });

  it("resets to default title on unmount", () => {
    const { unmount } = renderHook(() => useBoreholeDocumentTitle("My Borehole"));

    expect(document.title).toBe("My Borehole - Location | swissgeol boreholes");

    unmount();

    expect(document.title).toBe(defaultTitle);
  });

  it("handles different route segments", () => {
    vi.mocked(useLocation).mockReturnValue({ pathname: "/borehole/123/stratigraphy" } as ReturnType<
      typeof useLocation
    >);

    renderHook(() => useBoreholeDocumentTitle("Test Borehole"));

    expect(document.title).toBe("Test Borehole - Stratigraphy | swissgeol boreholes");
  });

  it("uses only borehole name when route has no translation key", () => {
    vi.mocked(useLocation).mockReturnValue({ pathname: "/borehole/123/unknown" } as ReturnType<typeof useLocation>);

    renderHook(() => useBoreholeDocumentTitle("Test Borehole"));

    expect(document.title).toBe("Test Borehole | swissgeol boreholes");
  });
});
