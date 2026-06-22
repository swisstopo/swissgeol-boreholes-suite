import { describe, expect, it } from "vitest";
import type { LayerConfig } from "../components/map/map.ts";
import {
  addOverlay,
  MapOverlays,
  removeOverlay,
  setOverlayPosition,
  setOverlayTransparency,
  setOverlayVisibility,
} from "./mapOverlayUtils.ts";

const layer = (identifier: string, position: number): LayerConfig => ({
  type: "WMS",
  Identifier: identifier,
  url: "https://example.com/wms",
  position,
  visibility: true,
  transparency: 0,
});

describe("addOverlay", () => {
  it("adds a new overlay at the given position without changing existing ones", () => {
    const overlays: MapOverlays = { a: layer("a", 0) };

    const result = addOverlay(overlays, "b", layer("b", 1));

    expect(Object.keys(result)).toEqual(["a", "b"]);
    expect(result.b.position).toBe(1);
    expect(result.a.position).toBe(0);
  });
});

describe("removeOverlay", () => {
  it("removes the overlay and compacts positions of overlays after it", () => {
    const overlays: MapOverlays = { a: layer("a", 0), b: layer("b", 1), c: layer("c", 2) };

    const result = removeOverlay(overlays, "b");

    expect(Object.keys(result)).toEqual(["a", "c"]);
    expect(result.a.position).toBe(0);
    expect(result.c.position).toBe(1);
  });
});

describe("setOverlayVisibility / setOverlayTransparency", () => {
  it("updates only the targeted field of the targeted overlay", () => {
    const overlays: MapOverlays = { a: layer("a", 0), b: layer("b", 1) };

    const hidden = setOverlayVisibility(overlays, "a", false);
    expect(hidden.a.visibility).toBe(false);
    expect(hidden.b.visibility).toBe(true);

    const faded = setOverlayTransparency(overlays, "b", 75);
    expect(faded.b.transparency).toBe(75);
    expect(faded.a.transparency).toBe(0);
  });
});

describe("setOverlayPosition", () => {
  it("swaps the neighbor down when moving an overlay up", () => {
    const overlays: MapOverlays = { a: layer("a", 0), b: layer("b", 1), c: layer("c", 2) };

    const result = setOverlayPosition(overlays, "a", 1);

    expect(result.a.position).toBe(1);
    expect(result.b.position).toBe(0);
    expect(result.c.position).toBe(2);
  });

  it("swaps the neighbor up when moving an overlay down", () => {
    const overlays: MapOverlays = { a: layer("a", 0), b: layer("b", 1), c: layer("c", 2) };

    const result = setOverlayPosition(overlays, "c", 1);

    expect(result.c.position).toBe(1);
    expect(result.b.position).toBe(2);
    expect(result.a.position).toBe(0);
  });

  it("returns the overlays unchanged when the identifier is unknown", () => {
    const overlays: MapOverlays = { a: layer("a", 0) };

    expect(setOverlayPosition(overlays, "missing", 5)).toBe(overlays);
  });
});
