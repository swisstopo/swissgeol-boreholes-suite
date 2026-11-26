import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { describe, expect, it } from "vitest";
import { getBadgeBoreholes, groupByLocation } from "./locationBadges.ts";

const boreholeAt = (id: number, x: number, y: number) => new Feature({ geometry: new Point([x, y]), id });

const idsOf = (features: readonly Feature[] | null) => features?.map(feature => feature.get("id") as number);

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
    expect(getBadgeBoreholes(locations[0])).toEqual([first, second]);
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

    expect(locations.map(location => idsOf(getBadgeBoreholes(location)) ?? location.get("id"))).toEqual([
      [1, 3],
      2,
      [4, 5, 6],
    ]);
  });
});

describe("getBadgeBoreholes", () => {
  it("is null for a borehole", () => {
    expect(getBadgeBoreholes(boreholeAt(1, 0, 0))).toBeNull();
  });

  it("reads the boreholes of a cluster", () => {
    const boreholes = [boreholeAt(1, 0, 0), boreholeAt(2, 5, 5)];
    const cluster = new Feature({ geometry: new Point([2, 2]), features: boreholes });

    expect(getBadgeBoreholes(cluster)).toBe(boreholes);
  });
});
