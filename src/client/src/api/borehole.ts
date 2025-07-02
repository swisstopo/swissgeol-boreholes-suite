import { GridRowSelectionModel } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Workflow } from "../api-lib/ReduxStateInterfaces.ts";
import { Codelist } from "../components/codelist.ts";
import { useShowAlertOnError } from "../hooks/useShowAlertOnError.ts";
import { Observation } from "../pages/detail/form/hydrogeology/Observation.ts";
import { ReferenceSystemCode } from "../pages/detail/form/location/coordinateSegmentInterfaces.ts";
import { WorkflowV2 } from "../pages/detail/form/workflow/workflow.ts";
import { Photo, User, Workgroup } from "./apiInterfaces.ts";
import { BoreholeGeometry } from "./boreholeGeometry.ts";
import { Completion } from "./completion.ts";
import { download, fetchApiV2, upload } from "./fetchApiV2.ts";
import { BoreholeFile } from "./file/fileInterfaces.ts";
import { Section } from "./section.ts";
import { Stratigraphy } from "./stratigraphy.ts";

export interface BasicIdentifier {
  boreholeId: number;
  codelistId: number | null;
  codelist?: Codelist;
  value: string;
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
  workflow: WorkflowV2 | null;
  boreholeCodelists: BasicIdentifier[];
  workflows: Workflow[];
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
  restrictionUntil: Date | string | null;
  nationalInterest: boolean | null;
  elevationZ: number | string; // Number with thousands separator then parsed to number
  elevationPrecisionId: number;
  referenceElevation: number | string; // Number with thousands separator then parsed to number
  referenceElevationPrecisionId: number;
  referenceElevationTypeId: number;
  locationPrecisionId: number | null;
  hrsId: number;
  updated: Date | string | null;
  updatedById: number;
  updatedBy: User;
  stratigraphies: Stratigraphy[] | null;
  locked: Date | string | null;
  lockedById: number | null;
  completions: Completion[] | null;
  observations: Observation[] | null;
  sections: Section[] | null;
  boreholeGeometry: BoreholeGeometry[] | null;
  boreholeFiles: BoreholeFile[] | null;
  photos: Photo[] | null;
}

const getIdQuery = (ids: number[] | GridRowSelectionModel) => ids.map(id => `ids=${id}`).join("&");

export const exportJsonBoreholes = async (boreholeIds: number[] | GridRowSelectionModel) => {
  return await fetchApiV2(`export/json?${getIdQuery(boreholeIds)}`, "GET");
};

export const exportGeoPackageBoreholes = async (boreholeIds: number[] | GridRowSelectionModel) => {
  return await fetchApiV2(`export/gpkg?${getIdQuery(boreholeIds)}`, "GET");
};

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const importBoreholesCsv = async (workgroupId: number | null, combinedFormData: any) => {
  return await upload(`import/csv?workgroupId=${workgroupId}`, "POST", combinedFormData);
};

export const importBoreholesJson = async (workgroupId: number | null, combinedFormData: any) => {
  return await upload(`import/json?workgroupId=${workgroupId}`, "POST", combinedFormData);
};

export const importBoreholesZip = async (workgroupId: number | null, combinedFormData: any) => {
  return await upload(`import/zip?workgroupId=${workgroupId}`, "POST", combinedFormData);
};

export const createBorehole = async (workgroupId: number): Promise<BoreholeV2> => {
  return await fetchApiV2(`borehole`, "POST", { workgroupId });
};

export const copyBorehole = async (boreholeId: GridRowSelectionModel, workgroupId: number | null) => {
  return await fetchApiV2(`borehole/copy?id=${boreholeId}&workgroupId=${workgroupId}`, "POST");
};

export const getAllBoreholes = async (ids: number[] | GridRowSelectionModel, pageNumber: number, pageSize: number) => {
  return await fetchApiV2(`borehole?${getIdQuery(ids)}&pageNumber=${pageNumber}&pageSize=${pageSize}`, "GET");
};

export const exportCSVBorehole = async (boreholeIds: GridRowSelectionModel) => {
  return await fetchApiV2(`export/csv?${getIdQuery(boreholeIds)}`, "GET");
};

export const exportJsonWithAttachmentsBorehole = async (boreholeIds: number[] | GridRowSelectionModel) => {
  return await download(`export/zip?${getIdQuery(boreholeIds)}`);
};

export const fetchBoreholeById = async (id: number) => await fetchApiV2(`borehole/${id}`, "GET");

export const updateBorehole = async (borehole: BoreholeV2) => {
  return await fetchApiV2("borehole", "PUT", borehole);
};
export const deleteBorehole = async (id: number) => await fetchApiV2(`borehole?id=${id}`, "DELETE");

export const boreholeQueryKey = "boreholes";

export const useBorehole = (id: number) => {
  const query = useQuery({
    queryKey: [boreholeQueryKey, id],
    queryFn: async () => {
      return await fetchBoreholeById(id);
    },
    enabled: !!id,
  });

  useShowAlertOnError(query.isError, query.error);
  return query;
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
    onSettled: (_data, _error, updatedBorehole) => {
      queryClient.invalidateQueries({ queryKey: [boreholeQueryKey, updatedBorehole.id] });
    },
  });

  const useDeleteBorehole = useMutation({
    mutationFn: async (boreholeId: number) => {
      return await deleteBorehole(boreholeId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [boreholeQueryKey],
      });
    },
  });

  useShowAlertOnError(useAddBorehole.isError, useAddBorehole.error);
  useShowAlertOnError(useUpdateBorehole.isError, useUpdateBorehole.error);
  useShowAlertOnError(useDeleteBorehole.isError, useDeleteBorehole.error);
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
