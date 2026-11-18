import { Coordinate } from "ol/coordinate";

export type PopoverPlacement = "above" | "below";

// Distance between the popover and the borehole location: half the symbol height and a gap.
export const popoverOffset = 18;

// The space above must exceed the popover height by this margin, or the popover may open below.
const placementMargin = 8;

/**
 * The points the popover is attached to: centred over the boreholes, at the topmost one when it opens above and at
 * the bottommost one when it opens below.
 */
export const getPopoverAnchors = (coordinates: readonly Coordinate[]): Record<PopoverPlacement, Coordinate> => {
  const centerX = coordinates.reduce((sum, [x]) => sum + x, 0) / coordinates.length;
  const ys = coordinates.map(([, y]) => y);
  return { above: [centerX, Math.max(...ys)], below: [centerX, Math.min(...ys)] };
};

/**
 * The popover opens above the boreholes. It opens below when it does not fit above and there is more space below.
 * The y values are pixels from the top of the map.
 */
export const getPopoverPlacement = (
  abovePixelY: number,
  belowPixelY: number,
  mapHeight: number,
  popoverHeight: number,
): PopoverPlacement => {
  const spaceAbove = abovePixelY - popoverOffset;
  const spaceBelow = mapHeight - belowPixelY - popoverOffset;
  return spaceAbove < popoverHeight + placementMargin && spaceBelow > spaceAbove ? "below" : "above";
};
