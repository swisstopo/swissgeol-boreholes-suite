import { FilterStatsResponse, NullableBooleanCounts } from "../../../../api/borehole.ts";
import { FilterKey } from "../../useBoreholeUrlParams.ts";

export const parseBooleanFilterValue = (value: unknown): boolean | null | undefined => {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  return undefined;
};

export const getBooleanCountsForField = (
  stats: FilterStatsResponse | undefined,
  field: string,
): NullableBooleanCounts | undefined => {
  if (!stats) return undefined;
  const value = (stats as unknown as Record<string, unknown>)[field];
  if (!value || typeof value !== "object") return undefined;
  const v = value as { true?: number; false?: number; null?: number };
  return { true: v.true ?? 0, false: v.false ?? 0, null: v.null ?? 0 };
};

export const getDomainCountsForField = (
  stats: FilterStatsResponse | undefined,
  field: string,
): Record<number, number> | undefined => {
  if (!stats) return undefined;
  const value = (stats as unknown as Record<string, unknown>)[field];
  if (!value || typeof value !== "object") return undefined;
  return value as Record<number, number>;
};

// Filter keys whose parser accepts "null" as a valid literal value (for the "Keine Angabe" option).
export const nullableBooleanFilterKeys: ReadonlySet<FilterKey> = new Set([
  "nationalInterest",
  "topBedrockIntersected",
  "hasGroundwater",
]);
