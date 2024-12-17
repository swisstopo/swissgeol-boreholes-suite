import { GridRowSelectionModel } from "@mui/x-data-grid";
import { Workflow } from "../api-lib/ReduxStateInterfaces.ts";
import { Codelist } from "../components/legacyComponents/domain/domainInterface.ts";
import { User, Workgroup } from "./apiInterfaces.ts";
import { fetchApiV2, upload } from "./fetchApiV2";

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
  lithostratigraphyId: number;
  chronostratigraphyId: number;
  hasGroundwater: boolean | null;
  topBedrockWeatheredMd: number;
  topBedrockFreshMd: number;
  depthPrecisionId: number;
  totalDepth: number;
  purposeId: number;
  typeId: number;
  remarks: string;
  statusId: number;
  workflow: Workflow;
  boreholeCodelists: BasicIdentifier[];
  workflows: Workflow[];
  workgroupId: number;
  workgroup: Workgroup;
  originalReferenceSystem: number;
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
}

export const getBoreholeById = async (id: number) => await fetchApiV2(`borehole/${id}`, "GET");

export const updateBorehole = async (borehole: BoreholeV2) => {
  return await fetchApiV2("borehole", "PUT", borehole);
};

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const importBoreholes = async (workgroupId: string, combinedFormData: any) => {
  return await upload(`import?workgroupId=${workgroupId}`, "POST", combinedFormData);
};

export const copyBorehole = async (boreholeId: GridRowSelectionModel, workgroupId: string | null) => {
  return await fetchApiV2(`borehole/copy?id=${boreholeId}&workgroupId=${workgroupId}`, "POST");
};

export const getAllBoreholes = async (ids: number[] | GridRowSelectionModel, pageNumber: number, pageSize: number) => {
  const idsQuery = ids.map(id => `ids=${id}`).join("&");
  return await fetchApiV2(`borehole?${idsQuery}&pageNumber=${pageNumber}&pageSize=${pageSize}`, "GET");
};

export const exportCSVBorehole = async (boreholeIds: GridRowSelectionModel) => {
  const idsQuery = boreholeIds.map(id => `ids=${id}`).join("&");
  return await fetchApiV2(`borehole/export-csv?${idsQuery}`, "GET");
};
