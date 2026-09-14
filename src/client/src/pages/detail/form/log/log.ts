import { createElement, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { ArrowDownToLine, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { boreholeQueryKey } from "../../../../api/borehole.ts";
import { downloadPost } from "../../../../api/download.ts";
import { ApiError } from "../../../../api/errorClasses.ts";
import { fetchApiV2WithApiError, isJsonContentType, upload } from "../../../../api/fetchApiV2.ts";
import { uploadResumable } from "../../../../api/resumableUpload.ts";
import { TransferOptions } from "../../../../api/transferProgress.ts";
import { ExportItem } from "../../../../components/export/exportDialog.tsx";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";
import { SaveContext } from "../../saveContext.tsx";
import {
  AddLogRunVariables,
  ImportLogsVariables,
  LogFileUploadProgress,
  LogImportResultItem,
  LogRun,
  UpdateLogRunVariables,
} from "./logInterfaces.ts";

const deleteLogRunsByIds = async (logRunIds: number[]) => {
  const queryParams = logRunIds.map(id => `logRunIds=${id}`).join("&");
  return await fetchApiV2WithApiError(`${logController}?${queryParams}`, "DELETE");
};

const uploadLogFileBlob = (
  file: File,
  logRunId: number,
  logFileId?: number,
  options?: TransferOptions,
): Promise<number> => {
  const metadata: Record<string, string> = { logRunId: String(logRunId) };
  if (logFileId) metadata.logFileId = String(logFileId);

  return uploadResumable(file, metadata, options);
};

export type LogFileUploadProgressCallback = (progress: LogFileUploadProgress) => void;

/** Counts the files of a log run that still have to be uploaded. */
export const countPendingUploads = (logRun: LogRun): number => logRun.logFiles?.filter(f => f.file).length ?? 0;

const logController = "log";
const logsQueryKey = "logs";
/**
 * Reads the log runs of a borehole straight from the API, bypassing the cache.
 * @param boreholeId The borehole to read.
 * @returns The log runs as the server holds them.
 */
export const fetchLogRunsByBoreholeId = async (boreholeId: number): Promise<LogRun[]> =>
  await fetchApiV2WithApiError<LogRun[]>(`${logController}?boreholeId=${boreholeId}`, "GET");

/**
 * Writes the cached log runs of a borehole.
 *
 * For a caller that has already asked the server and would otherwise leave the cache holding an
 * older answer. Invalidating would send it to the server again for the runs it is holding, so the
 * answer it has is written to the cache instead.
 * @param boreholeId The borehole the runs belong to.
 * @returns A callback taking the runs as the server reported them.
 */
export const useSetCachedLogRuns = (boreholeId: number): ((logRuns: LogRun[]) => void) => {
  const queryClient = useQueryClient();

  return useCallback(
    (logRuns: LogRun[]) => {
      queryClient.setQueryData([logsQueryKey, boreholeId], logRuns);
    },
    [boreholeId, queryClient],
  );
};

export const useLogsByBoreholeId = (boreholeId?: number): UseQueryResult<LogRun[]> =>
  useQuery<LogRun[]>({
    queryKey: [logsQueryKey, boreholeId],
    queryFn: async (): Promise<LogRun[]> => {
      if (boreholeId === undefined) return [];
      return await fetchLogRunsByBoreholeId(boreholeId);
    },
    enabled: !!boreholeId,
  });

export const useLogRunMutations = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["log"]);

  const useAddLogRun = useMutation({
    mutationFn: async ({ logRun, signal }: AddLogRunVariables) => {
      return await fetchApiV2WithApiError<LogRun>(logController, "POST", logRun, signal);
    },
    onSuccess: (_data, { logRun }) => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [logsQueryKey, logRun.boreholeId] });
      queryClient.invalidateQueries({ queryKey: [boreholeQueryKey, logRun.boreholeId] });
    },
  });

  const useUpdateLogRun = useMutation({
    mutationFn: async ({ logRun, onFileProgress, signal }: UpdateLogRunVariables) => {
      if (logRun.logFiles?.some(file => file.file)) {
        let indexInRun = 0;
        for (const file of logRun.logFiles) {
          file.logRunId = logRun.id;
          if (!file.file) continue;

          const fileName = file.file.name;
          const currentIndex = indexInRun;

          // A file that already has an id is one the user put back under a name the run still
          // holds, so its content is replaced rather than stored a second time.
          const replacedId = file.id > 0 ? file.id : undefined;
          const savedFileId = await uploadLogFileBlob(file.file, logRun.id, replacedId, {
            signal,
            onProgress: progress => onFileProgress?.({ ...progress, fileName, indexInRun: currentIndex }),
          });
          file.id = savedFileId;
          delete file.file;
          indexInRun++;
        }
      }
      return await fetchApiV2WithApiError<LogRun>(logController, "PUT", logRun, signal);
    },
    onSuccess: (_data, { logRun }) => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [logsQueryKey, logRun.boreholeId] });
    },
  });

  const useDeleteLogRuns = useMutation({
    mutationFn: async (logRuns: LogRun[]) => {
      return await deleteLogRunsByIds(logRuns.map(lr => lr.id));
    },
    onSuccess: (_data, logRuns) => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [logsQueryKey, logRuns[0]?.boreholeId] });
      queryClient.invalidateQueries({ queryKey: [boreholeQueryKey, logRuns[0]?.boreholeId] });
    },
  });

  return {
    add: useAddLogRun,
    update: useUpdateLogRun,
    delete: useDeleteLogRuns,
  };
};

