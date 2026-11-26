import { Style } from "ol/style";
import { theme } from "../../AppTheme.ts";
import { LegendSymbol } from "./legend/legendSymbols.ts";

/**
 * Marks a borehole on the map: hovered boreholes are outlined in the hover colour, the boreholes of a pinned popover
 * in the active colour.
 */
export type SymbolHighlight = "hover" | "active";

// Symbol paths are drawn in a 30 x 30 box. The padding leaves room for the shadow and the highlight outline.
const symbolBoxSize = 30;
const symbolCenter = symbolBoxSize / 2;
const shadowPadding = 5;
const imageSize = symbolBoxSize + 2 * shadowPadding;

const shadowOffsetY = 2;
const shadowBlur = 6;
// The shadow is cast by a slightly smaller copy of the symbol, so it shows mostly below it.
const shadowScale = 0.875;

// The outline is stroked below the symbol, so only its outer half shows as a ring that follows the symbol's shape.
export const highlightWidth = 12;
export const highlightColors: Record<SymbolHighlight, string> = {
  hover: theme.palette.map.hover,
  active: theme.palette.map.active,
};

// Highlighted symbols are drawn above the others, the hovered ones above all.
export const zIndexByHighlight: Record<SymbolHighlight | "none", number> = {
  none: 0,
  active: 1,
  hover: 2,
};

const pathCache = new Map<string, Path2D>();
const getPath = (path: string) => {
  let path2D = pathCache.get(path);
  if (!path2D) {
    path2D = new Path2D(path);
    pathCache.set(path, path2D);
  }
  return path2D;
};

// Draws the symbol into its 30 x 30 box. The context is already scaled by the pixel ratio; canvas shadows are not
// affected by that transform and need the pixel ratio themselves.
const drawSymbol = (
  context: CanvasRenderingContext2D,
  symbol: LegendSymbol,
  highlight: SymbolHighlight | null,
  pixelRatio: number,
) => {
  const outline = getPath(symbol.path);
  context.lineJoin = "round";

  if (highlight !== null) {
    context.strokeStyle = highlightColors[highlight];
    context.lineWidth = highlightWidth;
    context.stroke(outline);
  }

  context.save();
  context.shadowColor = symbol.shadow;
  context.shadowOffsetY = shadowOffsetY * pixelRatio;
  context.shadowBlur = shadowBlur * pixelRatio;
  context.translate(symbolCenter, symbolCenter);
  context.scale(shadowScale, shadowScale);
  context.translate(-symbolCenter, -symbolCenter);
  context.fillStyle = symbol.fill;
  context.fill(outline);
  context.restore();

  context.fillStyle = symbol.fill;
  context.fill(outline);

  context.strokeStyle = symbol.stroke;
  context.lineWidth = symbol.strokeWidth;
  if (symbol.strokeInside) {
    context.save();
    context.clip(outline);
    context.stroke(getPath(symbol.strokePath));
    context.restore();
  } else {
    context.stroke(getPath(symbol.strokePath));
  }

  context.strokeStyle = theme.palette.map.symbolHalo;
  context.lineWidth = symbol.haloWidth;
  context.stroke(getPath(symbol.haloPath));
};

// Drawing the paths for every borehole is too slow for tens of thousands of boreholes, so each symbol is drawn once
// per highlight and pixel ratio and then copied.
const symbolImageCache = new Map<LegendSymbol, Map<string, HTMLCanvasElement>>();
const getSymbolImage = (symbol: LegendSymbol, highlight: SymbolHighlight | null, pixelRatio: number) => {
  let images = symbolImageCache.get(symbol);
  if (!images) {
    images = new Map();
    symbolImageCache.set(symbol, images);
  }

  const imageKey = `${highlight ?? "none"}|${pixelRatio}`;
  let image = images.get(imageKey);
  if (!image) {
    image = document.createElement("canvas");
    image.width = Math.ceil(imageSize * pixelRatio);
    image.height = image.width;
    const context = image.getContext("2d");
    if (context) {
      context.scale(pixelRatio, pixelRatio);
      context.translate(shadowPadding, shadowPadding);
      drawSymbol(context, symbol, highlight, pixelRatio);
    }
    images.set(imageKey, image);
  }
  return image;
};

const createSymbolStyle = (symbol: LegendSymbol, highlight: SymbolHighlight | null) =>
  new Style({
    zIndex: zIndexByHighlight[highlight ?? "none"],
    renderer: ([x, y], { context, pixelRatio }) => {
      if (typeof x !== "number" || typeof y !== "number") return;
      const offset = (symbolCenter + shadowPadding) * pixelRatio;
      context.drawImage(getSymbolImage(symbol, highlight, pixelRatio), x - offset, y - offset);
    },
    hitDetectionRenderer: ([x, y], { context, pixelRatio }) => {
      if (typeof x !== "number" || typeof y !== "number") return;
      context.save();
      context.translate(x, y);
      context.scale(pixelRatio, pixelRatio);
      context.translate(-symbolCenter, -symbolCenter);
      context.fill(getPath(symbol.path));
      context.restore();
    },
  });

const symbolStyleCache = new Map<LegendSymbol, Map<SymbolHighlight | "none", Style>>();

/**
 * Returns the cached OpenLayers style that draws the symbol centred on a point geometry, outlined when highlighted.
 */
export const getSymbolStyle = (symbol: LegendSymbol, highlight: SymbolHighlight | null): Style => {
  let styles = symbolStyleCache.get(symbol);
  if (!styles) {
    styles = new Map();
    symbolStyleCache.set(symbol, styles);
  }

  const styleKey = highlight ?? "none";
  let style = styles.get(styleKey);
  if (!style) {
    style = createSymbolStyle(symbol, highlight);
    styles.set(styleKey, style);
  }
  return style;
};
