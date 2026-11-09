import { describe, expect, it } from "vitest";
import { getJsonExportSelection, maxJsonExportCount } from "./jsonExportSelection.ts";

const selectionOf = (count: number) => Array.from({ length: count }, (_, index) => index + 1);

describe("getJsonExportSelection", () => {
  it("exports a selection of the maximum size without asking", () => {
    const selection = selectionOf(maxJsonExportCount);

    const { ids, confirmation } = getJsonExportSelection(selection);

    expect(ids).toEqual(selection);
    expect(confirmation).toBeUndefined();
  });

  it("exports only the first boreholes of a larger selection and asks first", () => {
    const selection = selectionOf(maxJsonExportCount + 1);

    const { ids, confirmation } = getJsonExportSelection(selection);

    expect(ids).toEqual(selection.slice(0, maxJsonExportCount));
    expect(confirmation).toEqual({
      message: "exportJsonLimited",
      confirmLabel: "exportFirstCount",
      exportedCount: maxJsonExportCount,
    });
  });
});
