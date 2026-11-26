import Feature from "ol/Feature";
import { BoreholeHighlights } from "../mapStyleFunctions.ts";
import { PopoverAnchor } from "./boreholePopoverPlacement.ts";

/**
 * The boreholes listed in the map popover. A preview follows the pointer over boreholes, badges and clusters; a pinned
 * popover stays open after a click on several boreholes or a badge and lists them as links.
 */
export interface BoreholePopoverState {
  features: readonly Feature[];
  anchor: PopoverAnchor;
  pinned: boolean;
  // The cluster whose boreholes the preview lists, outlined while it is hovered; null for boreholes and badges.
  cluster: Feature | null;
}

const idOf = (feature: Feature) => feature.get("id") as number;

export const haveSameBoreholes = (features: readonly Feature[], otherFeatures: readonly Feature[]) =>
  features.length === otherFeatures.length && features.every((feature, index) => feature === otherFeatures[index]);

/**
 * The boreholes the pointer is on, in the popover preview or on a row of the pinned popover.
 */
export const getHoveredBoreholeIds = (popover: BoreholePopoverState | null, hoveredRowId: number | null): number[] => {
  if (popover === null) return [];
  if (!popover.pinned) return popover.features.map(idOf);
  return hoveredRowId === null ? [] : [hoveredRowId];
};

/**
 * Marks the boreholes hovered on the map, in the popover or in the table, and the boreholes of a pinned popover.
 */
export const getBoreholeHighlights = (
  popover: BoreholePopoverState | null,
  hoveredRowId: number | null,
  tableHoveredIds: readonly number[],
): BoreholeHighlights => ({
  hovered: new Set([...tableHoveredIds, ...getHoveredBoreholeIds(popover, hoveredRowId)]),
  active: new Set(popover?.pinned ? popover.features.map(idOf) : []),
});

const haveSameIds = (ids: ReadonlySet<number>, otherIds: ReadonlySet<number>) =>
  ids.size === otherIds.size && [...ids].every(id => otherIds.has(id));

export const haveSameHighlights = (highlights: BoreholeHighlights, otherHighlights: BoreholeHighlights) =>
  haveSameIds(highlights.hovered, otherHighlights.hovered) && haveSameIds(highlights.active, otherHighlights.active);
