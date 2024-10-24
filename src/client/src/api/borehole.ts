import { GridRowSelectionModel } from "@mui/x-data-grid";
import { fetchApiV2, upload } from "./fetchApiV2";

export interface BoreholeV2 {
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
  hrsId: number;
}

// boreholes

export const getBoreholeById = async (id: number) => await fetchApiV2(`borehole/${id}`, "GET");

export const updateBorehole = async (borehole: BoreholeV2) => {
  return await fetchApiV2("borehole", "PUT", borehole);
};

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const importBoreholes = async (workgroupId: number | null, combinedFormData: any) => {
  return await upload(`upload?workgroupId=${workgroupId}`, "POST", combinedFormData);
};

export const copyBorehole = async (boreholeId: GridRowSelectionModel, workgroupId: number | null) => {
  return await fetchApiV2(`borehole/copy?id=${boreholeId}&workgroupId=${workgroupId}`, "POST");
};
