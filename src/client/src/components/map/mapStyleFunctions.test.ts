import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { describe, expect, it } from "vitest";
import { legendSymbols } from "./legend/legendSymbols.ts";
import { boreholeTypeCodes, legendThemes } from "./legend/legendThemes.ts";
import { boreholeStyleFunction, noBoreholeHighlights, readMapFeatureProperties } from "./mapStyleFunctions.ts";
import { getSymbolStyle } from "./mapSymbolStyle.ts";

const boreholeType = legendThemes.boreholeType;

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
      hasProfiles: true,
      hasDocuments: false,
      hasPhotos: true,
    });

    expect(readMapFeatureProperties(feature)).toEqual({
      type: 20101001,
      restriction: 20111001,
      purpose: 22103001,
      totalDepth: 12.5,
      workflowStatus: "InReview",
      hasRequestedChanges: true,
      hasProfiles: true,
      hasDocuments: false,
      hasPhotos: true,
    });
  });

  it("reads missing and unknown attributes as not specified", () => {
    const feature = new Feature({
      geometry: new Point([0, 0]),
      id: 1,
      workflowStatus: "Archived",
      totalDepth: "12",
      hasProfiles: "true",
    });

    expect(readMapFeatureProperties(feature)).toEqual({
      type: null,
      restriction: null,
      purpose: null,
      totalDepth: null,
      workflowStatus: null,
      hasRequestedChanges: false,
      hasProfiles: false,
      hasDocuments: false,
      hasPhotos: false,
    });
  });
});
