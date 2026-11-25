import { describe, expect, it } from "vitest";
import { WorkflowStatus } from "../../../api/generated";
import { restrictionCode, restrictionFreeCode, restrictionUntilCode } from "../../codelist.ts";
import {
  boreholeTypeCodes,
  LegendEntry,
  LegendTheme,
  LegendThemeKey,
  legendThemes,
  MapFeatureProperties,
  purposeCodes,
} from "./legendThemes.ts";

const themeOf = (key: LegendThemeKey): LegendTheme => {
  const legendTheme = legendThemes[key];
  if (!legendTheme) throw new Error(`The legend theme '${key}' is not implemented.`);
  return legendTheme;
};

const boreholeType = themeOf("boreholeType");
const restriction = themeOf("restriction");

const codelistIdOf = (entry: LegendEntry) => (entry.label.kind === "codelist" ? entry.label.codelistId : null);

const noProperties: MapFeatureProperties = {
  type: null,
  restriction: null,
  purpose: null,
  totalDepth: null,
  workflowStatus: null,
  hasRequestedChanges: false,
};

describe("borehole type theme", () => {
  const classify = (type: number | null) => boreholeType.classify({ ...noProperties, type });

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
  const classify = (restrictionId: number | null) =>
    restriction.classify({ ...noProperties, restriction: restrictionId });

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

const purpose = themeOf("purpose");
const workflow = themeOf("workflow");
const length = themeOf("length");

describe("purpose theme", () => {
  const classify = (purposeId: number | null) => purpose.classify({ ...noProperties, purpose: purposeId });

  it("has exactly one entry for every purpose code except 'not specified'", () => {
    const codesWithEntry = Object.values(purposeCodes).filter(code => code !== purposeCodes.notSpecified);

    const entryCodes = purpose.entries.map(codelistIdOf).filter(code => code !== null);

    expect(entryCodes).toHaveLength(codesWithEntry.length);
    expect(new Set(entryCodes)).toEqual(new Set(codesWithEntry));
  });

  it.each([
    ["the 'not specified' code", purposeCodes.notSpecified],
    ["null", null],
    ["an unknown code", 99999999],
  ])("classifies %s as not specified", (_, purposeId) => {
    expect(classify(purposeId).key).toBe("notSpecified");
  });

  it("groups the purposes as in the design", () => {
    const groups = purpose.entries.map(entry => entry.group);

    expect(groups).toEqual([0, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 7, 7]);
  });

  it("gives every purpose a different symbol", () => {
    const symbols = purpose.entries.map(entry => entry.symbol);

    expect(new Set(symbols).size).toBe(symbols.length);
  });
});

describe("workflow theme", () => {
  const classify = (workflowStatus: WorkflowStatus | null, hasRequestedChanges = false) =>
    workflow.classify({ ...noProperties, workflowStatus, hasRequestedChanges }).key;

  it.each([
    ["Draft", "Draft"],
    ["InReview", "InReview"],
    ["Reviewed", "Reviewed"],
    ["Published", "Published"],
  ] as const)("classifies the status %s", (status, key) => {
    expect(classify(status)).toBe(key);
  });

  it.each(["Draft", "InReview", "Reviewed", "Published"] as const)(
    "classifies requested changes before the status %s",
    status => {
      expect(classify(status, true)).toBe("changesRequested");
    },
  );

  it("classifies a borehole without workflow as draft", () => {
    expect(classify(null)).toBe("Draft");
  });

  it("is hidden in anonymous mode", () => {
    expect(workflow.visibleInAnonymousMode).toBe(false);
  });
});

describe("length theme", () => {
  const classify = (totalDepth: number | null) => length.classify({ ...noProperties, totalDepth }).key;

  it.each([
    [0, "below1"],
    [0.99, "below1"],
    [1, "1to10"],
    [9.99, "1to10"],
    [10, "10to20"],
    [19.99, "10to20"],
    [20, "20to100"],
    [100, "100to250"],
    [250, "250to500"],
    [500, "500to1000"],
    [999.99, "500to1000"],
    [1000, "above1000"],
    [4500, "above1000"],
    [null, "notSpecified"],
  ])("classifies %s m as %s", (totalDepth, key) => {
    expect(classify(totalDepth)).toBe(key);
  });

  it("separates 'not specified' from the intervals", () => {
    expect(length.entries.map(entry => entry.group)).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 1]);
  });

  it("labels the intervals with their bounds", () => {
    expect(length.entries.map(entry => entry.label)).toEqual([
      { kind: "translation", key: "legendLengthBelow", values: { max: 1 } },
      { kind: "translation", key: "legendLengthBetween", values: { min: 1, max: 10 } },
      { kind: "translation", key: "legendLengthBetween", values: { min: 10, max: 20 } },
      { kind: "translation", key: "legendLengthBetween", values: { min: 20, max: 100 } },
      { kind: "translation", key: "legendLengthBetween", values: { min: 100, max: 250 } },
      { kind: "translation", key: "legendLengthBetween", values: { min: 250, max: 500 } },
      { kind: "translation", key: "legendLengthBetween", values: { min: 500, max: 1000 } },
      { kind: "translation", key: "legendLengthAbove", values: { min: 1000 } },
      { kind: "translation", key: "np" },
    ]);
  });
});
