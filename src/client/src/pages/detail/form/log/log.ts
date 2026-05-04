import { createElement, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { ArrowDownToLine, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "../../../../api/apiInterfaces.ts";
import { boreholeQueryKey } from "../../../../api/borehole.ts";
import { downloadPost } from "../../../../api/download.ts";
import { fetchApiV2WithApiError, isJsonContentType, upload, uploadWithApiError } from "../../../../api/fetchApiV2.ts";
import { ExportItem } from "../../../../components/export/exportDialog.tsx";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";
import { SaveContext } from "../../saveContext.tsx";
import { LogFile, LogRun } from "./logInterfaces.ts";

const deleteLogRunsByIds = async (logRunIds: number[]) => {
  const queryParams = logRunIds.map(id => `logRunIds=${id}`).join("&");
  return await fetchApiV2WithApiError(`${logController}?${queryParams}`, "DELETE");
};

const uploadLogFileBlob = async (file: File, logRunId: number, logFileId?: number): Promise<LogFile> => {
  const formData = new FormData();
  formData.append("file", file);
  const query = logFileId ? `?logRunId=${logRunId}&logFileId=${logFileId}` : `?logRunId=${logRunId}`;
  return await uploadWithApiError<LogFile>(`${logController}/upload${query}`, "POST", formData);
};

const logController = "log";
export const logsQueryKey = "logs";
export const useLogsByBoreholeId = (boreholeId?: number): UseQueryResult<LogRun[]> =>
  useQuery<LogRun[]>({
    queryKey: [logsQueryKey, boreholeId],
    queryFn: async (): Promise<LogRun[]> => {
      return await fetchApiV2WithApiError<LogRun[]>(`${logController}?boreholeId=${boreholeId}`, "GET");
    },
    enabled: !!boreholeId,
  });

export const useLogRunMutations = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["log"]);

  const useAddLogRun = useMutation({
    mutationFn: async (logRun: LogRun) => {
      return await fetchApiV2WithApiError<LogRun>(logController, "POST", logRun);
    },
    onSuccess: (_data, logRun) => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [logsQueryKey, logRun.boreholeId] });
      queryClient.invalidateQueries({ queryKey: [boreholeQueryKey, logRun.boreholeId] });
    },
  });

  const useUpdateLogRun = useMutation({
    mutationFn: async (logRun: LogRun) => {
      if (logRun.logFiles?.some(file => file.file)) {
        const uploadPromises = logRun.logFiles.map(async file => {
          file.logRunId = logRun.id;
          if (file.file) {
            const savedFile = await uploadLogFileBlob(file.file, logRun.id);
            file.id = savedFile.id;
            delete file.file;
          }
          return file;
        });
        logRun.logFiles = await Promise.all(uploadPromises);
      }
      return await fetchApiV2WithApiError<LogRun>(logController, "PUT", logRun);
    },
    onSuccess: (_data, logRun) => {
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

export const importLogs = async (boreholeId: number, formData: FormData): Promise<Response> => {
  return await upload(`${logController}/import?boreholeId=${boreholeId}`, "POST", formData);
};

export interface LogImportError {
  errorKey: string;
  messageKey: string;
  detail: string;
  values?: Record<string, string>;
}

export class LogImportValidationError extends ApiError {
  constructor(public readonly errors: LogImportError[]) {
    super("Log import validation failed", 400);
    this.name = "LogImportValidationError";
    Object.setPrototypeOf(this, LogImportValidationError.prototype);
  }
}

interface ImportLogsVariables {
  boreholeId: number;
  formData: FormData;
  attachments: File[];
}

const buildLogFileUpload = (logRun: LogRun, logFile: LogFile, attachments: File[]): Promise<LogFile> | null => {
  const matchingAttachment = attachments.find(f => f.name.replaceAll(" ", "_") === logFile.name);
  if (!matchingAttachment) return null;
  return uploadLogFileBlob(matchingAttachment, logRun.id, logFile.id);
};

export const useImportLogs = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["log"]);

  return useMutation<LogRun[], Error, ImportLogsVariables>({
    mutationFn: async ({ boreholeId, formData, attachments }) => {
      const response = await importLogs(boreholeId, formData);
      if (!response.ok) {
        if (isJsonContentType(response.headers.get("content-type"))) {
          const responseBody = await response.json();
          if (Array.isArray(responseBody)) {
            throw new LogImportValidationError(responseBody);
          }
        }
        throw new Error("Log import failed");
      }

      const importedLogRuns: LogRun[] = await response.json();
      try {
        const uploadPromises = importedLogRuns
          .flatMap(logRun => (logRun.logFiles ?? []).map(logFile => buildLogFileUpload(logRun, logFile, attachments)))
          .filter((p): p is Promise<LogFile> => p !== null);
        await Promise.all(uploadPromises);
      } catch (uploadError) {
        // Roll back the imported log runs (and their already-saved log file metadata) so a retry isn't
        // blocked by duplicate run numbers. Swallow rollback failures so the original upload error is surfaced.
        if (importedLogRuns.length > 0) {
          await deleteLogRunsByIds(importedLogRuns.map(lr => lr.id)).catch(() => undefined);
        }
        throw uploadError;
      }
      return importedLogRuns;
    },
    onSuccess: (_data, { boreholeId }) => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [logsQueryKey, boreholeId] });
      queryClient.invalidateQueries({ queryKey: [boreholeQueryKey, boreholeId] });
    },
  });
};

export const exportLogRuns = async (ids: number[], withAttachments: boolean, locale: string): Promise<Response> => {
  return await downloadPost("log/export", { logRunIds: ids, withAttachments, locale });
};

export const exportLogFiles = async (ids: number[], withAttachments: boolean, locale: string): Promise<Response> => {
  return await downloadPost("log/export", { logFileIds: ids, withAttachments, locale });
};

/**
 * Hook that encapsulates export logic for log tables: unsaved-changes prompt,
 * locale resolution, withAttachments differentiation, and selection-to-ID mapping.
 */
export const useLogExport = (
  exportFn: (ids: number[], withAttachments: boolean, locale: string) => Promise<Response>,
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
        exportFunction: () => exportFn(getSelectedIds(), false, i18n.language),
      },
      {
        label: "withAttachments",
        exportFunction: () => exportFn(getSelectedIds(), true, i18n.language),
      },
    ],
    [exportFn, getSelectedIds, i18n.language],
  );

  return { isExporting, setIsExporting, startExport, exportItems };
};
