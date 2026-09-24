import { describe, expect, it } from "vitest";
import { LithologyFormValues } from "../../stratigraphy.ts";
import { buildLithologyValuesForMode } from "./lithologyUtils.ts";

const values: LithologyFormValues = {
  id: 7,
  stratigraphyId: 1,
  fromDepth: 0,
  toDepth: 0.4,
  isUnconsolidated: true,
  hasBedding: true,
  share: 70,
  notes: "kept",
  alterationDegreeId: 702,
  uscsTypeCodelistIds: [200],
  lithologyDescriptions: [
    { id: 0, lithologyId: 7, isFirst: true, lithologyUnconMainId: 100 },
    { id: 0, lithologyId: 7, isFirst: false },
  ],
  lithologicalDescription: { description: "Mittelkies" },
};

describe("buildLithologyValuesForMode", () => {
  it("keeps identity, depths, notes and the description text", () => {
    const result = buildLithologyValuesForMode(values, false);

    expect(result.id).toBe(7);
    expect(result.stratigraphyId).toBe(1);
    expect(result.fromDepth).toBe(0);
    expect(result.toDepth).toBe(0.4);
    expect(result.notes).toBe("kept");
    expect(result.lithologicalDescription).toEqual({ description: "Mittelkies" });
  });

  it("clears every mode scoped value and the bedding", () => {
    const result = buildLithologyValuesForMode(values, false);

    expect(result.isUnconsolidated).toBe(false);
    expect(result.hasBedding).toBe(false);
    expect(result.alterationDegreeId).toBeUndefined();
    expect(result.uscsTypeCodelistIds).toBeUndefined();
    expect(result.share).toBeUndefined();
    expect(result.lithologyDescriptions).toEqual([{ id: 0, lithologyId: 7, isFirst: true }]);
  });

  it("leaves no description at all for the unspecified mode", () => {
    const result = buildLithologyValuesForMode(values, null);

    expect(result.isUnconsolidated).toBeNull();
    expect(result.lithologyDescriptions).toEqual([]);
  });
});
