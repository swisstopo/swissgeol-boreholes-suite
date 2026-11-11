// @vitest-environment jsdom
import OlPolygon from "ol/geom/Polygon";
import { describe, expect, it } from "vitest";
import { parseAsPolygon, PolygonVertices, toOlPolygon, toPolygonGeometry, toPolygonVertices } from "./polygonFilter.ts";

const vertices: PolygonVertices = [
  [2600000, 1200000],
  [2610000, 1200000],
  [2610000, 1210000],
];

describe("parseAsPolygon", () => {
  it("parses East/North pairs", () => {
    expect(parseAsPolygon.parse("2600000,1200000,2610000,1200000,2610000,1210000")).toEqual(vertices);
  });

  it("parses the format saveFilterParamsInSession writes for nested arrays", () => {
    expect(parseAsPolygon.parse(vertices.join(","))).toEqual(vertices);
  });

  it.each([
    ["an odd number of values", "2600000,1200000,2610000"],
    ["fewer than three vertices", "2600000,1200000,2610000,1200000"],
    ["a value that is not a number", "2600000,1200000,2610000,abc,2610000,1210000"],
    ["an empty value", ""],
  ])("rejects %s", (_, value) => {
    expect(parseAsPolygon.parse(value)).toBeNull();
  });

  it("serializes to East/North pairs", () => {
    expect(parseAsPolygon.serialize(vertices)).toBe("2600000,1200000,2610000,1200000,2610000,1210000");
  });

  it("compares vertices by value", () => {
    expect(
      parseAsPolygon.eq(
        vertices,
        vertices.map(([east, north]): [number, number] => [east, north]),
      ),
    ).toBe(true);
    expect(parseAsPolygon.eq(vertices, vertices.slice(0, 2))).toBe(false);
  });
});

describe("toPolygonVertices", () => {
  it("rounds to whole metres and drops the closing vertex", () => {
    const drawn = new OlPolygon([
      [
        [2600000.4, 1200000.6],
        [2610000, 1200000],
        [2610000, 1210000],
        [2600000.4, 1200000.6],
      ],
    ]);

    expect(toPolygonVertices(drawn)).toEqual([
      [2600000, 1200001],
      [2610000, 1200000],
      [2610000, 1210000],
    ]);
  });
});

describe("toPolygonGeometry", () => {
  it("returns a GeoJSON polygon with a closed ring", () => {
    expect(toPolygonGeometry(vertices)).toEqual({ type: "Polygon", coordinates: [[...vertices, vertices[0]]] });
  });
});

describe("toOlPolygon", () => {
  it("returns an OpenLayers polygon with a closed ring", () => {
    expect(toOlPolygon(vertices).getCoordinates()).toEqual([[...vertices, vertices[0]]]);
  });
});