export class LogImportValidationError extends ApiError {
  constructor(
    public readonly messageKey: string,
    public readonly values?: Record<string, string>,
  ) {
    super("Log import validation failed", 400);
    this.name = "LogImportValidationError";
    Object.setPrototypeOf(this, LogImportValidationError.prototype);
  }
}

/**
 * Names an attachment the way the server expects it, so a row and the file the user dropped for
 * it are recognized as the same thing on both sides.
 * @param runNumber The run the file belongs to.
 * @param fileName The file name as the browser reports it.
 * @returns The identifier to send.
 */
export const toAttachmentName = (runNumber: string, fileName: string): string =>
  `${runNumber}/${fileName.replaceAll(" ", "_")}`;

/**
 * Removes a log file record that never received its attachment.
 * @param logFileId The record to remove.
 */
export const deleteLogFile = async (logFileId: number): Promise<void> => {
  await fetchApiV2WithApiError(`${logController}/file/${logFileId}`, "DELETE");
};

export const useImportLogs = () =>
  useMutation<LogImportResultItem[], Error, ImportLogsVariables>({
    mutationFn: async ({ boreholeId, logRunsCsvFile, logFilesCsvFile, attachmentsPerRun }) => {
      const formData = new FormData();
      if (logRunsCsvFile) formData.append("logRunsCsvFile", logRunsCsvFile);
      if (logFilesCsvFile) formData.append("logFilesCsvFile", logFilesCsvFile);
      for (const [runNumber, files] of Object.entries(attachmentsPerRun)) {
        for (const file of files) {
          formData.append("providedAttachmentNames", toAttachmentName(runNumber, file.name));
        }
      }

      const response = await upload(`${logController}/import?boreholeId=${boreholeId}`, "POST", formData);
      if (!response.ok) {
        if (isJsonContentType(response.headers.get("content-type"))) {
          const responseBody = await response.json();
          if (typeof responseBody?.messageKey === "string") {
            throw new LogImportValidationError(responseBody.messageKey, responseBody.values);
          }
        }
        throw new Error("Log import failed");
      }

      return (await response.json()) as LogImportResultItem[];
    },
  });

export const exportLogRuns = async (
  ids: number[],
  withAttachments: boolean,
  locale: string,
  options?: TransferOptions,
): Promise<Response> => {
  return await downloadPost("log/export", { logRunIds: ids, withAttachments, locale }, options);
};

export const exportLogFiles = async (
  ids: number[],
  withAttachments: boolean,
  locale: string,
  options?: TransferOptions,
): Promise<Response> => {
  return await downloadPost("log/export", { logFileIds: ids, withAttachments, locale }, options);
};

/**
 * Hook that encapsulates export logic for log tables: unsaved-changes prompt,
 * locale resolution, withAttachments differentiation, and selection-to-ID mapping.
 */
export const useLogExport = (
  exportFn: (ids: number[], withAttachments: boolean, locale: string, options?: TransferOptions) => Promise<Response>,
  selectionModel: GridRowSelectionModel,
  rows: { id: number; tmpId?: string }[],
) => {
  const { i18n } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const { showPrompt } = useContext(PromptContext);
  const { hasChanges } = useContext(SaveContext);

  const getSelectedIds = useCallback((): number[] => {
    return selectionModel
      .map(selectedId => rows.find(r => r.tmpId === String(selectedId) || r.id === selectedId)?.id)
      .filter((id): id is number => id !== undefined && id > 0);
  }, [selectionModel, rows]);

  const beginExport = useCallback(() => {
    if (hasChanges) {
      showPrompt("messageUnsavedChangesAtExport", [
        {
          label: "cancel",
          icon: createElement(X),
          variant: "outlined",
        },
        {
          label: "export",
          icon: createElement(ArrowDownToLine),
          variant: "contained",
          action: () => setIsExporting(true),
        },
      ]);
    } else {
      setIsExporting(true);
    }
  }, [hasChanges, showPrompt]);

  const startExport = useCallback(() => {
    beginExport();
  }, [beginExport]);

  const exportItems: ExportItem[] = useMemo(
    () => [
      {
        label: "withoutAttachments",
        exportFunction: options => exportFn(getSelectedIds(), false, i18n.language, options),
      },
      {
        label: "withAttachments",
        exportFunction: options => exportFn(getSelectedIds(), true, i18n.language, options),
      },
    ],
    [exportFn, getSelectedIds, i18n.language],
  );

  return { isExporting, setIsExporting, startExport, exportItems };
};
