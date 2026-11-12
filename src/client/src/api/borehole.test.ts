// @vitest-environment jsdom
import { hashKey } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { buildBulkEditRequest, FilterRequest, toMapFilterCriteria } from "./borehole.ts";
import { toPolygonGeometry } from "../pages/overview/polygonFilter.ts";

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
