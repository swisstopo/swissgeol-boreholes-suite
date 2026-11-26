import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorSource from "ol/source/Vector";
import { describe, expect, it } from "vitest";
import { getFeatureBoreholes, groupByLocation, isClusterBadge, mergeTouchingBadges } from "./locationBadges.ts";

const boreholeAt = (id: number, x: number, y: number) => new Feature({ geometry: new Point([x, y]), id });

const idsOf = (features: readonly Feature[]) => features.map(feature => feature.get("id") as number);

const coordinatesOf = (feature: Feature) => {
  const geometry = feature.getGeometry();
  return geometry instanceof Point ? geometry.getCoordinates() : null;
};

describe("groupByLocation", () => {
  it("keeps a borehole alone at its location as itself", () => {
    const borehole = boreholeAt(1, 2600000, 1200000);

    const locations = groupByLocation([borehole]);

    expect(locations).toHaveLength(1);
    expect(locations[0]).toBe(borehole);
  });

  it("draws boreholes at exactly the same coordinates as one badge with all of them", () => {
    const first = boreholeAt(1, 2600000.5, 1200000.25);
    const second = boreholeAt(2, 2600000.5, 1200000.25);

    const locations = groupByLocation([first, second]);

    expect(locations).toHaveLength(1);
    expect(getFeatureBoreholes(locations[0])).toEqual([first, second]);
    expect(coordinatesOf(locations[0])).toEqual([2600000.5, 1200000.25]);
  });

  it("keeps nearby boreholes at different coordinates single", () => {
    const first = boreholeAt(1, 2600000, 1200000);
    const second = boreholeAt(2, 2600000.01, 1200000);

    const locations = groupByLocation([first, second]);

    expect(locations).toHaveLength(2);
    expect(locations[0]).toBe(first);
    expect(locations[1]).toBe(second);
  });

  it("groups every location on its own, in the order of their first borehole", () => {
    const boreholes = [
      boreholeAt(1, 10, 10),
      boreholeAt(2, 20, 20),
      boreholeAt(3, 10, 10),
      boreholeAt(4, 30, 30),
      boreholeAt(5, 30, 30),
      boreholeAt(6, 30, 30),
    ];

    const locations = groupByLocation(boreholes);

    expect(locations.map(location => idsOf(getFeatureBoreholes(location)))).toEqual([[1, 3], [2], [4, 5, 6]]);
  });
});

describe("mergeTouchingBadges", () => {
  // Drawn radii in pixels: 19 for a badge, 13 for a symbol, so a symbol touches a badge closer than 32 pixels.
  const getRadius = (location: Feature) => (getFeatureBoreholes(location).length > 1 ? 19 : 13);
  const resolution = 0.5;

  const merge = (boreholes: Feature[]) =>
    mergeTouchingBadges(new VectorSource({ features: groupByLocation(boreholes) }), resolution, getRadius);

  it("takes the symbols touching a badge into it, which then behaves like a cluster", () => {
    const touching = boreholeAt(3, 15, 0);

    const locations = merge([boreholeAt(1, 0, 0), boreholeAt(2, 0, 0), touching]);

    expect(locations).toHaveLength(1);
    expect(idsOf(getFeatureBoreholes(locations[0]))).toEqual([1, 2, 3]);
    expect(coordinatesOf(locations[0])).toEqual([0, 0]);
    expect(isClusterBadge(locations[0])).toBe(true);
  });

  it("keeps a badge and the symbols it does not touch apart, until zooming out lets them touch", () => {
    const boreholes = [boreholeAt(1, 0, 0), boreholeAt(2, 0, 0), boreholeAt(3, 17, 0)];
    const locations = new VectorSource({ features: groupByLocation(boreholes) });

    const apart = mergeTouchingBadges(locations, resolution, getRadius);
    const zoomedOut = mergeTouchingBadges(locations, 1, getRadius);

    const apartIds = apart.map(location => idsOf(getFeatureBoreholes(location)));
    expect(apartIds.sort((ids, otherIds) => ids[0] - otherIds[0])).toEqual([[1, 2], [3]]);
    expect(apart.some(isClusterBadge)).toBe(false);
    expect(zoomedOut.map(location => idsOf(getFeatureBoreholes(location)))).toEqual([[1, 2, 3]]);
  });

  it("merges touching badges", () => {
    const locations = merge([boreholeAt(1, 0, 0), boreholeAt(2, 0, 0), boreholeAt(3, 18, 0), boreholeAt(4, 18, 0)]);

    expect(locations).toHaveLength(1);
    expect(idsOf(getFeatureBoreholes(locations[0])).sort((id, otherId) => id - otherId)).toEqual([1, 2, 3, 4]);
  });

  it("keeps symbols that only touch each other single", () => {
    const locations = merge([boreholeAt(1, 0, 0), boreholeAt(2, 2, 0)]);

    expect(locations).toHaveLength(2);
    expect(locations.some(isClusterBadge)).toBe(false);
  });
});

describe("getFeatureBoreholes", () => {
  it("is the borehole itself for a borehole", () => {
    const borehole = boreholeAt(1, 0, 0);

    expect(getFeatureBoreholes(borehole)).toEqual([borehole]);
  });

  it("reads the boreholes of a cluster", () => {
    const boreholes = [boreholeAt(1, 0, 0), boreholeAt(2, 5, 5)];
    const cluster = new Feature({ geometry: new Point([2, 2]), features: boreholes });

    expect(getFeatureBoreholes(cluster)).toBe(boreholes);
  });
});
