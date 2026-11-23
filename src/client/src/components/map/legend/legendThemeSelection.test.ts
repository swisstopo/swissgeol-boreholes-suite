import { describe, expect, it } from "vitest";
import { getAvailableLegendThemes, getNextLegendTheme, resolveLegendTheme } from "./legendThemeSelection.ts";

const keysOf = (themes: readonly { key: string }[]) => themes.map(legendTheme => legendTheme.key);

describe("getAvailableLegendThemes", () => {
  it("offers borehole type and restriction when signed in", () => {
    expect(keysOf(getAvailableLegendThemes(false))).toEqual(["boreholeType", "restriction"]);
  });

  it("hides the restriction in anonymous mode", () => {
    expect(keysOf(getAvailableLegendThemes(true))).toEqual(["boreholeType"]);
  });
});

describe("resolveLegendTheme", () => {
  const signedIn = getAvailableLegendThemes(false);
  const anonymous = getAvailableLegendThemes(true);

  it("returns the requested theme when it is available", () => {
    expect(resolveLegendTheme("restriction", signedIn).key).toBe("restriction");
  });

  it.each([
    ["no theme", null],
    ["a theme without map data yet", "purpose" as const],
  ])("falls back to the first available theme for %s", (_, requested) => {
    expect(resolveLegendTheme(requested, signedIn).key).toBe("boreholeType");
  });

  it("falls back to the first available theme for a theme hidden in anonymous mode", () => {
    expect(resolveLegendTheme("restriction", anonymous).key).toBe("boreholeType");
  });
});

describe("getNextLegendTheme", () => {
  const signedIn = getAvailableLegendThemes(false);

  it("cycles through the available themes and wraps around", () => {
    const second = getNextLegendTheme(signedIn[0], signedIn);
    const third = getNextLegendTheme(second, signedIn);

    expect([second.key, third.key]).toEqual(["restriction", "boreholeType"]);
  });

  it("stays on the only theme in anonymous mode", () => {
    const anonymous = getAvailableLegendThemes(true);

    expect(getNextLegendTheme(anonymous[0], anonymous).key).toBe("boreholeType");
  });
});
