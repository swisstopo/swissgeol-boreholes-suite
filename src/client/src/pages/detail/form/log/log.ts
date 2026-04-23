import { createElement, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { GridRowSelectionModel } from "@mui/x-data-grid";
import { ArrowDownToLine, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { NullableDateString, User } from "../../../../api/apiInterfaces.ts";
import { boreholeQueryKey } from "../../../../api/borehole.ts";
import { downloadPost } from "../../../../api/download.ts";
import { fetchApiV2WithApiError, upload, uploadWithApiError } from "../../../../api/fetchApiV2.ts";
import { Codelist } from "../../../../components/codelist.ts";
import { ExportItem } from "../../../../components/export/exportDialog.tsx";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";
import { SaveContext } from "../../saveContext.tsx";

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
            const formData = new FormData();
            formData.append("file", file.file);
            const savedFile = await uploadWithApiError<LogFile>(
              `${logController}/upload?logRunId=${logRun.id}`,
              "POST",
              formData,
            );
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
      const queryParams = logRuns.map(logRun => "logRunIds=" + logRun.id).join("&");
      return await fetchApiV2WithApiError(`${logController}?${queryParams}`, "DELETE");
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

export const importLogs = async (boreholeId: number, formData: FormData): Promise<LogRun[]> => {
  return await uploadWithApiError<LogRun[]>(`${logController}/import?boreholeId=${boreholeId}`, "POST", formData);
};

export const importLogsRaw = async (boreholeId: number, formData: FormData): Promise<Response> => {
  return await upload(`${logController}/import?boreholeId=${boreholeId}`, "POST", formData);
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
