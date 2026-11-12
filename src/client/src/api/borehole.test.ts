// @vitest-environment jsdom
import { hashKey } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { toPolygonGeometry } from "../pages/overview/polygonFilter.ts";
import {
  buildBulkEditRequest,
  filterBoreholesMapQueryOptions,
  FilterRequest,
  toMapFilterCriteria,
} from "./borehole.ts";

describe("buildBulkEditRequest", () => {
  it("maps changed entries into update + fieldsToUpdate mask", () => {
    const request = buildBulkEditRequest(
      [1, 2, 3],
      [
        ["projectName", "New project"],
        ["restrictionId", 20111003],
        ["totalDepth", 42],
      ],
    );

    expect(request.boreholeIds).toEqual([1, 2, 3]);
    expect(request.fieldsToUpdate).toEqual(["projectName", "restrictionId", "totalDepth"]);
    expect(request.update).toEqual({ projectName: "New project", restrictionId: 20111003, totalDepth: 42 });
  });

  it("keeps a null value in the update so the field is cleared", () => {
    const request = buildBulkEditRequest([5], [["restrictionId", null]]);

    expect(request.fieldsToUpdate).toEqual(["restrictionId"]);
    expect(request.update).toEqual({ restrictionId: null });
  });
});

describe("toMapFilterCriteria", () => {
  const filters: FilterRequest = { typeId: [20101001], totalDepthMin: 10, hasPhotos: "true" };
  const mapKey = (filterRequest: FilterRequest) => hashKey([toMapFilterCriteria(filterRequest)]);

  it("ignores paging and sorting of the borehole table", () => {
    const withTableFields: FilterRequest = {
      ...filters,
      pageNumber: 3,
      pageSize: 50,
      orderBy: "name",
      direction: "DESC",
    };

    expect(mapKey(withTableFields)).toBe(mapKey(filters));
  });

  it("changes with every filter criterion, including the polygon", () => {
    const polygon = toPolygonGeometry([
      [2600000, 1200000],
      [2610000, 1200000],
      [2610000, 1210000],
    ]);

    expect(mapKey({ ...filters, totalDepthMin: 20 })).not.toBe(mapKey(filters));
    expect(mapKey({ ...filters, hasPhotos: "false" })).not.toBe(mapKey(filters));
    expect(mapKey({ ...filters, polygon })).not.toBe(mapKey(filters));
  });
});

describe("filterBoreholesMapQueryOptions", () => {
  it("gives the prefetch after login the same key as the map in the overview", () => {
    const filters: FilterRequest = { typeId: [20101001], hasPhotos: "true" };
    const sessionFilterRequest: FilterRequest = {
      ...filters,
      pageNumber: 2,
      pageSize: 50,
      orderBy: "name",
      direction: "ASC",
    };

    expect(hashKey(filterBoreholesMapQueryOptions(sessionFilterRequest).queryKey)).toBe(
      hashKey(filterBoreholesMapQueryOptions(filters).queryKey),
    );
  });

  it("keeps the map data fresh for ten minutes", () => {
    expect(filterBoreholesMapQueryOptions({}).staleTime).toBe(10 * 60 * 1000);
  });
});
