import Feature, { FeatureLike } from "ol/Feature";
import { Circle, Fill, Stroke, Style } from "ol/style";
import { WorkflowStatus } from "../../api/generated";
import { theme } from "../../AppTheme.ts";
import { LegendTheme, MapFeatureProperties } from "./legend/legendThemes.ts";
import { getFeatureBoreholes } from "./locationBadges.ts";
import { getBadgeStyle } from "./mapBadgeStyle.ts";
import { getSymbolStyle, SymbolHighlight } from "./mapSymbolStyle.ts";

/**
 * The boreholes marked on the map. A borehole in both sets is shown as hovered.
 */
export interface BoreholeHighlights {
  hovered: ReadonlySet<number>;
  active: ReadonlySet<number>;
}

export const noBoreholeHighlights: BoreholeHighlights = { hovered: new Set(), active: new Set() };

export const drawStyle = new Style({
  fill: new Fill({
    color: theme.palette.map.drawFill,
  }),
  stroke: new Stroke({
    color: theme.palette.map.drawStroke,
    width: 3,
  }),
});

const toNumberOrNull = (value: unknown) => (typeof value === "number" ? value : null);

// Typed as a record so the compiler flags a status missing from the generated union.
const workflowStatusSet: Record<WorkflowStatus, true> = {
  Draft: true,
  InReview: true,
  Reviewed: true,
  Published: true,
};
const isWorkflowStatus = (value: unknown): value is WorkflowStatus =>
  typeof value === "string" && Object.hasOwn(workflowStatusSet, value);
const toWorkflowStatus = (value: unknown): WorkflowStatus | null => (isWorkflowStatus(value) ? value : null);

export const readMapFeatureProperties = (feature: FeatureLike): MapFeatureProperties => ({
  type: toNumberOrNull(feature.get("type")),
  restriction: toNumberOrNull(feature.get("restriction")),
  purpose: toNumberOrNull(feature.get("purpose")),
  totalDepth: toNumberOrNull(feature.get("totalDepth")),
  workflowStatus: toWorkflowStatus(feature.get("workflowStatus")),
  hasRequestedChanges: feature.get("hasRequestedChanges") === true,
});

const getHighlight = (id: number, highlights: BoreholeHighlights): SymbolHighlight | null => {
  if (highlights.hovered.has(id)) return "hover";
  if (highlights.active.has(id)) return "active";
  return null;
};

/**
 * Styles a borehole with the symbol of its value in the active legend theme, outlined when it is highlighted. Returns
 * cached styles only.
 */
export function boreholeStyleFunction(
  feature: FeatureLike,
  legendTheme: LegendTheme,
  highlights: BoreholeHighlights,
): Style {
  const { symbol } = legendTheme.classify(readMapFeatureProperties(feature));
  return getSymbolStyle(symbol, getHighlight(feature.get("id") as number, highlights));
}

const idOf = (feature: FeatureLike) => feature.get("id") as number;

// A badge takes the strongest highlight of its boreholes.
const getBadgeHighlight = (
  boreholes: readonly FeatureLike[],
  highlights: BoreholeHighlights,
): SymbolHighlight | null => {
  if (boreholes.some(borehole => highlights.hovered.has(idOf(borehole)))) return "hover";
  if (boreholes.some(borehole => highlights.active.has(idOf(borehole)))) return "active";
  return null;
};

/**
 * Styles a feature of the point layer: a borehole with its symbol, or a badge of the boreholes at one location with
 * their number. A badge takes the strongest highlight of its boreholes. Returns cached styles only.
 */
export function locationStyleFunction(
  feature: FeatureLike,
  legendTheme: LegendTheme,
  highlights: BoreholeHighlights,
): Style {
  const boreholes = getFeatureBoreholes(feature);
  if (boreholes.length === 1) return boreholeStyleFunction(boreholes[0], legendTheme, highlights);
  return getBadgeStyle(boreholes.length, getBadgeHighlight(boreholes, highlights));
}

/**
 * Styles a cluster as a badge with the number of its boreholes. It is outlined only while it is hovered itself, not
 * when its boreholes are highlighted elsewhere. A cluster with a single borehole is drawn as that borehole, so a symbol
 * always stands for one borehole and a badge for several. Returns cached styles only.
 */
export function clusterStyleFunction(
  cluster: FeatureLike,
  legendTheme: LegendTheme,
  highlights: BoreholeHighlights,
  hoveredCluster: FeatureLike | null,
): Style {
  const boreholes = getFeatureBoreholes(cluster);
  if (boreholes.length === 1) return boreholeStyleFunction(boreholes[0], legendTheme, highlights);
  return getBadgeStyle(boreholes.length, cluster === hoveredCluster ? "hover" : null);
}

export function detailMapStyleFunction(feature: Feature, highlighted: number[]): Style[] {
  const selected = highlighted?.includes(feature.get("id") as number);

  const conf = {
    image: new Circle({
      radius: selected ? 10 : 6,
      fill: selected
        ? new Fill({ color: theme.palette.map.detailSelectedFill })
        : new Fill({ color: theme.palette.map.detailUnselectedFill }),
      stroke: new Stroke({ color: "black", width: 1 }),
    }),
  };

  return [new Style(conf)];
}
