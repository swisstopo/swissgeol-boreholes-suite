import { GridRowSelectionModel } from "@mui/x-data-grid";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FeatureCollection, Geometry } from "geojson";
import { Codelist } from "../components/codelist.ts";
import { Photo } from "../pages/detail/attachments/tabs/photo.ts";
import { Observation } from "../pages/detail/form/hydrogeology/Observation.ts";
import { defaultHrsId, referenceSystems } from "../pages/detail/form/location/coordinateSegmentConstants.ts";
import { ReferenceSystemCode } from "../pages/detail/form/location/coordinateSegmentInterfaces.ts";
import { LogRun } from "../pages/detail/form/log/logInterfaces.ts";
import { Workflow } from "../pages/detail/form/workflow/workflow.ts";
import { SessionKeys } from "../pages/overview/SessionKey.ts";
import { Document, NullableDateString, User, Workgroup } from "./apiInterfaces.ts";
import { BoreholeGeometry } from "./boreholeGeometry.ts";
import { Completion } from "./completion.ts";
import { download, downloadData } from "./download.ts";
import { fetchApiV2Legacy, fetchApiV2WithApiError, upload } from "./fetchApiV2.ts";
import { Profile } from "./file/fileInterfaces.ts";
import { Section } from "./section.ts";
import { Stratigraphy } from "./stratigraphy.ts";
import { useCurrentUser } from "./user.ts";

export interface BasicIdentifier {
  id?: number;
  boreholeId: number;
  codelistId: number | null;
  codelist?: Codelist;
  value: string;
  comment?: string | null;
}

// Avoids circular reference for BoreholeV2
export interface Identifier extends BasicIdentifier {
  borehole?: BoreholeV2 | null;
}

export interface BoreholeV2 {
  lithologyTopBedrockId: number;
  lithostratigraphyTopBedrockId: number;
  chronostratigraphyTopBedrockId: number;
  hasGroundwater: boolean | null;
  topBedrockWeatheredMd: number;
  topBedrockFreshMd: number;
  topBedrockIntersected: boolean | null;
  depthPrecisionId: number;
  totalDepth: number;
  purposeId: number;
  typeId: number;
  remarks: string;
  statusId: number;
  workflow: Workflow | null;
  boreholeCodelists: BasicIdentifier[];
  workgroupId: number;
  workgroup: Workgroup;
  originalReferenceSystem: ReferenceSystemCode;
  precisionLocationYLV03: number;
  precisionLocationXLV03: number;
  precisionLocationY: number;
  precisionLocationX: number;
  locationXLV03: number | null;
  locationYLV03: number | null;
  id: number;
  locationX: number | null;
  locationY: number | null;
  municipality: string;
  country: string;
  canton: string;
  name: string;
  originalName: string;
  projectName: number;
  restrictionId: number;
  restrictionUntil: NullableDateString;
  nationalInterest: boolean | null;
  elevationZ: number | string; // Number with thousands separator then parsed to number
  elevationPrecisionId: number;
  referenceElevation: number | string; // Number with thousands separator then parsed to number
  referenceElevationPrecisionId: number;
  referenceElevationTypeId: number;
  locationPrecisionId: number | null;
  hrsId: number;
  updated: NullableDateString;
  updatedById: number;
  updatedBy: User;
  stratigraphies: Stratigraphy[] | null;
  logRuns: LogRun[] | null;
  locked: NullableDateString;
  lockedById: number | null;
  completions: Completion[] | null;
  observations: Observation[] | null;
  sections: Section[] | null;
  boreholeGeometry: BoreholeGeometry[] | null;
  boreholeFiles: Profile[] | null;
  photos: Photo[] | null;
  documents: Document[] | null;
  geometry: BoreholeGeometry | null;
}

const getIdQuery = (ids: number[] | GridRowSelectionModel) => ids.map(id => `ids=${id}`).join("&");

