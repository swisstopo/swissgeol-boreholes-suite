import { useCallback, useRef } from "react";
import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { SessionKeys } from "./SessionKey.ts";
import { nullableBooleanFilterKeys } from "./sidePanelContent/filter/filterUtils.ts";

// Pagination & sort for borehole table
const tableParsers = {
  page: parseAsInteger.withDefault(0),
  pageSize: parseAsInteger.withDefault(100),
  orderBy: parseAsString.withDefault("name"),
  direction: parseAsString.withDefault("ASC"),
  bottomDrawerOpen: parseAsBoolean.withDefault(false),
};

const mapParsers = {
  mapResolution: parseAsFloat.withDefault(500),
  mapCenterX: parseAsFloat,
  mapCenterY: parseAsFloat,
};

// Filter fields
export const filterParsers = {
  originalName: parseAsString,
  projectName: parseAsString,
  name: parseAsString,
  statusId: parseAsArrayOf(parseAsInteger),
  typeId: parseAsArrayOf(parseAsInteger),
  purposeId: parseAsArrayOf(parseAsInteger),
  workgroupId: parseAsArrayOf(parseAsInteger),
  restrictionId: parseAsArrayOf(parseAsInteger),
  canton: parseAsArrayOf(parseAsString),
  municipality: parseAsArrayOf(parseAsString),
  logToolTypeId: parseAsArrayOf(parseAsInteger),
  identifierTypeId: parseAsArrayOf(parseAsInteger),
  identifierValue: parseAsString,
  restrictionUntilFrom: parseAsString,
  restrictionUntilTo: parseAsString,
  totalDepthMin: parseAsFloat,
  totalDepthMax: parseAsFloat,
  topBedrockFreshMdMin: parseAsFloat,
  topBedrockFreshMdMax: parseAsFloat,
  topBedrockWeatheredMdMin: parseAsFloat,
  topBedrockWeatheredMdMax: parseAsFloat,
  nationalInterest: parseAsStringLiteral(["true", "false", "null"] as const),
  topBedrockIntersected: parseAsStringLiteral(["true", "false", "null"] as const),
  hasGroundwater: parseAsStringLiteral(["true", "false", "null"] as const),
  hasGeometry: parseAsStringLiteral(["true", "false", "null"] as const),
  hasLogs: parseAsStringLiteral(["true", "false", "null"] as const),
  hasProfiles: parseAsStringLiteral(["true", "false", "null"] as const),
  hasPhotos: parseAsStringLiteral(["true", "false", "null"] as const),
  hasDocuments: parseAsStringLiteral(["true", "false", "null"] as const),
  workflowStatus: parseAsArrayOf(parseAsString),
};

export type FilterKey = keyof typeof filterParsers;

const allParsers = { ...filterParsers, ...tableParsers, ...mapParsers };

