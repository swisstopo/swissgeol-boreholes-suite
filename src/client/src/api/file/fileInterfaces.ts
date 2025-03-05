import { BoreholeV2 } from "../borehole.ts";

export const maxFileSizeKB = 210_000_000;

export interface File {
  id: number;
  createdById: number;
  updatedById: number;
  updated: string;
  name: string;
  nameUuid: string;
  hash: string;
  type: string;
  created: string;
}

export interface BoreholeFile {
  boreholeId: number;
  borehole?: BoreholeV2;
  fileId: number;
  file: File;
}

export interface DataExtractionResponse {
  fileName: string;
  width: number;
  height: number;
  count: number;
}
