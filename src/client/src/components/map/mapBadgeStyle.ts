import { Style } from "ol/style";
import { theme } from "../../AppTheme.ts";
import { highlightColors, highlightWidth, SymbolHighlight, zIndexByHighlight } from "./mapSymbolStyle.ts";

// A badge is a pill with the number of its boreholes. Sizes are CSS pixels.
const badgeFont = "700 14px Inter";
const pillHeight = 30;
const minPillWidth = 30;
const textPadding = 20;
const borderWidth = 4;
// The alphabetic baseline of the number below the centre of the badge, which centres the digits.
const textBaselineOffset = 5;
const shadowOffsetY = 2;
const shadowBlur = 6;
// Room around the border for the highlight outline and the shadow.
const imagePadding = 10;

const badgeColors = theme.palette.map.badge;

/**
 * Half the height of a badge including its border.
 */
export const badgeHalfHeight = pillHeight / 2 + borderWidth;

/**
 * Loads the font of the badge numbers. Badges drawn before it loaded use a fallback font and need to be drawn again.
 */
export const loadBadgeFont = () => document.fonts.load(badgeFont);

let measuringContext: CanvasRenderingContext2D | null = null;
const measureTextWidth = (text: string) => {
  measuringContext ??= document.createElement("canvas").getContext("2d");
  if (!measuringContext) return 0;
  measuringContext.font = badgeFont;
  return measuringContext.measureText(text).width;
};

// Widths measured with a fallback font are not kept, so a badge gets its final width once the font has loaded.
const pillWidthCache = new Map<string, number>();
const getPillWidth = (text: string) => {
  let width = pillWidthCache.get(text);
  if (width === undefined) {
    width = Math.max(minPillWidth, Math.ceil(measureTextWidth(text)) + textPadding);
    if (document.fonts.check(badgeFont)) pillWidthCache.set(text, width);
  }
  return width;
};

/**
 * The radius of the smallest circle around the badge with the given number, including its border.
 */
export const getBadgeOuterRadius = (count: number) => getPillWidth(String(count)) / 2 + borderWidth;

// The pill grown by the given width on every side, centred on the origin.
const createPillPath = (width: number, grow: number) => {
  const height = pillHeight + 2 * grow;
  const path = new Path2D();
  path.roundRect(-width / 2 - grow, -height / 2, width + 2 * grow, height, height / 2);
  return path;
};

const getImageSize = (pillWidth: number) => ({
  width: pillWidth + 2 * (borderWidth + imagePadding),
  height: pillHeight + 2 * (borderWidth + imagePadding),
});

// Draws the badge without its number, centred on the origin. The context is already scaled by the pixel ratio;
// canvas shadows are not affected by that transform and need the pixel ratio themselves.
const drawBadgeBackground = (
  context: CanvasRenderingContext2D,
  pillWidth: number,
  highlight: SymbolHighlight | null,
  pixelRatio: number,
) => {
  const outline = createPillPath(pillWidth, borderWidth);

  // Stroked below the badge, so only its outer half shows as a ring.
  if (highlight !== null) {
    context.strokeStyle = highlightColors[highlight];
    context.lineWidth = highlightWidth;
    context.stroke(outline);
  }

  // The shadow only falls outside the badge, so it does not show through the translucent border.
  const imageSize = getImageSize(pillWidth);
  const outside = new Path2D();
  outside.rect(-imageSize.width / 2, -imageSize.height / 2, imageSize.width, imageSize.height);
  outside.addPath(outline);
  context.save();
  context.clip(outside, "evenodd");
  context.shadowColor = badgeColors.shadow;
  context.shadowOffsetY = shadowOffsetY * pixelRatio;
  context.shadowBlur = shadowBlur * pixelRatio;
  context.fillStyle = badgeColors.fill;
  context.fill(outline);
  context.restore();

  context.fillStyle = badgeColors.fill;
  context.fill(createPillPath(pillWidth, 0));

  context.strokeStyle = badgeColors.border;
  context.lineWidth = borderWidth;
  context.stroke(createPillPath(pillWidth, borderWidth / 2));
};

// Cluster numbers change with every zoom level, so the background is cached per width and only the number is drawn
// for every badge. There are few widths, and the cache does not depend on the font.
const backgroundImageCache = new Map<string, HTMLCanvasElement>();
const getBackgroundImage = (pillWidth: number, highlight: SymbolHighlight | null, pixelRatio: number) => {
  const imageKey = `${pillWidth}|${highlight ?? "none"}|${pixelRatio}`;
  let image = backgroundImageCache.get(imageKey);
  if (!image) {
    const imageSize = getImageSize(pillWidth);
    image = document.createElement("canvas");
    image.width = Math.ceil(imageSize.width * pixelRatio);
    image.height = Math.ceil(imageSize.height * pixelRatio);
    const context = image.getContext("2d");
    if (context) {
      context.translate(image.width / 2, image.height / 2);
      context.scale(pixelRatio, pixelRatio);
      drawBadgeBackground(context, pillWidth, highlight, pixelRatio);
    }
    backgroundImageCache.set(imageKey, image);
  }
  return image;
};

const drawNumber = (context: CanvasRenderingContext2D, text: string, x: number, y: number, pixelRatio: number) => {
  context.save();
  context.translate(x, y);
  context.scale(pixelRatio, pixelRatio);
  context.font = badgeFont;
  context.fillStyle = badgeColors.text;
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.fillText(text, 0, textBaselineOffset);
  context.restore();
};

const createBadgeStyle = (text: string, highlight: SymbolHighlight | null) =>
  new Style({
    zIndex: zIndexByHighlight[highlight ?? "none"],
    renderer: ([x, y], { context, pixelRatio }) => {
      if (typeof x !== "number" || typeof y !== "number") return;
      const image = getBackgroundImage(getPillWidth(text), highlight, pixelRatio);
      context.drawImage(image, x - image.width / 2, y - image.height / 2);
      drawNumber(context, text, x, y, pixelRatio);
    },
    hitDetectionRenderer: ([x, y], { context, pixelRatio }) => {
      if (typeof x !== "number" || typeof y !== "number") return;
      context.save();
      context.translate(x, y);
      context.scale(pixelRatio, pixelRatio);
      context.fill(createPillPath(getPillWidth(text), borderWidth));
      context.restore();
    },
  });

const badgeStyleCache = new Map<string, Style>();

/**
 * Returns the cached OpenLayers style that draws a badge with the number of boreholes centred on a point geometry,
 * outlined when highlighted. A badge shows no legend symbol.
 */
export const getBadgeStyle = (count: number, highlight: SymbolHighlight | null): Style => {
  const styleKey = `${count}|${highlight ?? "none"}`;
  let style = badgeStyleCache.get(styleKey);
  if (!style) {
    style = createBadgeStyle(String(count), highlight);
    badgeStyleCache.set(styleKey, style);
  }
  return style;
};
