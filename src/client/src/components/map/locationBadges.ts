import Feature, { FeatureLike } from "ol/Feature";
import Point from "ol/geom/Point";
import VectorSource from "ol/source/Vector";
import { getUid } from "ol/util";

// The OpenLayers cluster source keeps the boreholes of a cluster under this key; badges do the same.
const badgeBoreholesKey = "features";

/**
 * The boreholes a feature on the map stands for: a borehole itself, the boreholes at the location of a badge, or those
 * of a cluster. A feature that stands for one borehole is drawn as that borehole, one for several as a badge.
 */
export const getFeatureBoreholes = <T extends FeatureLike>(feature: T): (T | Feature)[] => {
  const boreholes: unknown = feature.get(badgeBoreholesKey);
  return Array.isArray(boreholes) ? (boreholes as Feature[]) : [feature];
};

// A borehole without a point location is never grouped.
const getLocationKey = (borehole: Feature) => {
  const geometry = borehole.getGeometry();
  return geometry instanceof Point ? geometry.getCoordinates().join(",") : `uid:${getUid(borehole)}`;
};

const createBadge = (boreholes: Feature[]) =>
  new Feature({ geometry: boreholes[0].getGeometry()?.clone(), [badgeBoreholesKey]: boreholes });

/**
 * The features the map draws below the cluster resolution: a borehole alone at its location as itself, and the
 * boreholes at exactly the same coordinates as one badge. Nearby boreholes at different coordinates stay single.
 */
export const groupByLocation = (boreholes: readonly Feature[]): Feature[] => {
  const boreholesByLocation = new Map<string, Feature[]>();
  for (const borehole of boreholes) {
    const key = getLocationKey(borehole);
    const boreholesAtLocation = boreholesByLocation.get(key);
    if (boreholesAtLocation) {
      boreholesAtLocation.push(borehole);
    } else {
      boreholesByLocation.set(key, [borehole]);
    }
  }
  return [...boreholesByLocation.values()].map(boreholesAtLocation =>
    boreholesAtLocation.length === 1 ? boreholesAtLocation[0] : createBadge(boreholesAtLocation),
  );
};

// Badges that took in other locations carry this flag.
const clusterBadgeKey = "clusterBadge";

/**
 * Whether the feature is a badge of boreholes at several locations. It behaves like a cluster, since zooming in
 * separates its locations again.
 */
export const isClusterBadge = (feature: FeatureLike) => feature.get(clusterBadgeKey) === true;

const isBadge = (location: Feature) => getFeatureBoreholes(location).length > 1;

const getPointCoordinates = (feature: Feature) => {
  const geometry = feature.getGeometry();
  return geometry instanceof Point ? geometry.getCoordinates() : null;
};

const byBoreholeCountDescending = (location: Feature, other: Feature) =>
  getFeatureBoreholes(other).length - getFeatureBoreholes(location).length;

// The locations whose drawing touches the badge's drawing at the resolution, in map units per pixel.
const getTouchingLocations = (
  locations: VectorSource,
  badge: Feature,
  resolution: number,
  getRadius: (location: Feature) => number,
) => {
  const center = getPointCoordinates(badge);
  if (center === null) return [];
  const badgeRadius = getRadius(badge);
  // Badges are visited from the largest, so no location left to take in is wider than this badge.
  const searchDistance = 2 * badgeRadius * resolution;
  const searchExtent = [
    center[0] - searchDistance,
    center[1] - searchDistance,
    center[0] + searchDistance,
    center[1] + searchDistance,
  ];
  return locations.getFeaturesInExtent(searchExtent).filter(location => {
    const coordinates = getPointCoordinates(location);
    if (location === badge || coordinates === null) return false;
    const pixelDistance = Math.hypot(coordinates[0] - center[0], coordinates[1] - center[1]) / resolution;
    return pixelDistance < badgeRadius + getRadius(location);
  });
};

const createClusterBadge = (badge: Feature, touchingLocations: readonly Feature[]) =>
  new Feature({
    geometry: badge.getGeometry()?.clone(),
    [badgeBoreholesKey]: [badge, ...touchingLocations].flatMap(location => getFeatureBoreholes(location)),
    [clusterBadgeKey]: true,
  });

/**
 * The features the map draws at the resolution, from the locations that {@link groupByLocation} returned: every badge
 * takes in the symbols and badges its drawing touches, so no symbol is hidden under a badge. Symbols that only touch
 * each other stay single. `getRadius` is the drawn radius of a location in pixels.
 */
export const mergeTouchingBadges = (
  locations: VectorSource,
  resolution: number,
  getRadius: (location: Feature) => number,
): Feature[] => {
  const takenIn = new Set<Feature>();
  const clusterBadges: Feature[] = [];
  const badgesFromLargest = locations.getFeatures().filter(isBadge).sort(byBoreholeCountDescending);
  for (const badge of badgesFromLargest) {
    if (takenIn.has(badge)) continue;
    const touchingLocations = getTouchingLocations(locations, badge, resolution, getRadius).filter(
      location => !takenIn.has(location),
    );
    if (touchingLocations.length === 0) continue;
    takenIn.add(badge);
    touchingLocations.forEach(location => takenIn.add(location));
    clusterBadges.push(createClusterBadge(badge, touchingLocations));
  }
  return [...locations.getFeatures().filter(location => !takenIn.has(location)), ...clusterBadges];
};
