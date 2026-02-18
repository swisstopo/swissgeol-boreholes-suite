import { NullableDateString, User } from "../apiInterfaces";

export const maxFileSizeBytes = 210_000_000;
export const largeMaxFileSizeBytes = 5_000_000_000;

export enum FileSizeLimit {
  Standard = "210 MB",
  Large = "5 GB",
}

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

export interface Profile {
  boreholeId: number;
  fileId: number;
  file: File;
  user?: User;
  attached?: NullableDateString;
  description?: string;
  public?: boolean;
}

export interface DataExtractionResponse {
  fileName: string;
  width: number;
  height: number;
  count: number;
}
