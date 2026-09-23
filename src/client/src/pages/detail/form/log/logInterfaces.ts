import { Codelist, User } from "../../../../api/generated";
import { TransferProgress } from "../../../../api/transferProgress.ts";
import { NullableDateString } from "../../../../api/unionTypes.ts";
import { LogFileUploadProgressCallback } from "./log.ts";

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

/**
 * Reports the upload of one log file belonging to a single log run.
 * `indexInRun` counts the files of that run that carry a blob, in upload order.
 */
export interface LogFileUploadProgress extends TransferProgress {
  fileName: string;
  indexInRun: number;
}

export type LogImportItemType = "Run" | "File";

export type LogImportOutcome = "Added" | "AlreadyExists" | "SkippedIncomplete" | "Error";

/** How far the attachment of an added log file has got. */
export type LogImportUploadState = "pending" | "uploading" | "uploaded" | "failed";

/**
 * One row of the import report.
 *
 * A `File` item always carries `runNumber` and `fileName` in `values`, whatever its outcome, and
 * `fileName` is the name as the server stores it. Read those rather than taking the identifier
 * apart, which is a display string a file name may itself contain the separator of.
 */
export interface LogImportResultItem {
  type: LogImportItemType;
  identifier: string;
  outcome: LogImportOutcome;
  messageKey: string;
  values?: Record<string, string>;
  logRunId?: number;
  logFileId?: number;
}

export interface AddLogRunVariables {
  logRun: LogRun;
  signal?: AbortSignal;
}

export interface UpdateLogRunVariables {
  logRun: LogRun;
  onFileProgress?: LogFileUploadProgressCallback;
  signal?: AbortSignal;
}

export interface ImportLogsVariables {
  boreholeId: number;
  attachmentsPerRun: Record<string, File[]>;
  logRunsCsvFile?: File;
  logFilesCsvFile?: File;
}

export interface RequiredAttachmentsVariables {
  boreholeId: number;
  logFilesCsvFile: File;
}
