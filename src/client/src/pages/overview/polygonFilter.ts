import { Polygon } from "geojson";
import { createParser } from "nuqs";
import OlPolygon from "ol/geom/Polygon";
import { swissExtent } from "../../components/basemapSelector/basemaps.ts";

/**
 * The polygon filter as stored in the URL: LV95 (EPSG:2056) East/North pairs in whole metres, without
 * repeating the first vertex. Rounding keeps the URL short; it moves the boundary by less than a metre.
 */
export type PolygonVertices = [number, number][];

const minimumVertexCount = 3;

/**
 * Whether every vertex lies within the map extent, which is the LV95 valid area. The API rejects polygons
 * reaching beyond it, so such a polygon must never become the filter.
 */
export const isWithinMapExtent = (vertices: PolygonVertices): boolean => {
  const [minEast, minNorth, maxEast, maxNorth] = swissExtent;
  return vertices.every(
    ([east, north]) => east >= minEast && east <= maxEast && north >= minNorth && north <= maxNorth,
  );
};

export const parseAsPolygon = createParser<PolygonVertices>({
  parse(value) {
    const numbers = value.split(",").map(Number);
    const isEvenCount = numbers.length % 2 === 0;
    const hasEnoughVertices = numbers.length >= minimumVertexCount * 2;
    if (!isEvenCount || !hasEnoughVertices || !numbers.every(Number.isFinite)) return null;
    const vertices = Array.from({ length: numbers.length / 2 }, (_, i): [number, number] => [
      numbers[2 * i],
      numbers[2 * i + 1],
    ]);
    return isWithinMapExtent(vertices) ? vertices : null;
  },
  serialize: vertices => vertices.flat().join(","),
  eq: (a, b) => a.length === b.length && a.every(([east, north], i) => east === b[i][0] && north === b[i][1]),
});

export const toPolygonVertices = (polygon: OlPolygon): PolygonVertices => {
  const outerRing = polygon.getCoordinates()[0] ?? [];
  return outerRing.slice(0, -1).map(([east, north]): [number, number] => [Math.round(east), Math.round(north)]);
};

export const toPolygonGeometry = (vertices: PolygonVertices): Polygon => ({
  type: "Polygon",
  coordinates: [[...vertices, vertices[0]]],
});

export const toOlPolygon = (vertices: PolygonVertices): OlPolygon =>
  new OlPolygon(toPolygonGeometry(vertices).coordinates);
