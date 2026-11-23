import Feature, { FeatureLike } from "ol/Feature";
import { Circle, Fill, Stroke, Style, Text } from "ol/style";
import { theme } from "../../AppTheme.ts";
import { LegendSymbol } from "./legend/legendSymbols.ts";
import { LegendTheme, MapFeatureProperties } from "./legend/legendThemes.ts";
import { getSymbolStyle } from "./mapSymbolStyle.ts";

const clusterStyleCache: Record<number, Style> = {};

const innerSelectedStyle = new Style({
  image: new Circle({
    radius: 13,
    fill: new Fill({ color: theme.palette.map.selectedFill }),
    stroke: new Stroke({
      color: theme.palette.map.selectedStroke,
      width: 1,
    }),
  }),
});

const outerSelectedStyle = new Style({
  image: new Circle({
    radius: 14,
    stroke: new Stroke({
      color: theme.palette.map.selectedOuterStroke,
      width: 1,
    }),
  }),
});

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

const readMapFeatureProperties = (feature: FeatureLike): MapFeatureProperties => ({
  type: toCodelistId(feature.get("type")),
  restriction: toCodelistId(feature.get("restriction")),
});

const highlightedStylesCache = new Map<LegendSymbol, Style[]>();
const getHighlightedStyles = (symbol: LegendSymbol) => {
  let styles = highlightedStylesCache.get(symbol);
  if (!styles) {
    styles = [innerSelectedStyle, outerSelectedStyle, getSymbolStyle(symbol)];
    highlightedStylesCache.set(symbol, styles);
  }
  return styles;
};

/**
 * Styles a borehole with the symbol of its value in the active legend theme. Returns cached styles only.
 */
export function boreholeStyleFunction(
  feature: FeatureLike,
  legendTheme: LegendTheme,
  highlighted: number[],
): Style | Style[] {
  const { symbol } = legendTheme.classify(readMapFeatureProperties(feature));
  const isHighlighted = highlighted.includes(feature.get("id") as number);
  return isHighlighted ? getHighlightedStyles(symbol) : getSymbolStyle(symbol);
}

export function clusterStyleFunction(length: number): Style {
  const circleSize = 8 + length.toString().length * 2.5;
  let clusterStyle = clusterStyleCache[circleSize];
  if (!clusterStyle) {
    clusterStyle = new Style({
      image: new Circle({
        radius: circleSize,
        stroke: new Stroke({
          color: theme.palette.map.clusterStroke,
          width: 8,
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
