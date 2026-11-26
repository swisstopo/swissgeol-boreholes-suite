import { describe, expect, it } from "vitest";
import {
  ColumnCell,
  getColumnWindow,
  getVisibleRowRange,
  indexLayersByDepthId,
  layoutColumnCells,
  rowIndexAtClientY,
} from "./rowWindowing.ts";

const rowHeight = 100;

describe("getVisibleRowRange", () => {
  const range = (rowsTop: number, rowCount = 50, overscanRows = 0) =>
    getVisibleRowRange({ rowsTop, viewportTop: 0, viewportBottom: 300, rowHeight, rowCount, overscanRows });

  it("covers the rows that intersect the viewport", () => {
    expect(range(0)).toEqual({ first: 0, last: 2 });
    expect(range(-150)).toEqual({ first: 1, last: 4 });
  });

  it("widens the range by the overscan and clamps it to the rows", () => {
    expect(range(-1000, 50, 2)).toEqual({ first: 8, last: 14 });
    expect(range(0, 4, 2)).toEqual({ first: 0, last: 3 });
  });

  it("keeps the nearest row when the rows are out of view", () => {
    expect(range(500)).toEqual({ first: 0, last: 0 });
    expect(range(-10000, 50)).toEqual({ first: 49, last: 49 });
  });

  it("is empty without rows", () => {
    expect(range(0, 0)).toEqual({ first: 0, last: -1 });
  });
});

describe("rowIndexAtClientY", () => {
  it("resolves a border to the row above and clamps outside the rows", () => {
    expect(rowIndexAtClientY(150, 0, rowHeight, 5)).toBe(1);
    expect(rowIndexAtClientY(200, 0, rowHeight, 5)).toBe(1);
    expect(rowIndexAtClientY(201, 0, rowHeight, 5)).toBe(2);
    expect(rowIndexAtClientY(-50, 0, rowHeight, 5)).toBe(0);
    expect(rowIndexAtClientY(5000, 0, rowHeight, 5)).toBe(4);
  });

  it("measures from the top of the rows", () => {
    expect(rowIndexAtClientY(450, 300, rowHeight, 5)).toBe(1);
  });
});

describe("layoutColumnCells", () => {
  const depths = ["a", "b", "c", "d", "e"].map(id => ({ id }));

  it("places each layer at its first depth spanning its depths, and a gap at every other depth", () => {
    const layers = [{ depthIds: ["b", "c"] }, { depthIds: ["e"] }];

    const cells = layoutColumnCells(depths, layers, indexLayersByDepthId(layers));

    expect(cells).toEqual([
      { type: "gap", depthIdx: 0, firstRow: 0, lastRow: 0 },
      { type: "item", itemIdx: 0, firstRow: 1, lastRow: 2 },
      { type: "gap", depthIdx: 3, firstRow: 3, lastRow: 3 },
      { type: "item", itemIdx: 1, firstRow: 4, lastRow: 4 },
    ]);
  });
});

describe("getColumnWindow", () => {
  const cells: ColumnCell[] = [
    { type: "item", itemIdx: 0, firstRow: 0, lastRow: 3 },
    { type: "gap", depthIdx: 4, firstRow: 4, lastRow: 4 },
    { type: "item", itemIdx: 1, firstRow: 5, lastRow: 5 },
    { type: "item", itemIdx: 2, firstRow: 6, lastRow: 9 },
  ];

  it("keeps the cells that intersect the range and spaces the rows around them", () => {
    expect(getColumnWindow(cells, { first: 4, last: 5 }, 10)).toEqual({
      cells: [cells[1], cells[2]],
      rowsAbove: 4,
      rowsBelow: 4,
    });
  });

  it("keeps a cell that spans into the range from outside", () => {
    expect(getColumnWindow(cells, { first: 2, last: 4 }, 10)).toEqual({
      cells: [cells[0], cells[1]],
      rowsAbove: 0,
      rowsBelow: 5,
    });
  });

  it("spaces every row when no cell is in the range", () => {
    expect(getColumnWindow([], { first: 0, last: 2 }, 10)).toEqual({ cells: [], rowsAbove: 0, rowsBelow: 10 });
  });
});
