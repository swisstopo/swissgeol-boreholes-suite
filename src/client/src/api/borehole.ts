import { GridRowSelectionModel } from "@mui/x-data-grid";
import { Workflow } from "../api-lib/ReduxStateInterfaces.ts";
import { fetchApiV2, upload } from "./fetchApiV2";

export interface BoreholeV2 {
  workflow: Workflow;
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
  alternateName: string;
  originalName: string;
  projectName: number;
  restrictionId: number;
  restrictionUntil: Date | string | null;
  nationalInterest: boolean | null;
  elevationZ: number | string; // Number with thousands separator then parsed to number
  elevationPrecisionId: number;
  referenceElevation: number | string; // Number with thousands separator then parsed to number
  qtReferenceElevationId: number;
  referenceElevationTypeId: number;
  locationPrecisionId: number | null;
  hrsId: number;
}

export const getBoreholeById = async (id: number) => await fetchApiV2(`borehole/${id}`, "GET");

export const updateBorehole = async (borehole: BoreholeV2) => {
  return await fetchApiV2("borehole", "PUT", borehole);
};

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const importBoreholes = async (workgroupId: string, combinedFormData: any) => {
  return await upload(`upload?workgroupId=${workgroupId}`, "POST", combinedFormData);
};

export const copyBorehole = async (boreholeId: GridRowSelectionModel, workgroupId: string | null) => {
  return await fetchApiV2(`borehole/copy?id=${boreholeId}&workgroupId=${workgroupId}`, "POST");
};
