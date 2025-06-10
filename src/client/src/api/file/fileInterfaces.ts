import { User } from "../apiInterfaces";

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
  fileId: number;
  file: File;
  user?: User;
  attached?: Date | string;
  description?: string;
  public?: boolean;
}

export interface DataExtractionResponse {
  fileName: string;
  width: number;
  height: number;
  count: number;
}