export const useBoreholeUrlParams = () => {
  const [queryState, setQueryState] = useQueryStates(allParsers);
  const filterState = Object.fromEntries((Object.keys(filterParsers) as FilterKey[]).map(k => [k, queryState[k]])) as {
    [K in FilterKey]: (typeof queryState)[K];
  };
  const activeFilters = Object.fromEntries(Object.entries(filterState).filter(([, value]) => value !== null));
  const tableState = Object.fromEntries(
    (Object.keys(tableParsers) as (keyof typeof tableParsers)[]).map(k => [k, queryState[k]]),
  ) as { [K in keyof typeof tableParsers]: (typeof queryState)[K] };

  // Keep refs always pointing to the latest values so cleanup functions
  // (called on unmount) never close over stale state.
  const filterStateRef = useRef(filterState);
  filterStateRef.current = filterState;
  const tableStateRef = useRef(tableState);
  tableStateRef.current = tableState;

  // Encodes a filter value into the form `setQueryState` expects, with the special-cases for
  // booleans and nullable-boolean keys.
  const encodeFilterValue = useCallback(
    (key: FilterKey, value: string | string[] | number[] | boolean | null | undefined): unknown => {
      if (value === true) return "true";
      if (value === false) return "false";
      // Preserve the "null" literal ("Keine Angabe") for nullable boolean filter keys.
      if (value === null && nullableBooleanFilterKeys.has(key)) return "null";
      // Any other null/undefined clears the URL param.
      if (value === null || value === undefined) return null;
      return value;
    },
    [],
  );

  // Every filter mutation also resets the page in the SAME setQueryState call. Splitting the
  // page reset into a separate setQueryState invocation on the merged useQueryStates instance
  // races and one update overwrites the other.
  const setFilterField = useCallback(
    (key: FilterKey, value: string | string[] | number[] | boolean | null | undefined) => {
      setQueryState({ [key]: encodeFilterValue(key, value), page: 0 } as Parameters<typeof setQueryState>[0]);
    },
    [encodeFilterValue, setQueryState],
  );

  // Removes the param from the URL entirely. Unlike `setFilterField(key, null)`, which preserves
  // the literal "null" in the URL for nullable boolean keys (meaning "Keine Angabe"), this helper
  // always drops the key so downstream consumers see an unset filter. Page resets atomically
  // for the same reason as `setFilterField`.
  const clearFilterField = useCallback(
    (key: FilterKey) => {
      setQueryState({ [key]: null, page: 0 } as Parameters<typeof setQueryState>[0]);
      sessionStorage.removeItem(SessionKeys[key as keyof typeof SessionKeys]);
    },
    [setQueryState],
  );

  const mapCenter: [number, number] | null =
    queryState.mapCenterX !== null && queryState.mapCenterY !== null
      ? [queryState.mapCenterX, queryState.mapCenterY]
      : null;

  const setMapCenter = (center: [number, number] | null) =>
    setQueryState(center ? { mapCenterX: center[0], mapCenterY: center[1] } : { mapCenterX: null, mapCenterY: null });

  const resetFilter = () => {
    // Set all filter keys to null to remove them from the URL, and reset to page 0 in the
    // same setQueryState call, see setFilterField for why this must be atomic.
    const nulled = Object.fromEntries(Object.keys(filterParsers).map(k => [k, null]));
    setQueryState({ ...nulled, page: 0 } as Parameters<typeof setQueryState>[0]);
    (Object.keys(filterParsers) as Array<FilterKey>).forEach(key => {
      sessionStorage.removeItem(SessionKeys[key as keyof typeof SessionKeys]);
    });
  };

  const saveFilterParamsInSession = useCallback(() => {
    Object.entries(filterStateRef.current).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        sessionStorage.setItem(
          SessionKeys[key as keyof typeof SessionKeys],
          Array.isArray(value) ? value.join(",") : String(value),
        );
      } else {
        sessionStorage.removeItem(SessionKeys[key as keyof typeof SessionKeys]);
      }
    });
  }, []);

  const saveTableParamsInSession = useCallback(() => {
    Object.entries(tableStateRef.current).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        sessionStorage.setItem(
          SessionKeys[key as keyof typeof SessionKeys],
          Array.isArray(value) ? value.join(",") : String(value),
        );
      } else {
        sessionStorage.removeItem(SessionKeys[key as keyof typeof SessionKeys]);
      }
    });
  }, []);

  const restoreTableParamsFromSession = useCallback(() => {
    const updates: Record<string, unknown> = {};
    (Object.keys(tableParsers) as Array<keyof typeof tableParsers>).forEach(key => {
      const raw = sessionStorage.getItem(SessionKeys[key as keyof typeof SessionKeys]);
      if (raw !== null) {
        const parsed = tableParsers[key].parse(raw);
        if (parsed !== null) updates[key] = parsed;
      }
    });
    if (Object.keys(updates).length > 0) {
      setQueryState(updates as Parameters<typeof setQueryState>[0]);
    }
  }, [setQueryState]);

  const restoreFilterParamsFromSession = useCallback(() => {
    // URL takes precedence over session: if ANY filter is already set via the URL,
    // skip restoring filter values from sessionStorage entirely.
    const hasUrlFilter = Object.values(filterStateRef.current).some(v => v !== null);
    if (hasUrlFilter) {
      return;
    }
    const updates: Record<string, unknown> = {};
    (Object.keys(filterParsers) as Array<FilterKey>).forEach(key => {
      const raw = sessionStorage.getItem(SessionKeys[key as keyof typeof SessionKeys]);
      if (raw !== null) {
        const parsed = filterParsers[key].parse(raw);
        if (parsed !== null) updates[key] = parsed;
      }
    });
    if (Object.keys(updates).length > 0) {
      setQueryState(updates as Parameters<typeof setQueryState>[0]);
    }
  }, [setQueryState]);

  const restoreMapParamsFromSession = useCallback(() => {
    const updates: Record<string, unknown> = {};
    (Object.keys(mapParsers) as Array<keyof typeof mapParsers>).forEach(key => {
      const raw = sessionStorage.getItem(SessionKeys[key as keyof typeof SessionKeys]);
      if (raw !== null) {
        const parsed = mapParsers[key].parse(raw);
        if (parsed !== null) updates[key] = parsed;
      }
    });
    if (Object.keys(updates).length > 0) {
      setQueryState(updates as Parameters<typeof setQueryState>[0]);
    }
  }, [setQueryState]);

  const activeFilterCount = Object.values(activeFilters).filter(v => v !== null).length;

  return {
    activeFilters,
    setFilterField,
    clearFilterField,
    resetFilter,
    saveFilterParamsInSession,
    tableState,
    saveTableParamsInSession,
    setQueryState,
    restoreTableParamsFromSession,
    restoreFilterParamsFromSession,
    restoreMapParamsFromSession,
    activeFilterCount,
    mapResolution: queryState.mapResolution,
    setMapResolution: (v: number) => setQueryState({ mapResolution: v }),
    mapCenter,
    setMapCenter,
    bottomDrawerOpen: tableState.bottomDrawerOpen,
    setBottomDrawerOpen: (v: boolean) => setQueryState({ bottomDrawerOpen: v }),
  };
};
