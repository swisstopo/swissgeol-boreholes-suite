import Feature, { FeatureLike } from "ol/Feature";
import Point from "ol/geom/Point";
import { getUid } from "ol/util";

// The OpenLayers cluster source keeps the boreholes of a cluster under this key; badges do the same.
const badgeBoreholesKey = "features";

/**
 * The boreholes a badge on the map stands for: those at its location, or those of a cluster. Null for a single
 * borehole.
 */
export const getBadgeBoreholes = (feature: FeatureLike): Feature[] | null => {
  const boreholes: unknown = feature.get(badgeBoreholesKey);
  return Array.isArray(boreholes) ? (boreholes as Feature[]) : null;
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
