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

// Pagination & sort for borehole table
export const tableParsers = {
  page: parseAsInteger.withDefault(0),
  pageSize: parseAsInteger.withDefault(100),
  orderBy: parseAsString.withDefault("name"),
  direction: parseAsString.withDefault("ASC"),
  bottomDrawerOpen: parseAsBoolean.withDefault(false),
};

export const mapParsers = {
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
  workflowStatus: parseAsString,
};

export const useBoreholeUrlParams = () => {
  const [allFilterParams, setFilterParams] = useQueryStates(filterParsers);
  const filterParams = Object.fromEntries(Object.entries(allFilterParams).filter(([, value]) => value !== null));
  const [tableParams, setTableParams] = useQueryStates(tableParsers);
  const [mapParams, setMapParams] = useQueryStates(mapParsers);

  // Keep refs always pointing to the latest values so cleanup functions
  // (called on unmount) never close over stale state.
  const allFilterParamsRef = useRef(allFilterParams);
  allFilterParamsRef.current = allFilterParams;
  const tableParamsRef = useRef(tableParams);
  tableParamsRef.current = tableParams;

  const setFilterField = useCallback(
    (key: keyof typeof filterParsers, value: unknown) => {
      if (value === undefined) {
        void setFilterParams({ [key]: "null" });
      } else if (value === false) {
        void setFilterParams({ [key]: "false" });
      } else if (value === true) {
        void setFilterParams({ [key]: "true" });
      } else {
        void setFilterParams({ [key]: value ?? null });
      }
    },
    [setFilterParams],
  );

  const mapCenter: [number, number] | null =
    mapParams.mapCenterX !== null && mapParams.mapCenterY !== null
      ? [mapParams.mapCenterX, mapParams.mapCenterY]
      : null;

  const setMapCenter = (center: [number, number] | null) =>
    setMapParams(center ? { mapCenterX: center[0], mapCenterY: center[1] } : { mapCenterX: null, mapCenterY: null });

  const resetFilter = () => {
    // Set all filter keys to null to remove them from the URL
    const nulled = Object.fromEntries(Object.keys(filterParsers).map(k => [k, null]));
    void setFilterParams(nulled as Parameters<typeof setFilterParams>[0]);
  };

  const saveFilterParamsInSession = useCallback(() => {
    Object.entries(allFilterParamsRef.current).forEach(([key, value]) => {
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
    Object.entries(tableParamsRef.current).forEach(([key, value]) => {
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
      void setTableParams(updates as Parameters<typeof setTableParams>[0]);
    }
  }, [setTableParams]);

  const restoreFilterParamsFromSession = useCallback(() => {
    const updates: Record<string, unknown> = {};
    (Object.keys(filterParsers) as Array<keyof typeof filterParsers>).forEach(key => {
      const raw = sessionStorage.getItem(SessionKeys[key as keyof typeof SessionKeys]);
      if (raw !== null) {
        const parsed = filterParsers[key].parse(raw);
        if (parsed !== null) updates[key] = parsed;
      }
    });
    if (Object.keys(updates).length > 0) {
      void setFilterParams(updates as Parameters<typeof setFilterParams>[0]);
    }
  }, [setFilterParams]);

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
      void setMapParams(updates as Parameters<typeof setMapParams>[0]);
    }
  }, [setMapParams]);

  const activeFilterLength = Object.values(filterParams).filter(v => v !== null).length;

  return {
    filterParams,
    setFilterField,
    resetFilter,
    saveFilterParamsInSession,
    tableParams,
    saveTableParamsInSession,
    setTableParams,
    restoreTableParamsFromSession,
    restoreFilterParamsFromSession,
    restoreMapParamsFromSession,
    activeFilterLength,
    mapResolution: mapParams.mapResolution,
    setMapResolution: (v: number) => setMapParams({ mapResolution: v }),
    mapCenter,
    setMapCenter,
    bottomDrawerOpen: tableParams.bottomDrawerOpen,
    setBottomDrawerOpen: (v: boolean) => setTableParams({ bottomDrawerOpen: v }),
  };
};
