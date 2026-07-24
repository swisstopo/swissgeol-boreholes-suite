/**
 * Resolves the terrain elevation (in metres above sea level) at a point on
 * Swiss territory using the public swisstopo height API
 * (`api3.geo.admin.ch/rest/services/height`).
 *
 * Coordinates must be in EPSG:2056 (Swiss LV95 / CH1903+); WGS84 lat/lon will
 * not work because the request is hard-coded to `sr=2056`.
 *
 * @param easting LV95 easting (X) coordinate.
 * @param northing LV95 northing (Y) coordinate.
 * @returns The elevation as returned by the API (a numeric string, e.g. `"555.7"`),
 *          or `null` if the point lies outside the Swiss coverage or the request fails.
 */
export async function getHeight(easting: number, northing: number): Promise<string | null> {
  const params = new URLSearchParams({
    easting: String(easting),
    northing: String(northing),
    sr: "2056",
  });
  const response = await fetch(`https://api3.geo.admin.ch/rest/services/height?${params}`);
  if (!response.ok) return null;
  const data = (await response.json()) as { height?: string };
  return data.height ?? null;
}
