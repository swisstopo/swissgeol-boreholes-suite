/** Inclusive range of row indexes. It is empty when `last` is smaller than `first`. */
export interface RowRange {
  first: number;
  last: number;
}

/** A cell of a data column, covering the depth rows `firstRow` to `lastRow`. */
export type ColumnCell =
  | { type: "gap"; depthIdx: number; firstRow: number; lastRow: number }
  | { type: "item"; itemIdx: number; firstRow: number; lastRow: number };

/** The cells of a column to render, and how many rows the spacers above and below them stand in for. */
export interface ColumnWindow {
  cells: ColumnCell[];
  rowsAbove: number;
  rowsBelow: number;
}

interface VisibleRowRangeInput {
  rowsTop: number; // Client Y of the first row's top edge.
  viewportTop: number;
  viewportBottom: number;
  rowHeight: number;
  rowCount: number;
  overscanRows: number; // Extra rows rendered above and below the viewport.
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/**
 * Rows that intersect the viewport, widened by `overscanRows` on each side. A table scrolled
 * completely out of view still yields its nearest row, so the range is never empty while rows exist.
 */
export const getVisibleRowRange = ({
  rowsTop,
  viewportTop,
  viewportBottom,
  rowHeight,
  rowCount,
  overscanRows,
}: VisibleRowRangeInput): RowRange => {
  if (rowCount === 0) return { first: 0, last: -1 };
  const firstVisible = Math.floor((viewportTop - rowsTop) / rowHeight);
  const lastVisible = Math.ceil((viewportBottom - rowsTop) / rowHeight) - 1;
  const first = clamp(firstVisible - overscanRows, 0, rowCount - 1);
  const last = clamp(lastVisible + overscanRows, first, rowCount - 1);
  return { first, last };
};

/**
 * Index of the row under `clientY` for rows of equal height starting at `rowsTop`. A position
 * exactly on a border belongs to the row above; positions outside the rows clamp to the first or
 * last row.
 */
export const rowIndexAtClientY = (clientY: number, rowsTop: number, rowHeight: number, rowCount: number): number =>
  clamp(Math.ceil((clientY - rowsTop) / rowHeight) - 1, 0, rowCount - 1);

/** Maps each depth id to the index of the layer that covers it. */
export const indexLayersByDepthId = (layers: ReadonlyArray<{ depthIds?: string[] }>): Map<string, number> => {
  const layerIndexByDepthId = new Map<string, number>();
  layers.forEach((layer, idx) => {
    for (const id of layer.depthIds ?? []) {
      layerIndexByDepthId.set(id, idx);
    }
  });
  return layerIndexByDepthId;
};

/**
 * Lays out a data column over the depth rows: a depth no layer covers is a one-row gap, and a
 * layer starts at its first depth and spans as many rows as it has depth ids.
 */
export const layoutColumnCells = (
  depths: ReadonlyArray<{ id: string }>,
  layers: ReadonlyArray<{ depthIds?: string[] }>,
  layerIndexByDepthId: ReadonlyMap<string, number>,
): ColumnCell[] => {
  const cells: ColumnCell[] = [];
  const placedLayers = new Set<number>();
  depths.forEach((depth, depthIdx) => {
    const itemIdx = layerIndexByDepthId.get(depth.id);
    if (itemIdx === undefined) {
      cells.push({ type: "gap", depthIdx, firstRow: depthIdx, lastRow: depthIdx });
    } else if (!placedLayers.has(itemIdx)) {
      const rowSpan = layers[itemIdx].depthIds?.length ?? 1;
      cells.push({ type: "item", itemIdx, firstRow: depthIdx, lastRow: depthIdx + rowSpan - 1 });
      placedLayers.add(itemIdx);
    }
    // else: the layer was placed at an earlier depth and its cell spans through here.
  });
  return cells;
};

/** The cells that intersect `range`, plus the rows the spacers above and below them replace. */
export const getColumnWindow = (cells: ReadonlyArray<ColumnCell>, range: RowRange, rowCount: number): ColumnWindow => {
  const visibleCells = cells.filter(cell => cell.lastRow >= range.first && cell.firstRow <= range.last);
  const firstCell = visibleCells.at(0);
  const lastCell = visibleCells.at(-1);
  if (!firstCell || !lastCell) return { cells: [], rowsAbove: 0, rowsBelow: rowCount };
  return {
    cells: visibleCells,
    rowsAbove: firstCell.firstRow,
    rowsBelow: Math.max(0, rowCount - 1 - lastCell.lastRow),
  };
};
