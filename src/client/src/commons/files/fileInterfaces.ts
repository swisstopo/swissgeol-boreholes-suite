import { Borehole } from "../../ReduxStateInterfaces.ts";

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
