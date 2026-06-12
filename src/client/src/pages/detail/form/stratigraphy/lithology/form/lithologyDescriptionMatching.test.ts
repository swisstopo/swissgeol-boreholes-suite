import { describe, expect, it } from "vitest";
import { LithologicalDescription, Lithology } from "../../stratigraphy.ts";
import { findMatchingLithologicalDescription } from "./lithologyDescriptionMatching.ts";

const lithology = (overrides: Partial<Lithology> = {}): Lithology => ({
  id: 0,
  stratigraphyId: 1,
  fromDepth: 0,
  toDepth: 0,
  isUnconsolidated: true,
  hasBedding: false,
  ...overrides,
});

const lithologicalDesciption = (overrides: Partial<LithologicalDescription> = {}): LithologicalDescription => ({
  id: 0,
  stratigraphyId: 1,
  fromDepth: 0,
  toDepth: 0,
  ...overrides,
});

describe("findMatchingLithologicalDescription", () => {
  it("returns the LithologicalDescription that fully contains the lithology's depthIds", () => {
    const l = lithology({ depthIds: ["b"] });
    const LithologicalDescriptions = [
      lithologicalDesciption({ id: 1, depthIds: ["a"] }),
      lithologicalDesciption({ id: 2, depthIds: ["b", "c"] }),
    ];
    expect(findMatchingLithologicalDescription(l, LithologicalDescriptions)?.id).toBe(2);
  });

  it("matches when the LithologicalDescription covers exactly the same depthIds", () => {
    const l = lithology({ depthIds: ["a", "b"] });
    const LithologicalDescriptions = [lithologicalDesciption({ id: 3, depthIds: ["a", "b"] })];
    expect(findMatchingLithologicalDescription(l, LithologicalDescriptions)?.id).toBe(3);
  });

  it("returns undefined when the lithology has no depthIds", () => {
    const l = lithology({ depthIds: [] });
    const LithologicalDescriptions = [lithologicalDesciption({ id: 1, depthIds: ["a"] })];
    expect(findMatchingLithologicalDescription(l, LithologicalDescriptions)).toBeUndefined();
  });

  it("returns undefined when no LithologicalDescription contains all the lithology's depthIds", () => {
    const l = lithology({ depthIds: ["a", "b"] });
    const LithologicalDescriptions = [
      lithologicalDesciption({ id: 1, depthIds: ["a"] }),
      lithologicalDesciption({ id: 2, depthIds: ["b"] }),
    ];
    expect(findMatchingLithologicalDescription(l, LithologicalDescriptions)).toBeUndefined();
  });

  it("returns undefined when the LithologicalDescription has no depthIds", () => {
    const l = lithology({ depthIds: ["a"] });
    const LithologicalDescriptions = [lithologicalDesciption({ id: 1, depthIds: undefined })];
    expect(findMatchingLithologicalDescription(l, LithologicalDescriptions)).toBeUndefined();
  });
});
