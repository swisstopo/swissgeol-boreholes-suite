import { restrictionCode, restrictionFreeCode, restrictionUntilCode } from "../../codelist.ts";
import { LegendSymbol, legendSymbols } from "./legendSymbols.ts";

// Order in which the legend cycles through its themes, also the accepted values of the `legend` URL parameter.
export const legendThemeKeys = ["purpose", "boreholeType", "restriction", "workflow", "length", "contents"] as const;

export type LegendThemeKey = (typeof legendThemeKeys)[number];

export type LegendLabel = { kind: "codelist"; codelistId: number } | { kind: "translation"; key: string };

export interface LegendEntry {
  key: string;
  label: LegendLabel;
  symbol: LegendSymbol;
  // Entries of different groups are separated by a line in the legend.
  group: number;
}

// The borehole attributes of a map feature that the legend themes classify.
export interface MapFeatureProperties {
  type: number | null;
  restriction: number | null;
}

export interface LegendTheme {
  key: LegendThemeKey;
  titleKey: string;
  // Themes showing attributes the anonymous view instance does not reveal are hidden there.
  visibleInAnonymousMode: boolean;
  entries: readonly LegendEntry[];
  classify: (properties: MapFeatureProperties) => LegendEntry;
}

const codelistEntry = (codelistId: number, symbol: LegendSymbol, group: number): LegendEntry => ({
  key: String(codelistId),
  label: { kind: "codelist", codelistId },
  symbol,
  group,
});

const notSpecifiedEntry = (symbol: LegendSymbol, group: number): LegendEntry => ({
  key: "notSpecified",
  label: { kind: "translation", key: "np" },
  symbol,
  group,
});

// Classifies by a codelist id. Ids without an entry, including null, fall back to the "not specified" entry.
const classifyByCodelistId = (entries: readonly LegendEntry[], fallback: LegendEntry) => {
  const entriesByCodelistId = new Map(
    entries.flatMap(entry => (entry.label.kind === "codelist" ? [[entry.label.codelistId, entry] as const] : [])),
  );
  return (codelistId: number | null) =>
    codelistId === null ? fallback : (entriesByCodelistId.get(codelistId) ?? fallback);
};

export const boreholeTypeCodes = {
  borehole: 20101001,
  virtualBorehole: 30000307,
  dynamicProbing: 20101002,
  trialPit: 20101003,
  outcrop: 20101006,
  other: 20101004,
  notSpecified: 20101005,
} as const;

const boreholeTypeNotSpecified = notSpecifiedEntry(legendSymbols.lightGreyDiamond, 1);
const boreholeTypeEntries = [
  codelistEntry(boreholeTypeCodes.borehole, legendSymbols.purpleHexagon, 0),
  codelistEntry(boreholeTypeCodes.virtualBorehole, legendSymbols.yellowPlus, 0),
  codelistEntry(boreholeTypeCodes.dynamicProbing, legendSymbols.redPentagon, 0),
  codelistEntry(boreholeTypeCodes.trialPit, legendSymbols.orangeTriangle, 0),
  codelistEntry(boreholeTypeCodes.outcrop, legendSymbols.pinkRotatedSquare, 0),
  codelistEntry(boreholeTypeCodes.other, legendSymbols.greyDiamond, 1),
  boreholeTypeNotSpecified,
];
const classifyBoreholeType = classifyByCodelistId(boreholeTypeEntries, boreholeTypeNotSpecified);

const restrictionNotSpecified = notSpecifiedEntry(legendSymbols.lightGreyDiamond, 1);
const restrictionEntries = [
  codelistEntry(restrictionFreeCode, legendSymbols.purpleHexagon, 0),
  codelistEntry(restrictionCode, legendSymbols.redCross, 0),
  codelistEntry(restrictionUntilCode, legendSymbols.orangeTriangle, 0),
  restrictionNotSpecified,
];
const classifyRestriction = classifyByCodelistId(restrictionEntries, restrictionNotSpecified);

// The themes without an entry here need map attributes the map endpoint does not deliver yet.
export const legendThemes: { readonly [K in LegendThemeKey]?: LegendTheme } = {
  boreholeType: {
    key: "boreholeType",
    titleKey: "boreholeType",
    visibleInAnonymousMode: true,
    entries: boreholeTypeEntries,
    classify: ({ type }) => classifyBoreholeType(type),
  },
  restriction: {
    key: "restriction",
    titleKey: "restriction",
    visibleInAnonymousMode: false,
    entries: restrictionEntries,
    classify: ({ restriction }) => classifyRestriction(restriction),
  },
};
