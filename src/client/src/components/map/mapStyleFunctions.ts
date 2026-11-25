import Feature, { FeatureLike } from "ol/Feature";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import { theme } from "../../AppTheme.ts";
import { LegendTheme, MapFeatureProperties } from "./legend/legendThemes.ts";
import { getSymbolStyle, SymbolHighlight } from "./mapSymbolStyle.ts";

const clusterStyleCache: Record<number, Style> = {};

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

const toCodelistId = (value: unknown) => (typeof value === "number" ? value : null);

export const readMapFeatureProperties = (feature: FeatureLike): MapFeatureProperties => ({
  type: toCodelistId(feature.get("type")),
  restriction: toCodelistId(feature.get("restriction")),
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

const clusterStrokeWidth = 8;

const getClusterRadius = (length: number) => 8 + length.toString().length * 2.5;

/**
 * Half the height of the drawn cluster circle, including its stroke.
 */
export const getClusterHalfHeight = (length: number) => getClusterRadius(length) + clusterStrokeWidth / 2;

export function clusterStyleFunction(length: number): Style {
  const circleSize = getClusterRadius(length);
  let clusterStyle = clusterStyleCache[circleSize];
  if (!clusterStyle) {
    clusterStyle = new Style({
      image: new Circle({
        radius: circleSize,
        stroke: new Stroke({
          color: theme.palette.map.clusterStroke,
          width: clusterStrokeWidth,
        }),
        fill: new Fill({
          color: theme.palette.map.clusterFill,
        }),
      }),
      text: new Text({
        text: length.toString(),
        scale: 1.5,
        fill: new Fill({
          color: theme.palette.map.clusterText,
        }),
      }),
    });
    clusterStyleCache[circleSize] = clusterStyle;
  }

  clusterStyle.getText()!.setText(length.toString());

  return clusterStyle;
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
