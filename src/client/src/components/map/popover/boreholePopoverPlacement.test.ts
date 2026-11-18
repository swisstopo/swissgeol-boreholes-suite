import { describe, expect, it } from "vitest";
import {
  boreholeSymbolHalfHeight,
  getPopoverAnchorPoints,
  getPopoverOffset,
  getPopoverPlacement,
} from "./boreholePopoverPlacement.ts";

describe("getPopoverAnchorPoints", () => {
  it("centres the anchor points over the locations, at the topmost and the bottommost one", () => {
    const anchor = {
      coordinates: [
        [10, 100],
        [30, 80],
      ],
      halfHeight: boreholeSymbolHalfHeight,
    };

    expect(getPopoverAnchorPoints(anchor)).toEqual({ above: [20, 100], below: [20, 80] });
  });
});

describe("getPopoverOffset", () => {
  it("keeps a gap to the edge of the symbol", () => {
    expect(getPopoverOffset({ coordinates: [[0, 0]], halfHeight: 8 })).toBe(18);
    expect(getPopoverOffset({ coordinates: [[0, 0]], halfHeight: 19 })).toBe(29);
  });
});

describe("getPopoverPlacement", () => {
  const popoverHeight = 100;
  const offset = 18;
  const fitsAbove = offset + popoverHeight + 8;

  it("opens above when the popover fits there", () => {
    expect(getPopoverPlacement(fitsAbove, fitsAbove, 800, popoverHeight, offset)).toBe("above");
  });

  it("opens below when the popover does not fit above and there is more space below", () => {
    expect(getPopoverPlacement(fitsAbove - 1, fitsAbove - 1, 800, popoverHeight, offset)).toBe("below");
  });

  it("stays above when there is even less space below", () => {
    expect(getPopoverPlacement(60, 60, 100, popoverHeight, offset)).toBe("above");
  });
});
