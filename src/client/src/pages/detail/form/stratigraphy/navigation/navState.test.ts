// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { NavState } from "./navState";

describe("NavState", () => {
  it("defaults all fields", () => {
    const s = new NavState();
    expect(s.lensStart).toBe(0);
    expect(s.rawLensSize).toBe(0);
    expect(s.height).toBe(0);
    expect(s.contentHeights).toEqual({});
    expect(s.headerHeights).toEqual({});
    expect(s.maxContent).toBe(0);
    expect(s.maxHeader).toBe(0);
  });

  it("derives pixelPerMeter from height and lensSize", () => {
    const s = new NavState({
      height: 600,
      rawLensSize: 100,
      contentHeights: { litho: 100 },
      headerHeights: { h: 100 },
    });
    // (600 - 100) / 100 = 5
    expect(s.pixelPerMeter).toBe(5);
  });

  it("uses maxContent for lensSize when rawLensSize is 0", () => {
    const s = new NavState({ rawLensSize: 0, contentHeights: { litho: 80 } });
    expect(s.lensSize).toBe(80);
  });

  it("setLensStart returns a new instance with updated lensStart", () => {
    const a = new NavState({ lensStart: 0 });
    const b = a.setLensStart(10);
    expect(a.lensStart).toBe(0);
    expect(b.lensStart).toBe(10);
    expect(b).not.toBe(a);
  });

  it("setContentHeightFromLayers picks the max toDepth", () => {
    const s = new NavState().setContentHeightFromLayers("litho", [{ toDepth: 5 }, { toDepth: 12 }, { toDepth: 9 }]);
    expect(s.contentHeights.litho).toBe(12);
  });

  it("setContentHeightFromLayers handles undefined layers as 0", () => {
    const s = new NavState().setContentHeightFromLayers("litho", undefined);
    expect(s.contentHeights.litho).toBe(0);
  });

  it("documents pixelPerMeter at each combination of unmeasured height and content", () => {
    // Default state: 0 / 0 -> NaN. Consumers must guard with Number.isFinite.
    expect(Number.isNaN(new NavState().pixelPerMeter)).toBe(true);
    // Height measured but content empty: positive / 0 -> Infinity.
    expect(Number.isFinite(new NavState({ height: 100 }).pixelPerMeter)).toBe(false);
    // Content set but height not yet measured: 0 / positive -> 0.
    expect(new NavState({ contentHeights: { litho: 50 } }).pixelPerMeter).toBe(0);
    // Both measured: normal positive value.
    expect(new NavState({ height: 500, contentHeights: { litho: 100 } }).pixelPerMeter).toBe(5);
  });

  it("auto-clamps lens when content shrinks below current viewport", () => {
    const s = new NavState({ lensStart: 50, rawLensSize: 30, contentHeights: { litho: 100 } });
    expect(s.lensEnd).toBe(80);
    const next = s.setContentHeight("litho", 60);
    expect(next.lensStart + next.lensSize).toBeLessThanOrEqual(60);
  });
});