export const exportJsonBoreholes = async (boreholeIds: number[] | GridRowSelectionModel, fileName: string) => {
  const exportJsonResponse = await fetchApiV2Legacy(`boreholeexport/json?${getIdQuery(boreholeIds)}`, "GET");
  const jsonString = JSON.stringify(exportJsonResponse);
  downloadData(jsonString, `${fileName}.json`, "application/json");
};

export const importBoreholesCsv = async (workgroupId: number | null, combinedFormData: FormData) => {
  return await upload(`import/csv?workgroupId=${workgroupId}`, "POST", combinedFormData);
};

export const importBoreholesJson = async (workgroupId: number | null, combinedFormData: FormData) => {
  return await upload(`import/json?workgroupId=${workgroupId}`, "POST", combinedFormData);
};

export const importBoreholesZip = async (workgroupId: number | null, combinedFormData: FormData) => {
  return await upload(`import/zip?workgroupId=${workgroupId}`, "POST", combinedFormData);
};

const createBorehole = async (workgroupId: number): Promise<BoreholeV2> => {
  return await fetchApiV2WithApiError<BoreholeV2>(`borehole`, "POST", {
    workgroupId,
    originalReferenceSystem: referenceSystems.LV95.code,
    hrsId: defaultHrsId,
  });
};

export const copyBorehole = async (boreholeId: GridRowSelectionModel, workgroupId: number | null) => {
  return await fetchApiV2Legacy(`borehole/copy?id=${boreholeId}&workgroupId=${workgroupId}`, "POST");
};

export const exportCSVBorehole = async (boreholeIds: GridRowSelectionModel, fileName: string) => {
  const csvData = await fetchApiV2Legacy(`boreholeexport/csv?${getIdQuery(boreholeIds)}`, "GET");
  downloadData(csvData, `${fileName}.csv`, "text/csv");
};

export const exportJsonWithAttachmentsBorehole = async (boreholeIds: number[] | GridRowSelectionModel) => {
  return await download(`boreholeexport/zip?${getIdQuery(boreholeIds)}`);
};

const fetchBoreholeById = async (id: number): Promise<BoreholeV2> => {
  return await fetchApiV2WithApiError<BoreholeV2>(`borehole/${id}`, "GET");
};

const updateBorehole = async (borehole: BoreholeV2): Promise<BoreholeV2> => {
  return await fetchApiV2WithApiError<BoreholeV2>("borehole", "PUT", borehole);
};
const deleteBorehole = async (id: number) => await fetchApiV2WithApiError(`borehole?id=${id}`, "DELETE");

const canUserEditBorehole = async (id: number) =>
  await fetchApiV2WithApiError<boolean>(`permissions/canedit?boreholeId=${id}`, "GET");

const canUserUpdateBoreholeStatus = async (id: number) =>
  await fetchApiV2WithApiError<boolean>(`permissions/canchangestatus?boreholeId=${id}`, "GET");

export const boreholeQueryKey = "boreholes";

export const useBorehole = (id: number) => {
  return useQuery({
    queryKey: [boreholeQueryKey, id],
    queryFn: async () => {
      return await fetchBoreholeById(id);
    },
    enabled: !!id,
  });
};

export const canEditQueryKey = "canEditBorehole";
export const useBoreholeEditable = (id: number) => {
  const { data: currentUser } = useCurrentUser();
  return useQuery({
    queryKey: [canEditQueryKey, currentUser?.id, id],
    queryFn: async () => {
      return await canUserEditBorehole(id);
    },
    enabled: !!id,
  });
};

export const canUpdateStatusQueryKey = "canUpdateBoreholeStatus";
export const useBoreholeStatusEditable = (id: number) => {
  const { data: currentUser } = useCurrentUser();
  return useQuery({
    queryKey: [canUpdateStatusQueryKey, currentUser?.id, id],
    queryFn: async () => {
      return await canUserUpdateBoreholeStatus(id);
    },
    enabled: !!id,
  });
};

