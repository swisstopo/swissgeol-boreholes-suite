import { describe, expect, it } from "vitest";
import { legendSymbols } from "./legend/legendSymbols.ts";
import { getBadgeStyle } from "./mapBadgeStyle.ts";
import { getSymbolStyle } from "./mapSymbolStyle.ts";

describe("getBadgeStyle", () => {
  it("returns the same style for the same number and highlight", () => {
    expect(getBadgeStyle(2, "hover")).toBe(getBadgeStyle(2, "hover"));
    expect(getBadgeStyle(2, "hover")).not.toBe(getBadgeStyle(3, "hover"));
    expect(getBadgeStyle(2, "hover")).not.toBe(getBadgeStyle(2, "active"));
  });

  it("draws hovered badges above active ones and active ones above the others", () => {
    const zIndexOf = (highlight: "hover" | "active" | null) => getBadgeStyle(2, highlight).getZIndex() ?? 0;

    expect(zIndexOf("hover")).toBeGreaterThan(zIndexOf("active"));
    expect(zIndexOf("active")).toBeGreaterThan(zIndexOf(null));
  });

  it("draws an outlined badge above unmarked symbols and an unmarked badge at their level", () => {
    const symbolZIndex = getSymbolStyle(legendSymbols.purpleHexagon, null).getZIndex() ?? 0;

    expect(getBadgeStyle(2, "active").getZIndex() ?? 0).toBeGreaterThan(symbolZIndex);
    expect(getBadgeStyle(2, null).getZIndex() ?? 0).toBe(symbolZIndex);
  });
});
