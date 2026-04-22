import { NullableDateString, User } from "../../../../api/apiInterfaces.ts";
import { Codelist } from "../../../../components/codelist.ts";

export interface LogRunChangeTracker {
  item: LogRun;
  hasChanges: boolean;
}

export interface LogRun {
  id: number;
  tmpId?: string;
  boreholeId: number;
  runNumber: string;
  fromDepth: number;
  toDepth: number;
  runDate?: NullableDateString;
  comment?: string;
  serviceCo?: string;
  bitSize?: number;
  conveyanceMethodId?: number | null;
  conveyanceMethod?: Codelist;
  boreholeStatusId?: number | null;
  boreholeStatus?: Codelist;
  logFiles?: LogFile[];
  created?: NullableDateString;
  createdBy?: User | null;
  updated?: NullableDateString;
  updatedBy?: User | null;
}

export interface LogFile {
  id: number;
  tmpId?: string;
  logRunId: number;
  name?: string;
  extension?: string;
  file?: File;
  passTypeId?: number | null;
  passType?: Codelist;
  pass?: number | null;
  dataPackageId?: number | null;
  dataPackage?: Codelist;
  deliveryDate?: NullableDateString;
  depthTypeId?: number | null;
  depthType?: Codelist;
  toolTypeCodelistIds: number[];
  toolTypeCodelists?: Codelist[];
  public: boolean;
  created?: NullableDateString;
  createdBy?: User | null;
  updated?: NullableDateString;
  updatedBy?: User | null;
}
