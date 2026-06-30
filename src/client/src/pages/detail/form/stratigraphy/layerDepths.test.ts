import { describe, expect, it } from "vitest";
import { collectLayerDepths } from "./layerDepths.ts";

describe("collectLayerDepths", () => {
  it("returns an empty array for undefined input", () => {
    expect(collectLayerDepths(undefined)).toEqual([]);
  });

  it("returns an empty array for an empty layer list", () => {
    expect(collectLayerDepths([])).toEqual([]);
  });

  it("skips null fromDepth and null toDepth independently", () => {
    expect(
      collectLayerDepths([
        { fromDepth: null, toDepth: 5 },
        { fromDepth: 10, toDepth: null },
        { fromDepth: null, toDepth: null },
      ]),
    ).toEqual([5, 10]);
  });

  it("deduplicates shared boundaries (toDepth of one layer = fromDepth of the next)", () => {
    expect(
      collectLayerDepths([
        { fromDepth: 0, toDepth: 5 },
        { fromDepth: 5, toDepth: 12 },
        { fromDepth: 12, toDepth: 20 },
      ]),
    ).toEqual([0, 5, 12, 20]);
  });

  it("sorts the output ascending even when the input layer order is reversed", () => {
    expect(
      collectLayerDepths([
        { fromDepth: 20, toDepth: 30 },
        { fromDepth: 10, toDepth: 20 },
        { fromDepth: 0, toDepth: 10 },
      ]),
    ).toEqual([0, 10, 20, 30]);
  });

  it("preserves sub-meter precision", () => {
    expect(
      collectLayerDepths([
        { fromDepth: 0, toDepth: 1.5 },
        { fromDepth: 1.5, toDepth: 2.75 },
      ]),
    ).toEqual([0, 1.5, 2.75]);
  });
});
