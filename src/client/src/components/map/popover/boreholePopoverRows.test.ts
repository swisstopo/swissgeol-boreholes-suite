import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { describe, expect, it } from "vitest";
import { legendSymbols } from "../legend/legendSymbols.ts";
import { boreholeTypeCodes, LegendTheme, legendThemes } from "../legend/legendThemes.ts";
import { BoreholePopoverRow, getPreviewRows, toPopoverRows } from "./boreholePopoverRows.ts";

const themeOfBoreholeType = (): LegendTheme => {
  const legendTheme = legendThemes.boreholeType;
  if (!legendTheme) throw new Error("The legend theme 'boreholeType' is not implemented.");
  return legendTheme;
};

const rowsOf = (count: number): BoreholePopoverRow[] =>
  Array.from({ length: count }, (_, index) => ({
    id: index,
    name: `Borehole ${index}`,
    symbol: legendSymbols.purpleHexagon,
    legendLabel: { kind: "translation", key: "np" },
  }));

describe("toPopoverRows", () => {
  it("lists the name, the symbol and the legend value of every borehole", () => {
    const features = [
      new Feature({ geometry: new Point([0, 0]), id: 7, name: "Kb 05/1", type: boreholeTypeCodes.trialPit }),
      new Feature({ geometry: new Point([0, 0]), id: 8, name: "Kb 05/2", type: null }),
    ];

    expect(toPopoverRows(features, themeOfBoreholeType())).toEqual([
      {
        id: 7,
        name: "Kb 05/1",
        symbol: legendSymbols.orangeTriangle,
        legendLabel: { kind: "codelist", codelistId: boreholeTypeCodes.trialPit },
      },
      {
        id: 8,
        name: "Kb 05/2",
        symbol: legendSymbols.lightGreyDiamond,
        legendLabel: { kind: "translation", key: "np" },
      },
    ]);
  });

  it("names a borehole without name by its id", () => {
    const features = [new Feature({ geometry: new Point([0, 0]), id: 9, type: null })];

    expect(toPopoverRows(features, themeOfBoreholeType())[0].name).toBe("9");
  });
});

describe("getPreviewRows", () => {
  it("shows up to five rows", () => {
    const rows = rowsOf(5);

    expect(getPreviewRows(rows)).toEqual({ visibleRows: rows, hiddenCount: 0 });
  });

  it("shows four rows and the number of the others when there are more than five", () => {
    const rows = rowsOf(7);

    expect(getPreviewRows(rows)).toEqual({ visibleRows: rows.slice(0, 4), hiddenCount: 3 });
  });
});
