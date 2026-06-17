// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { mapExtractionResponse } from "./dataextraction.ts";
import { ExtractionBoundingBox, StratigraphyExtractionResponse } from "./dataextractionInterfaces.ts";

const layer = (text: string) => ({
  start: { depth: 0, bounding_boxes: [] as ExtractionBoundingBox[] },
  end: { depth: 1, bounding_boxes: [] as ExtractionBoundingBox[] },
  material_description: { text, bounding_boxes: [] as ExtractionBoundingBox[] },
});

const responseWith = (...texts: string[]): StratigraphyExtractionResponse => ({
  boreholes: [{ id: "b1", page_numbers: [1], layers: texts.map(layer) }],
});

describe("mapExtractionResponse", () => {
  it("drops layers with an empty description", () => {
    const result = mapExtractionResponse(responseWith("Gravel", "", "Sand"));

    expect(result[0].descriptions.map(d => d.description)).toEqual(["Gravel", "Sand"]);
  });

  it("keeps layers with a non-empty description", () => {
    const result = mapExtractionResponse(responseWith("Gravel", "Sand"));

    expect(result[0].descriptions).toHaveLength(2);
  });

  it("returns no descriptions when every layer has an empty description", () => {
    const result = mapExtractionResponse(responseWith("", ""));

    expect(result[0].descriptions).toHaveLength(0);
  });
});
