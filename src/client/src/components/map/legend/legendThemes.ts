import { restrictionCode, restrictionFreeCode, restrictionUntilCode } from "../../codelist.ts";
import { WorkflowStatus } from "../../../api/generated";
import { LegendSymbol, legendSymbols } from "./legendSymbols.ts";

// Order in which the legend cycles through its themes, also the accepted values of the `legend` URL parameter.
export const legendThemeKeys = ["purpose", "boreholeType", "restriction", "workflow", "length", "contents"] as const;

export type LegendThemeKey = (typeof legendThemeKeys)[number];

export type LegendLabel =
  | { kind: "codelist"; codelistId: number }
  | { kind: "translation"; key: string; values?: Readonly<Record<string, number>> };

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
  purpose: number | null;
  totalDepth: number | null;
  workflowStatus: WorkflowStatus | null;
  hasRequestedChanges: boolean;
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

export const purposeCodes = {
  contaminatedSites: 22103003,
  naturalHazards: 22103008,
  geotechnics: 22103001,
  tunnelExploration: 30000006,
  hydrogeology: 22103004,
  groundwater: 30000007,
  drinkingWater: 30000008,
  mineralWater: 22103005,
  thermalWater: 30000009,
  geothermalExploration: 22103002,
  geothermalProduction: 30000001,
  geothermalInjection: 30000000,
  boreholeHeatExchanger: 30000002,
  carbonCaptureExploration: 30000003,
  carbonCaptureProduction: 30000005,
  carbonCaptureInjection: 30000004,
  mineralResources: 22103006,
  hydrocarbonExploration: 22103007,
  hydrocarbonProduction: 30000011,
  hydrocarbonInjection: 30000010,
  scientificExploration: 30000012,
  research: 22103009,
  other: 22103010,
  notSpecified: 22103011,
} as const;

const purposeNotSpecified = notSpecifiedEntry(legendSymbols.lightGreyDiamond, 7);
const purposeEntries = [
  codelistEntry(purposeCodes.contaminatedSites, legendSymbols.pinkCross, 0),
  codelistEntry(purposeCodes.naturalHazards, legendSymbols.magenta1Square, 1),
  codelistEntry(purposeCodes.geotechnics, legendSymbols.magenta2Square, 1),
  codelistEntry(purposeCodes.tunnelExploration, legendSymbols.magenta3Square, 1),
  codelistEntry(purposeCodes.hydrogeology, legendSymbols.violet1Hexagon, 2),
  codelistEntry(purposeCodes.groundwater, legendSymbols.violet2Hexagon, 2),
  codelistEntry(purposeCodes.drinkingWater, legendSymbols.violet3Hexagon, 2),
  codelistEntry(purposeCodes.mineralWater, legendSymbols.violet4Hexagon, 2),
  codelistEntry(purposeCodes.thermalWater, legendSymbols.violet5Hexagon, 2),
  codelistEntry(purposeCodes.geothermalExploration, legendSymbols.crimson1Pentagon, 3),
  codelistEntry(purposeCodes.geothermalProduction, legendSymbols.crimson2Pentagon, 3),
  codelistEntry(purposeCodes.geothermalInjection, legendSymbols.crimson3Pentagon, 3),
  codelistEntry(purposeCodes.boreholeHeatExchanger, legendSymbols.crimson4Pentagon, 3),
  codelistEntry(purposeCodes.carbonCaptureExploration, legendSymbols.amber1InvertedTriangle, 4),
  codelistEntry(purposeCodes.carbonCaptureProduction, legendSymbols.amber2InvertedTriangle, 4),
  codelistEntry(purposeCodes.carbonCaptureInjection, legendSymbols.amber3InvertedTriangle, 4),
  codelistEntry(purposeCodes.mineralResources, legendSymbols.brown1RotatedSquare, 5),
  codelistEntry(purposeCodes.hydrocarbonExploration, legendSymbols.brown2RotatedSquare, 5),
  codelistEntry(purposeCodes.hydrocarbonProduction, legendSymbols.brown3RotatedSquare, 5),
  codelistEntry(purposeCodes.hydrocarbonInjection, legendSymbols.brown4RotatedSquare, 5),
  codelistEntry(purposeCodes.scientificExploration, legendSymbols.ochrePlus, 6),
  codelistEntry(purposeCodes.research, legendSymbols.brown4Plus, 6),
  codelistEntry(purposeCodes.other, legendSymbols.greyDiamond, 7),
  purposeNotSpecified,
];
const classifyPurpose = classifyByCodelistId(purposeEntries, purposeNotSpecified);