export const useBoreholeMutations = () => {
  const queryClient = useQueryClient();

  const useAddBorehole = useMutation({
    mutationFn: async (workgroupId: number) => {
      return await createBorehole(workgroupId);
    },
  });

  const useUpdateBorehole = useMutation({
    mutationFn: async (borehole: BoreholeV2) => {
      return await updateBorehole(borehole);
    },
    onSuccess: (_, borehole) => {
      queryClient.invalidateQueries({
        queryKey: [boreholeQueryKey],
      });
      // force immediate background refetch to have the borehole's lock status up to date on next render and prevent button flickering
      queryClient.refetchQueries({
        queryKey: [boreholeQueryKey, borehole.id],
        exact: true,
      });
    },
  });

  const useDeleteBorehole = useMutation({
    mutationFn: async (boreholeId: number) => {
      return await deleteBorehole(boreholeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [boreholeQueryKey],
      });
    },
  });
  return {
    add: useAddBorehole,
    update: useUpdateBorehole,
    delete: useDeleteBorehole,
  };
};

export const useReloadBoreholes = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [boreholeQueryKey] });
  };
};

// ---- Filter interfaces ----
export interface BoreholeListItem {
  id: number;
  originalName: string | null;
  name: string | null;
  workgroupId: number | null;
  workgroupName: string | null;
  statusId: number | null;
  typeId: number | null;
  purposeId: number | null;
  restrictionId: number | null;
  restrictionUntil: NullableDateString;
  nationalInterest: boolean | null;
  locationX: number | null;
  locationY: number | null;
  elevationZ: number | null;
  totalDepth: number | null;
  created: NullableDateString;
  updated: NullableDateString;
  isPublic: boolean | null;
  locked: NullableDateString;
}

enum NullableBooleanFilter {
  false,
  true,
  null,
}

enum BooleanFilter {
  false,
  true,
}

type BooleanFilterValue = "true" | "false" | undefined;
type NullableBooleanFilterValue = BooleanFilterValue | "null";

interface BaseFilterRequest {
  polygon?: Geometry | null;
  originalName?: string | null;
  projectName?: string | null;
  name?: string | null;
  statusId?: number[] | null;
  typeId?: number[] | null;
  purposeId?: number[] | null;
  workgroupId?: number[] | null;
  ids?: number[] | null;
  restrictionId?: number[] | null;
  restrictionUntilFrom?: string | null;
  restrictionUntilTo?: string | null;
  totalDepthMin?: number | null;
  totalDepthMax?: number | null;
  topBedrockFreshMdMin?: number | null;
  topBedrockFreshMdMax?: number | null;
  topBedrockWeatheredMdMin?: number | null;
  topBedrockWeatheredMdMax?: number | null;
  pageNumber?: number;
  pageSize?: number;
  orderBy?: string | null;
  direction?: string | null;
  workflowStatus?: string[] | null;
}

export interface FilterRequest extends BaseFilterRequest {
  nationalInterest?: NullableBooleanFilterValue;
  topBedrockIntersected?: NullableBooleanFilterValue;
  hasGroundwater?: NullableBooleanFilterValue;
  hasGeometry?: BooleanFilterValue;
  hasLogs?: BooleanFilterValue;
  hasProfiles?: BooleanFilterValue;
  hasPhotos?: BooleanFilterValue;
  hasDocuments?: BooleanFilterValue;
}

interface FilterRequestSubmission extends BaseFilterRequest {
  nationalInterest?: NullableBooleanFilter;
  topBedrockIntersected?: NullableBooleanFilter;
  hasGroundwater?: NullableBooleanFilter;
  hasGeometry?: BooleanFilter;
  hasLogs?: BooleanFilter;
  hasProfiles?: BooleanFilter;
  hasPhotos?: BooleanFilter;
  hasDocuments?: BooleanFilter;
}

