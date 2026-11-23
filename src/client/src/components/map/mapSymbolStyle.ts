import { Style } from "ol/style";
import { theme } from "../../AppTheme.ts";
import { LegendSymbol } from "./legend/legendSymbols.ts";

// Symbol paths are drawn in a 30 x 30 box. The padding leaves room for the shadow.
const symbolBoxSize = 30;
const symbolCenter = symbolBoxSize / 2;
const shadowPadding = 5;
const imageSize = symbolBoxSize + 2 * shadowPadding;

const shadowOffsetY = 2;
const shadowBlur = 6;
// The shadow is cast by a slightly smaller copy of the symbol, so it shows mostly below it.
const shadowScale = 0.875;

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
const drawSymbol = (context: CanvasRenderingContext2D, symbol: LegendSymbol, pixelRatio: number) => {
  const outline = getPath(symbol.path);
  context.lineJoin = "round";

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
// per pixel ratio and then copied.
const symbolImageCache = new Map<LegendSymbol, Map<number, HTMLCanvasElement>>();
const getSymbolImage = (symbol: LegendSymbol, pixelRatio: number) => {
  let imagesByPixelRatio = symbolImageCache.get(symbol);
  if (!imagesByPixelRatio) {
    imagesByPixelRatio = new Map();
    symbolImageCache.set(symbol, imagesByPixelRatio);
  }

  let image = imagesByPixelRatio.get(pixelRatio);
  if (!image) {
    image = document.createElement("canvas");
    image.width = Math.ceil(imageSize * pixelRatio);
    image.height = image.width;
    const context = image.getContext("2d");
    if (context) {
      context.scale(pixelRatio, pixelRatio);
      context.translate(shadowPadding, shadowPadding);
      drawSymbol(context, symbol, pixelRatio);
    }
    imagesByPixelRatio.set(pixelRatio, image);
  }
  return image;
};

const symbolStyleCache = new Map<LegendSymbol, Style>();

/**
 * Returns the cached OpenLayers style that draws the symbol centred on a point geometry.
 */
export const getSymbolStyle = (symbol: LegendSymbol): Style => {
  let style = symbolStyleCache.get(symbol);
  if (!style) {
    style = new Style({
      renderer: ([x, y], { context, pixelRatio }) => {
        if (typeof x !== "number" || typeof y !== "number") return;
        const offset = (symbolCenter + shadowPadding) * pixelRatio;
        context.drawImage(getSymbolImage(symbol, pixelRatio), x - offset, y - offset);
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
    symbolStyleCache.set(symbol, style);
  }
  return style;
};
