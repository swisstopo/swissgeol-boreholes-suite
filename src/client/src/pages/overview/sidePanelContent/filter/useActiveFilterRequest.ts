import { FilterRequest } from "../../../../api/borehole.ts";
import { toPolygonGeometry } from "../../polygonFilter.ts";
import { useBoreholeUrlParams } from "../../useBoreholeUrlParams.ts";

/**
 * The URL filters as a request body, with the polygon converted from the URL format to GeoJSON.
 * Every request that should match the borehole list (filtering, stats, suggestions) uses this.
 */
export const useActiveFilterRequest = (): FilterRequest => {
  const { activeFilters, filterPolygon } = useBoreholeUrlParams();
  return { ...activeFilters, polygon: filterPolygon === null ? undefined : toPolygonGeometry(filterPolygon) };
};