export interface FilterResponse {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  boreholes: BoreholeListItem[];
  geoJson: FeatureCollection | null;
  filteredBoreholeIds: number[];
  selectableBoreholeIds: number[];
}

export interface NullableBooleanCounts {
  true: number;
  false: number;
  null: number;
}

export interface BooleanCounts {
  true: number;
  false: number;
}

export interface FilterStatsResponse {
  statusId: Record<number, number>;
  typeId: Record<number, number>;
  purposeId: Record<number, number>;
  workgroupId: Record<number, number>;
  restrictionId: Record<number, number>;
  workflowStatusCount: Record<string, number>;
  nationalInterest: NullableBooleanCounts;
  topBedrockIntersected: NullableBooleanCounts;
  hasGroundwater: NullableBooleanCounts;
  hasGeometry: BooleanCounts;
  hasLogs: BooleanCounts;
  hasProfiles: BooleanCounts;
  hasPhotos: BooleanCounts;
  hasDocuments: BooleanCounts;
}

export type BoreholeSuggestionField = "originalName" | "projectName" | "name";

interface BoreholeSuggestion {
  value: string;
  count: number;
}

export const filterBoreholes = async (filterRequest: FilterRequestSubmission): Promise<FilterResponse> => {
  return await fetchApiV2WithApiError<FilterResponse>("borehole/filter", "POST", filterRequest);
};

export const fetchFilterStats = async (filterRequest: FilterRequestSubmission): Promise<FilterStatsResponse> => {
  return await fetchApiV2WithApiError<FilterStatsResponse>("borehole/filter/stats", "POST", filterRequest);
};

const fetchBoreholeSuggestions = (
  field: BoreholeSuggestionField,
  query: string,
  limit = 10,
): Promise<BoreholeSuggestion[]> => {
  const params = new URLSearchParams({
    field,
    query,
    limit: String(limit),
  });
  return fetchApiV2WithApiError<BoreholeSuggestion[]>(`borehole/suggest?${params.toString()}`, "GET");
};

const parseBooleanFilter = (value: "true" | "false" | undefined | null): BooleanFilter | undefined => {
  if (value === "true") return BooleanFilter.true;
  if (value === "false") return BooleanFilter.false;
  return undefined;
};

const parseNullableBooleanFilter = (
  value: "true" | "false" | "null" | undefined | null,
): NullableBooleanFilter | undefined => {
  if (value === "true") return NullableBooleanFilter.true;
  if (value === "false") return NullableBooleanFilter.false;
  if (value === "null") return NullableBooleanFilter.null;
  return undefined;
};

export const toFilterRequestSubmission = (filterRequest: FilterRequest): FilterRequestSubmission => ({
  ...filterRequest,
  hasGroundwater: parseNullableBooleanFilter(filterRequest.hasGroundwater),
  topBedrockIntersected: parseNullableBooleanFilter(filterRequest.topBedrockIntersected),
  nationalInterest: parseNullableBooleanFilter(filterRequest.nationalInterest),
  hasGeometry: parseBooleanFilter(filterRequest.hasGeometry),
  hasLogs: parseBooleanFilter(filterRequest.hasLogs),
  hasProfiles: parseBooleanFilter(filterRequest.hasProfiles),
  hasPhotos: parseBooleanFilter(filterRequest.hasPhotos),
  hasDocuments: parseBooleanFilter(filterRequest.hasDocuments),
});

/**
 * Reads filter values from sessionStorage and constructs a FilterRequest object.
 */
