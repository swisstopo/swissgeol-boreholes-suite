import { FeatureLike } from "ol/Feature";
import { LegendSymbol } from "../legend/legendSymbols.ts";
import { LegendLabel, LegendTheme } from "../legend/legendThemes.ts";
import { readMapFeatureProperties } from "../mapStyleFunctions.ts";

/**
 * A borehole listed in the map popover, with its symbol and value in the active legend theme.
 */
export interface BoreholePopoverRow {
  id: number;
  name: string;
  symbol: LegendSymbol;
  legendLabel: LegendLabel;
}

// The preview shows at most this many rows; with more boreholes it shows one row less and the number of the others.
export const maxPreviewRows = 5;

export const toPopoverRows = (features: readonly FeatureLike[], legendTheme: LegendTheme): BoreholePopoverRow[] =>
  features.map(feature => {
    const id = feature.get("id") as number;
    const name = feature.get("name") as string | undefined;
    const entry = legendTheme.classify(readMapFeatureProperties(feature));
    return { id, name: name ?? String(id), symbol: entry.symbol, legendLabel: entry.label };
  });

/**
 * Splits the rows into the ones the preview shows and the number of the others.
 */
export const getPreviewRows = (rows: readonly BoreholePopoverRow[]) => {
  if (rows.length <= maxPreviewRows) return { visibleRows: rows, hiddenCount: 0 };
  const visibleRows = rows.slice(0, maxPreviewRows - 1);
  return { visibleRows, hiddenCount: rows.length - visibleRows.length };
};
