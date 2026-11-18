import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { describe, expect, it } from "vitest";
import { legendSymbols } from "./legend/legendSymbols.ts";
import { boreholeTypeCodes, LegendTheme, legendThemes } from "./legend/legendThemes.ts";
import { boreholeStyleFunction, noBoreholeHighlights } from "./mapStyleFunctions.ts";
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
