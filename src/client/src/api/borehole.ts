import { GridRowSelectionModel } from "@mui/x-data-grid";
import { fetchApiV2, upload } from "./fetchApiV2";

export interface BoreholeV2 {
  id: number;
  alternateName: string;
  originalName: string;
  projectName: number;
  restrictionId: number | null;
  restrictionUntil: Date | string | null;
  nationalInterest: number | boolean | null; // Number as select options pared to boolean
  elevationZ: number | string | null; // Number with thousands separator then parsed to number
  elevationPrecisionId: number | null;
  referenceElevation: number | string | null; // Number with thousands separator then parsed to number
  qtReferenceElevationId: number | null;
  referenceElevationTypeId: number | null;
  hrsId?: number;
  country: string;
  canton: string;
  municipality: string;
  locationX: number | null;
  locationY: number | null;
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
