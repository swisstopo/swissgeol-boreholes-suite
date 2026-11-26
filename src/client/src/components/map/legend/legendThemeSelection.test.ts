import { describe, expect, it } from "vitest";
import { getAvailableLegendThemes, getNextLegendTheme, resolveLegendTheme } from "./legendThemeSelection.ts";
import { contentSegments, contentsLegendThemes } from "./legendThemes.ts";

const keysOf = (themes: readonly { key: string }[]) => themes.map(legendTheme => legendTheme.key);

describe("getAvailableLegendThemes", () => {
  it("offers all themes when signed in", () => {
    expect(keysOf(getAvailableLegendThemes(false))).toEqual([
      "purpose",
      "boreholeType",
      "restriction",
      "workflow",
      "length",
      "contents",
    ]);
  });

  it("hides the restriction and the workflow in anonymous mode", () => {
    expect(keysOf(getAvailableLegendThemes(true))).toEqual(["purpose", "boreholeType", "length", "contents"]);
  });
});

describe("resolveLegendTheme", () => {
  const signedIn = getAvailableLegendThemes(false);
  const anonymous = getAvailableLegendThemes(true);

  it("returns the requested theme when it is available", () => {
    expect(resolveLegendTheme("workflow", signedIn, "profile").key).toBe("workflow");
  });

  it("falls back to the first available theme when no theme is requested", () => {
    expect(resolveLegendTheme(null, signedIn, "profile").key).toBe("purpose");
  });

  it.each(["restriction", "workflow"] as const)(
    "falls back to the first available theme for %s in anonymous mode",
    requested => {
      expect(resolveLegendTheme(requested, anonymous, "profile").key).toBe("purpose");
    },
  );

  it.each(contentSegments)("returns the contents theme of the %s segment", segment => {
    expect(resolveLegendTheme("contents", signedIn, segment)).toBe(contentsLegendThemes[segment]);
    expect(resolveLegendTheme("contents", anonymous, segment)).toBe(contentsLegendThemes[segment]);
  });

  it("ignores the segment for the other themes", () => {
    expect(resolveLegendTheme("length", signedIn, "photos").key).toBe("length");
  });
});

describe("getNextLegendTheme", () => {
  const signedIn = getAvailableLegendThemes(false);

  it("cycles through the available themes and wraps around", () => {
    const keys = Array.from({ length: signedIn.length }).reduce<(typeof signedIn)[number][]>(
      visited => [...visited, getNextLegendTheme(visited[visited.length - 1], signedIn)],
      [signedIn[0]],
    );

    expect(keysOf(keys)).toEqual([
      "purpose",
      "boreholeType",
      "restriction",
      "workflow",
      "length",
      "contents",
      "purpose",
    ]);
  });

  it.each(["documents", "photos"] as const)("wraps from the %s segment to the first theme", segment => {
    expect(getNextLegendTheme(contentsLegendThemes[segment], signedIn).key).toBe("purpose");
  });

  it("continues after a theme before the contents theme", () => {
    expect(getNextLegendTheme(signedIn[4], signedIn).key).toBe("contents");
  });

  it("skips the hidden themes in anonymous mode", () => {
    const anonymous = getAvailableLegendThemes(true);

    expect(getNextLegendTheme(anonymous[1], anonymous).key).toBe("length");
  });

  it("stays on the only theme of a single-theme list", () => {
    const [only] = getAvailableLegendThemes(true);

    expect(getNextLegendTheme(only, [only]).key).toBe(only.key);
  });
});
