import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { getFeatureBoreholes } from "../locationBadges.ts";
import { badgeHalfHeight } from "../mapBadgeStyle.ts";
import { BoreholeHighlights } from "../mapStyleFunctions.ts";
import { boreholeSymbolHalfHeight, PopoverAnchor } from "./boreholePopoverPlacement.ts";

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

const getCoordinates = (features: readonly Feature[]) =>
  features.flatMap(feature => {
    const geometry = feature.getGeometry();
    return geometry instanceof Point ? [geometry.getCoordinates()] : [];
  });

// Features that stand for several boreholes are drawn as badges, which are higher than the symbols.
const getAnchorHalfHeight = (features: readonly Feature[]) =>
  features.some(feature => getFeatureBoreholes(feature).length > 1) ? badgeHalfHeight : boreholeSymbolHalfHeight;

const previewFeatures = (features: readonly Feature[], cluster: Feature | null): BoreholePopoverState => ({
  features: features.flatMap(feature => getFeatureBoreholes(feature)),
  anchor: { coordinates: getCoordinates(features), halfHeight: getAnchorHalfHeight(features) },
  pinned: false,
  cluster,
});

/**
 * The preview of the boreholes and badges under the pointer, listing all boreholes of a badge.
 */
export const previewLocations = (locations: readonly Feature[]): BoreholePopoverState =>
  previewFeatures(locations, null);

/**
 * The preview of a cluster. A cluster with a single borehole is previewed as that borehole, so it records no cluster.
 */
export const previewCluster = (cluster: Feature): BoreholePopoverState =>
  previewFeatures([cluster], getFeatureBoreholes(cluster).length > 1 ? cluster : null);

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
