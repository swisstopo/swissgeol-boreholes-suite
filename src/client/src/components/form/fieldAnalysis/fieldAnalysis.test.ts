import { describe, expect, it } from "vitest";
import { areFieldValuesEqual } from "./fieldAnalysis.ts";

describe("areFieldValuesEqual", () => {
  it("compares single values by identity", () => {
    expect(areFieldValuesEqual(5, 5)).toBe(true);
    expect(areFieldValuesEqual(null, null)).toBe(true);
    expect(areFieldValuesEqual(5, 6)).toBe(false);
    expect(areFieldValuesEqual(5, null)).toBe(false);
  });

  it("treats lists holding the same ids in another order as equal", () => {
    expect(areFieldValuesEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(areFieldValuesEqual([3, 1, 2], [1, 2, 3])).toBe(true);
    expect(areFieldValuesEqual([], [])).toBe(true);
  });

  it("treats lists with different ids or lengths as different", () => {
    expect(areFieldValuesEqual([1, 2], [1, 3])).toBe(false);
    expect(areFieldValuesEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it("never treats a list as equal to a value that is not a list", () => {
    expect(areFieldValuesEqual([], null)).toBe(false);
    expect(areFieldValuesEqual(null, [])).toBe(false);
    expect(areFieldValuesEqual([5], 5)).toBe(false);
    expect(areFieldValuesEqual(5, [])).toBe(false);
  });

  it("leaves the order of the given lists untouched", () => {
    const left = [3, 1, 2];
    const right = [2, 3, 1];

    areFieldValuesEqual(left, right);

    expect(left).toEqual([3, 1, 2]);
    expect(right).toEqual([2, 3, 1]);
  });
});
