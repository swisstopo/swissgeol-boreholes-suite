import { describe, expect, it } from "vitest";
import { SearchData } from "./filterData/filterInterfaces.ts";
import { filterForAnonymousMode } from "./filterUtils.ts";

describe("filterForAnonymous", () => {
  const data: SearchData[] = [
    { key: "secret", hideInAnonymousMode: true },
    { key: "public" },
    { key: "explicitlyVisible", hideInAnonymousMode: false },
  ];

  it("returns the input unchanged when anonymous mode is disabled", () => {
    expect(filterForAnonymousMode(data, false)).toBe(data);
  });

  it("removes entries marked hideInAnonymousMode when anonymous mode is enabled", () => {
    expect(filterForAnonymousMode(data, true).map(d => d.key)).toEqual(["public", "explicitlyVisible"]);
  });

  it("returns an empty array unchanged", () => {
    expect(filterForAnonymousMode([], true)).toEqual([]);
  });
});
