import { Coordinate } from "ol/coordinate";

export type PopoverPlacement = "above" | "below";

/**
 * Where the popover is attached: the locations of the listed boreholes or of their cluster, and half the height of
 * their symbol, which the popover keeps clear of.
 */
export interface PopoverAnchor {
  coordinates: readonly Coordinate[];
  halfHeight: number;
}

export const boreholeSymbolHalfHeight = 8;

// Gap between the popover and the edge of the symbol.
const popoverGap = 10;

// The space above must exceed the popover height by this margin, or the popover may open below.
const placementMargin = 8;

export const getPopoverOffset = (anchor: PopoverAnchor) => anchor.halfHeight + popoverGap;

/**
 * The points the popover is attached to: centred over the anchor locations, at the topmost one when it opens above and
 * at the bottommost one when it opens below.
 */
export const getPopoverAnchorPoints = (anchor: PopoverAnchor): Record<PopoverPlacement, Coordinate> => {
  const { coordinates } = anchor;
  const centerX = coordinates.reduce((sum, [x]) => sum + x, 0) / coordinates.length;
  const ys = coordinates.map(([, y]) => y);
  return { above: [centerX, Math.max(...ys)], below: [centerX, Math.min(...ys)] };
};

/**
 * The popover opens above the anchor. It opens below when it does not fit above and there is more space below. The y
 * values are pixels from the top of the map.
 */
export const getPopoverPlacement = (
  abovePixelY: number,
  belowPixelY: number,
  mapHeight: number,
  popoverHeight: number,
  offset: number,
): PopoverPlacement => {
  const spaceAbove = abovePixelY - offset;
  const spaceBelow = mapHeight - belowPixelY - offset;
  return spaceAbove < popoverHeight + placementMargin && spaceBelow > spaceAbove ? "below" : "above";
};