const translationEntry = (key: string, labelKey: string, symbol: LegendSymbol, group: number): LegendEntry => ({
  key,
  label: { kind: "translation", key: labelKey },
  symbol,
  group,
});

const workflowStatusEntries: Record<WorkflowStatus, LegendEntry> = {
  Draft: translationEntry("Draft", "statuses.Draft", legendSymbols.yellowRotatedSquare, 0),
  InReview: translationEntry("InReview", "statuses.InReview", legendSymbols.orangeTriangle, 0),
  Reviewed: translationEntry("Reviewed", "statuses.Reviewed", legendSymbols.pinkSquare, 0),
  Published: translationEntry("Published", "statuses.Published", legendSymbols.purpleHexagon, 0),
};
const changesRequestedEntry = translationEntry("changesRequested", "changesRequested", legendSymbols.redCross, 0);

// Requested changes take precedence over the status. A borehole without workflow is a draft, the initial status.
const classifyWorkflow = ({ workflowStatus, hasRequestedChanges }: MapFeatureProperties) =>
  hasRequestedChanges ? changesRequestedEntry : workflowStatusEntries[workflowStatus ?? "Draft"];

interface LengthInterval {
  key: string;
  // Lower bound, included.
  min: number;
  // Upper bound, excluded.
  max: number;
  symbol: LegendSymbol;
}

const lengthIntervals: readonly LengthInterval[] = [
  { key: "below1", min: 0, max: 1, symbol: legendSymbols.depth1InvertedTriangle },
  { key: "1to10", min: 1, max: 10, symbol: legendSymbols.depth2InvertedTriangle },
  { key: "10to20", min: 10, max: 20, symbol: legendSymbols.depth3InvertedTriangle },
  { key: "20to100", min: 20, max: 100, symbol: legendSymbols.depth4InvertedTriangle },
  { key: "100to250", min: 100, max: 250, symbol: legendSymbols.depth5InvertedTriangle },
  { key: "250to500", min: 250, max: 500, symbol: legendSymbols.depth6InvertedTriangle },
  { key: "500to1000", min: 500, max: 1000, symbol: legendSymbols.depth7InvertedTriangle },
  { key: "above1000", min: 1000, max: Number.POSITIVE_INFINITY, symbol: legendSymbols.depth8InvertedTriangle },
];

const lengthLabel = ({ min, max }: LengthInterval): LegendLabel => {
  if (min === 0) return { kind: "translation", key: "legendLengthBelow", values: { max } };
  if (max === Number.POSITIVE_INFINITY) return { kind: "translation", key: "legendLengthAbove", values: { min } };
  return { kind: "translation", key: "legendLengthBetween", values: { min, max } };
};

const lengthEntries = lengthIntervals.map(
  (interval): LegendEntry => ({ key: interval.key, label: lengthLabel(interval), symbol: interval.symbol, group: 0 }),
);
const lengthNotSpecified = notSpecifiedEntry(legendSymbols.lightGreyDiamond, 1);

// The first interval also takes negative lengths, which the data should not contain.
const classifyLength = (totalDepth: number | null) => {
  if (totalDepth === null) return lengthNotSpecified;
  const index = lengthIntervals.findIndex(interval => totalDepth < interval.max);
  return lengthEntries[index];
};

// The themes without an entry here need map attributes the map endpoint does not deliver yet.
export const legendThemes: { readonly [K in LegendThemeKey]?: LegendTheme } = {
  purpose: {
    key: "purpose",
    titleKey: "purpose",
    visibleInAnonymousMode: true,
    entries: purposeEntries,
    classify: ({ purpose }) => classifyPurpose(purpose),
  },
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
  workflow: {
    key: "workflow",
    titleKey: "workflowStatus",
    visibleInAnonymousMode: false,
    entries: [...Object.values(workflowStatusEntries), changesRequestedEntry],
    classify: classifyWorkflow,
  },
  length: {
    key: "length",
    titleKey: "boreholeLength",
    visibleInAnonymousMode: true,
    entries: [...lengthEntries, lengthNotSpecified],
    classify: ({ totalDepth }) => classifyLength(totalDepth),
  },
};
