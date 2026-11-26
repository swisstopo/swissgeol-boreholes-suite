import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { describe, expect, it } from "vitest";
import { legendSymbols } from "./legend/legendSymbols.ts";
import { boreholeTypeCodes, LegendTheme, legendThemes } from "./legend/legendThemes.ts";
import { groupByLocation } from "./locationBadges.ts";
import { getBadgeStyle } from "./mapBadgeStyle.ts";
import {
  boreholeStyleFunction,
  clusterStyleFunction,
  locationStyleFunction,
  noBoreholeHighlights,
  readMapFeatureProperties,
} from "./mapStyleFunctions.ts";
import { getSymbolStyle } from "./mapSymbolStyle.ts";

const themeOfBoreholeType = (): LegendTheme => {
  const legendTheme = legendThemes.boreholeType;
  if (!legendTheme) throw new Error("The legend theme 'boreholeType' is not implemented.");
  return legendTheme;
};

const boreholeType = themeOfBoreholeType();

const boreholeFeature = (id: number) =>
  new Feature({ geometry: new Point([0, 0]), id, type: boreholeTypeCodes.borehole, restriction: null });

describe("boreholeStyleFunction", () => {
  it("draws a borehole without highlight with the plain symbol", () => {
    const style = boreholeStyleFunction(boreholeFeature(1), boreholeType, noBoreholeHighlights);

    expect(style).toBe(getSymbolStyle(legendSymbols.purpleHexagon, null));
  });

  it("outlines a hovered borehole in the hover colour", () => {
    const style = boreholeStyleFunction(boreholeFeature(1), boreholeType, {
      hovered: new Set([1]),
      active: new Set(),
    });

    expect(style).toBe(getSymbolStyle(legendSymbols.purpleHexagon, "hover"));
  });

  it("outlines an active borehole in the active colour", () => {
    const style = boreholeStyleFunction(boreholeFeature(1), boreholeType, {
      hovered: new Set(),
      active: new Set([1]),
    });

    expect(style).toBe(getSymbolStyle(legendSymbols.purpleHexagon, "active"));
  });

  it("shows a borehole that is both active and hovered as hovered", () => {
    const style = boreholeStyleFunction(boreholeFeature(1), boreholeType, {
      hovered: new Set([1]),
      active: new Set([1]),
    });

    expect(style).toBe(getSymbolStyle(legendSymbols.purpleHexagon, "hover"));
  });

  it("draws hovered boreholes above active ones and active ones above the others", () => {
    const zIndexOf = (highlight: "hover" | "active" | null) =>
      getSymbolStyle(legendSymbols.purpleHexagon, highlight).getZIndex() ?? 0;

    expect(zIndexOf("hover")).toBeGreaterThan(zIndexOf("active"));
    expect(zIndexOf("active")).toBeGreaterThan(zIndexOf(null));
  });
});

// The borehole features all lie at [0, 0], so they form one badge.
const badgeOf = (...ids: number[]) => groupByLocation(ids.map(id => boreholeFeature(id)))[0];

describe("locationStyleFunction", () => {
  it("draws a borehole alone at its location with its symbol", () => {
    const style = locationStyleFunction(boreholeFeature(1), boreholeType, noBoreholeHighlights);

    expect(style).toBe(getSymbolStyle(legendSymbols.purpleHexagon, null));
  });

  it("draws boreholes at the same location as a badge with their number", () => {
    const style = locationStyleFunction(badgeOf(1, 2), boreholeType, noBoreholeHighlights);

    expect(style).toBe(getBadgeStyle(2, null));
  });

  it("outlines a badge in the active colour when one of its boreholes is active", () => {
    const style = locationStyleFunction(badgeOf(1, 2), boreholeType, {
      hovered: new Set([7]),
      active: new Set([2]),
    });

    expect(style).toBe(getBadgeStyle(2, "active"));
  });

  it("outlines a badge in the hover colour when one of its boreholes is hovered and another is active", () => {
    const style = locationStyleFunction(badgeOf(1, 2), boreholeType, {
      hovered: new Set([2]),
      active: new Set([1]),
    });

    expect(style).toBe(getBadgeStyle(2, "hover"));
  });
});

describe("clusterStyleFunction", () => {
  const clusterOf = (...ids: number[]) =>
    new Feature({ geometry: new Point([0, 0]), features: ids.map(id => boreholeFeature(id)) });

  it("draws a cluster as a badge with the number of its boreholes", () => {
    const style = clusterStyleFunction(clusterOf(1, 2, 3), boreholeType, noBoreholeHighlights, null);

    expect(style).toBe(getBadgeStyle(3, null));
  });

  it("outlines a cluster only while it is hovered itself, not when its boreholes are hovered elsewhere", () => {
    const cluster = clusterOf(1, 2, 3);
    const tableHovered = { hovered: new Set([1]), active: new Set<number>() };

    expect(clusterStyleFunction(cluster, boreholeType, noBoreholeHighlights, cluster)).toBe(getBadgeStyle(3, "hover"));
    expect(clusterStyleFunction(cluster, boreholeType, tableHovered, clusterOf(4, 5))).toBe(getBadgeStyle(3, null));
  });

  it("draws a cluster with a single borehole with the borehole's symbol and highlight", () => {
    const tableHovered = { hovered: new Set([1]), active: new Set<number>() };

    expect(clusterStyleFunction(clusterOf(1), boreholeType, noBoreholeHighlights, null)).toBe(
      getSymbolStyle(legendSymbols.purpleHexagon, null),
    );
    expect(clusterStyleFunction(clusterOf(1), boreholeType, tableHovered, null)).toBe(
      getSymbolStyle(legendSymbols.purpleHexagon, "hover"),
    );
  });
});

describe("readMapFeatureProperties", () => {
  it("reads the legend attributes of a map feature", () => {
    const feature = new Feature({
      geometry: new Point([0, 0]),
      id: 1,
      type: 20101001,
      restriction: 20111001,
      purpose: 22103001,
      totalDepth: 12.5,
      workflowStatus: "InReview",
      hasRequestedChanges: true,
    });

    expect(readMapFeatureProperties(feature)).toEqual({
      type: 20101001,
      restriction: 20111001,
      purpose: 22103001,
      totalDepth: 12.5,
      workflowStatus: "InReview",
      hasRequestedChanges: true,
    });
  });

  it("reads missing and unknown attributes as not specified", () => {
    const feature = new Feature({ geometry: new Point([0, 0]), id: 1, workflowStatus: "Archived", totalDepth: "12" });

    expect(readMapFeatureProperties(feature)).toEqual({
      type: null,
      restriction: null,
      purpose: null,
      totalDepth: null,
      workflowStatus: null,
      hasRequestedChanges: false,
    });
  });
});
