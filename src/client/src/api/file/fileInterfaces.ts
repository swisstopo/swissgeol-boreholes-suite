import { Borehole } from "../../api-lib/ReduxStateInterfaces.ts";

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

export interface FileResponse {
  boreholeId: number;
  borehole?: Borehole;
  fileId: number;
  file: File;
}

export interface DataExtractionResponse {
  url: string;
  width: number;
  height: number;
  count: number;
}
