import { describe, expect, it } from "vitest";
import { restrictionCode, restrictionFreeCode, restrictionUntilCode } from "../../codelist.ts";
import { boreholeTypeCodes, LegendEntry, LegendTheme, LegendThemeKey, legendThemes } from "./legendThemes.ts";

const themeOf = (key: LegendThemeKey): LegendTheme => {
  const legendTheme = legendThemes[key];
  if (!legendTheme) throw new Error(`The legend theme '${key}' is not implemented.`);
  return legendTheme;
};

const boreholeType = themeOf("boreholeType");
const restriction = themeOf("restriction");

const codelistIdOf = (entry: LegendEntry) => (entry.label.kind === "codelist" ? entry.label.codelistId : null);

describe("borehole type theme", () => {
  const classify = (type: number | null) => boreholeType.classify({ type, restriction: null });

  it("has exactly one entry for every borehole type code except 'not specified'", () => {
    const codesWithEntry = Object.values(boreholeTypeCodes).filter(code => code !== boreholeTypeCodes.notSpecified);

    const entryCodes = boreholeType.entries.map(codelistIdOf).filter(code => code !== null);

    expect(entryCodes).toHaveLength(codesWithEntry.length);
    expect(new Set(entryCodes)).toEqual(new Set(codesWithEntry));
  });

  it("classifies every borehole type code into its own entry", () => {
    const codesWithEntry = Object.values(boreholeTypeCodes).filter(code => code !== boreholeTypeCodes.notSpecified);

    const entries = codesWithEntry.map(classify);

    expect(entries.map(codelistIdOf)).toEqual(codesWithEntry);
  });

  it.each([
    ["the 'not specified' code", boreholeTypeCodes.notSpecified],
    ["null", null],
    ["an unknown code", 99999999],
  ])("classifies %s as not specified", (_, type) => {
    expect(classify(type).key).toBe("notSpecified");
  });

  it("separates 'other' and 'not specified' from the borehole types", () => {
    const groups = boreholeType.entries.map(entry => [entry.key, entry.group]);

    expect(groups).toEqual([
      ["20101001", 0],
      ["30000307", 0],
      ["20101002", 0],
      ["20101003", 0],
      ["20101006", 0],
      ["20101004", 1],
      ["notSpecified", 1],
    ]);
  });
});

describe("restriction theme", () => {
  const classify = (restrictionId: number | null) => restriction.classify({ type: null, restriction: restrictionId });

  it.each([restrictionFreeCode, restrictionCode, restrictionUntilCode])(
    "classifies code %i into its own entry",
    code => {
      expect(codelistIdOf(classify(code))).toBe(code);
    },
  );

  it("has exactly one entry per restriction code and one for 'not specified'", () => {
    expect(restriction.entries.map(entry => entry.key)).toEqual([
      String(restrictionFreeCode),
      String(restrictionCode),
      String(restrictionUntilCode),
      "notSpecified",
    ]);
  });

  it("classifies null as not specified", () => {
    expect(classify(null).key).toBe("notSpecified");
  });

  it("gives every restriction value a different symbol", () => {
    const symbols = restriction.entries.map(entry => entry.symbol);

    expect(new Set(symbols).size).toBe(symbols.length);
  });
});
