import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { describe, expect, it } from "vitest";
import { boreholeSymbolHalfHeight } from "./boreholePopoverPlacement.ts";
import {
  BoreholePopoverState,
  getBoreholeHighlights,
  getHoveredBoreholeIds,
  haveSameBoreholes,
  haveSameHighlights,
} from "./boreholePopoverState.ts";

const borehole = (id: number) => new Feature({ geometry: new Point([0, 0]), id });

const first = borehole(1);
const second = borehole(2);

const popoverOf = (features: Feature[], pinned: boolean): BoreholePopoverState => ({
  features,
  anchor: { coordinates: [[0, 0]], halfHeight: boreholeSymbolHalfHeight },
  pinned,
  cluster: null,
});

describe("getHoveredBoreholeIds", () => {
  it("is empty without popover", () => {
    expect(getHoveredBoreholeIds(null, null)).toEqual([]);
  });

  it("is every borehole of the preview", () => {
    expect(getHoveredBoreholeIds(popoverOf([first, second], false), null)).toEqual([1, 2]);
  });

  it("is the borehole of the hovered row of a pinned popover", () => {
    const pinned = popoverOf([first, second], true);

    expect(getHoveredBoreholeIds(pinned, 2)).toEqual([2]);
    expect(getHoveredBoreholeIds(pinned, null)).toEqual([]);
  });
});

describe("getBoreholeHighlights", () => {
  it("marks the boreholes of the preview and of the table as hovered", () => {
    const highlights = getBoreholeHighlights(popoverOf([first], false), null, [5]);

    expect(highlights.hovered).toEqual(new Set([5, 1]));
    expect(highlights.active).toEqual(new Set());
  });

  it("marks the boreholes of a pinned popover as active and the hovered row as hovered", () => {
    const highlights = getBoreholeHighlights(popoverOf([first, second], true), 2, []);

    expect(highlights.hovered).toEqual(new Set([2]));
    expect(highlights.active).toEqual(new Set([1, 2]));
  });
});

describe("haveSameBoreholes", () => {
  it("compares the features in order", () => {
    expect(haveSameBoreholes([first, second], [first, second])).toBe(true);
    expect(haveSameBoreholes([first, second], [second, first])).toBe(false);
    expect(haveSameBoreholes([first], [first, second])).toBe(false);
  });
});

describe("haveSameHighlights", () => {
  it("compares the ids regardless of order", () => {
    const highlights = { hovered: new Set([1, 2]), active: new Set([3]) };

    expect(haveSameHighlights(highlights, { hovered: new Set([2, 1]), active: new Set([3]) })).toBe(true);
    expect(haveSameHighlights(highlights, { hovered: new Set([1]), active: new Set([3]) })).toBe(false);
    expect(haveSameHighlights(highlights, { hovered: new Set([1, 2]), active: new Set() })).toBe(false);
  });
});