export function getDefaultFilterRequestFromSession(): FilterRequest {
  const get = (key: string) => sessionStorage.getItem(key);

  const getInt = (key: string) => {
    const n = Number.parseInt(get(key) ?? "");
    return Number.isNaN(n) ? undefined : n;
  };

  const getFloat = (key: string) => {
    const n = Number.parseFloat(get(key) ?? "");
    return Number.isNaN(n) ? undefined : n;
  };

  const toArray = (n: number | undefined) => (n === undefined ? undefined : [n]);

  const allFilterParams = {
    pageNumber: (getInt(SessionKeys.page) ?? 0) + 1,
    pageSize: getInt(SessionKeys.pageSize) ?? 100,
    orderBy: get(SessionKeys.orderBy) ?? "name",
    direction: get(SessionKeys.direction) ?? "ASC",
    originalName: get(SessionKeys.originalName) ?? undefined,
    projectName: get(SessionKeys.projectName) ?? undefined,
    name: get(SessionKeys.name) ?? undefined,
    statusId: toArray(getInt(SessionKeys.statusId)),
    typeId: toArray(getInt(SessionKeys.typeId)),
    purposeId: toArray(getInt(SessionKeys.purposeId)),
    workgroupId: toArray(getInt(SessionKeys.workgroupId)),
    restrictionId: toArray(getInt(SessionKeys.restrictionId)),
    restrictionUntilFrom: get(SessionKeys.restrictionUntilFrom) ?? undefined,
    restrictionUntilTo: get(SessionKeys.restrictionUntilTo) ?? undefined,
    totalDepthMin: getFloat(SessionKeys.totalDepthMin),
    totalDepthMax: getFloat(SessionKeys.totalDepthMax),
    topBedrockFreshMdMin: getFloat(SessionKeys.topBedrockFreshMdMin),
    topBedrockFreshMdMax: getFloat(SessionKeys.topBedrockFreshMdMax),
    topBedrockWeatheredMdMin: getFloat(SessionKeys.topBedrockWeatheredMdMin),
    topBedrockWeatheredMdMax: getFloat(SessionKeys.topBedrockWeatheredMdMax),
    nationalInterest: get(SessionKeys.nationalInterest) as NullableBooleanFilterValue,
    topBedrockIntersected: get(SessionKeys.topBedrockIntersected) as NullableBooleanFilterValue,
    hasGroundwater: get(SessionKeys.hasGroundwater) as NullableBooleanFilterValue,
    hasGeometry: get(SessionKeys.hasGeometry) as BooleanFilterValue,
    hasLogs: get(SessionKeys.hasLogs) as BooleanFilterValue,
    hasProfiles: get(SessionKeys.hasProfiles) as BooleanFilterValue,
    hasPhotos: get(SessionKeys.hasPhotos) as BooleanFilterValue,
    hasDocuments: get(SessionKeys.hasDocuments) as BooleanFilterValue,
    workflowStatus: toArray(getInt(SessionKeys.workflowStatus)),
  };
  return Object.fromEntries(Object.entries(allFilterParams).filter(([, value]) => value != null));
}

export const useFilterBoreholes = (filterRequest: FilterRequest, enabled = true) => {
  const filterRequestSubmission = toFilterRequestSubmission(filterRequest);

  return useQuery({
    queryKey: [boreholeQueryKey, filterRequestSubmission],
    queryFn: () => filterBoreholes(filterRequestSubmission),
    enabled,
    placeholderData: keepPreviousData,
  });
};

export const useFilterStats = (filterRequest: FilterRequest) => {
  const filterRequestSubmission = toFilterRequestSubmission(filterRequest);

  return useQuery({
    queryKey: [boreholeQueryKey, "filter-stats", filterRequestSubmission],
    queryFn: () => fetchFilterStats(filterRequestSubmission),
    placeholderData: keepPreviousData,
  });
};

export const useBoreholeSuggestions = (field: BoreholeSuggestionField, query: string, fetchEnabled: boolean) => {
  return useQuery<BoreholeSuggestion[]>({
    queryKey: ["borehole-suggestions", field, query],
    queryFn: () => fetchBoreholeSuggestions(field, query, 10),
    enabled: fetchEnabled,
    staleTime: 30_000,
    placeholderData: previous => previous,
    retry: false,
  });
};
