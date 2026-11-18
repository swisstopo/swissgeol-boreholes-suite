import { describe, expect, it } from "vitest";
import { getPopoverAnchors, getPopoverPlacement, popoverOffset } from "./boreholePopoverPlacement.ts";

describe("getPopoverAnchors", () => {
  it("centres the anchors over the boreholes, at the topmost and the bottommost one", () => {
    expect(
      getPopoverAnchors([
        [10, 100],
        [30, 80],
      ]),
    ).toEqual({ above: [20, 100], below: [20, 80] });
  });
});

describe("getPopoverPlacement", () => {
  const popoverHeight = 100;
  const fitsAbove = popoverOffset + popoverHeight + 8;

  it("opens above when the popover fits there", () => {
    expect(getPopoverPlacement(fitsAbove, fitsAbove, 800, popoverHeight)).toBe("above");
  });

  it("opens below when the popover does not fit above and there is more space below", () => {
    expect(getPopoverPlacement(fitsAbove - 1, fitsAbove - 1, 800, popoverHeight)).toBe("below");
  });

  it("stays above when there is even less space below", () => {
    expect(getPopoverPlacement(60, 60, 100, popoverHeight)).toBe("above");
  });
});
