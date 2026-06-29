// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { buildBulkEditRequest } from "./borehole.ts";

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
