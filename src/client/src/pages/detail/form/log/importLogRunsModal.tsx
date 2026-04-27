import { FC, Fragment, useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Backdrop, CircularProgress, Stack, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { boreholeQueryKey } from "../../../../api/borehole.ts";
import { isJsonContentType, uploadWithApiError } from "../../../../api/fetchApiV2.ts";
import { theme } from "../../../../AppTheme.ts";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { BoreholesCard } from "../../../../components/boreholesCard.tsx";
import { FormContainer, FormDialog } from "../../../../components/form/form.ts";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { FileDropzone } from "./fileDropzone.tsx";
import { importLogs, logsQueryKey } from "./log.ts";
import { LogFile, LogRun } from "./logInterfaces.ts";

interface ImportError {
  errorKey: string;
  messageKey: string;
  detail: string;
  values?: Record<string, string>;
}

interface ImportLogModalProps {
  isImporting: boolean;
  setIsImporting: (isImporting: boolean) => void;
}

const buildLogFileUpload = (logRun: LogRun, logFile: LogFile, attachments: File[]): Promise<LogFile> | null => {
  const matchingAttachment = attachments.find(f => f.name.replaceAll(" ", "_") === logFile.name);
  if (!matchingAttachment) return null;
  const uploadFormData = new FormData();
  uploadFormData.append("file", matchingAttachment);
  return uploadWithApiError<LogFile>(
    `log/upload?logRunId=${logRun.id}&logFileId=${logFile.id}`,
    "POST",
    uploadFormData,
  );
};

const ImportErrorSection: FC<{ prefix: "LogRun" | "LogFile"; rowMessageKey: string; errors: ImportError[] }> = ({
  prefix,
  rowMessageKey,
  errors,
}) => {
  const { t } = useTranslation();
  const grouped = new Map<string, ImportError[]>();
  for (const e of errors.filter(e => e.errorKey.startsWith(prefix))) {
    const list = grouped.get(e.errorKey) ?? [];
    list.push(e);
    grouped.set(e.errorKey, list);
  }
  return (
    <>
      {[...grouped].map(([errorKey, group]) => (
        <Stack key={errorKey} gap={0.25}>
          <Typography variant="body2" color="error" fontWeight="bold">
            {t(rowMessageKey, { rowNumber: errorKey.replaceAll(/\D/g, "") })}
          </Typography>
          {group.map(e => (
            <Typography key={e.messageKey} variant="body2" color="error" sx={{ pl: 2 }}>
              {t(e.messageKey, e.values ?? {})}
            </Typography>
          ))}
        </Stack>
      ))}
    </>
  );
};

export const ImportLogRunsModal: FC<ImportLogModalProps> = ({ isImporting, setIsImporting }) => {
  const { t } = useTranslation();
  const { id: boreholeId } = useRequiredParams();
  const queryClient = useQueryClient();
  const { showAlert } = useContext(AlertContext);
  const [isImportRunning, setIsImportRunning] = useState<boolean>(false);
  const [logRunFile, setLogRunFile] = useState<File>();
  const [logFileFile, setLogFileFile] = useState<File>();
  const [logFileAttachments, setLogFileAttachments] = useState<File[]>([]);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);

  const startImport = useCallback(async () => {
    setIsImportRunning(true);
    setImportErrors([]);

    try {
      if (!logRunFile) return false;
      const formData = new FormData();
      formData.append("logRunsCsvFile", logRunFile);

      if (logFileFile) {
        formData.append("logFilesCsvFile", logFileFile);
        const fileNames = logFileAttachments.map(f => f.name).join("\n");
        const fileListBlob = new Blob([fileNames], { type: "text/plain" });
        formData.append("fileListFile", fileListBlob, "filelist.txt");
      }

      const response = await importLogs(Number(boreholeId), formData);

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (isJsonContentType(contentType)) {
          const responseBody = await response.json();
          if (Array.isArray(responseBody)) {
            setImportErrors(responseBody);
            return false;
          }
          if (responseBody.messageKey) {
            showAlert(t(responseBody.messageKey), "error");
            return false;
          }
        }
        const errorText = await response.text();
        showAlert(errorText || "Import failed", "error");
        return false;
      }

      const importedLogRuns: LogRun[] = await response.json();

      const uploadPromises = importedLogRuns
        .flatMap(logRun =>
          (logRun.logFiles ?? []).map(logFile => buildLogFileUpload(logRun, logFile, logFileAttachments)),
        )
        .filter((p): p is Promise<LogFile> => p !== null);
      await Promise.all(uploadPromises);

      await queryClient.invalidateQueries({ queryKey: [logsQueryKey, Number(boreholeId)] });
      await queryClient.invalidateQueries({ queryKey: [boreholeQueryKey, Number(boreholeId)] });
      return true;
    } catch (error) {
      showAlert(String(error), "error");
      return false;
    } finally {
      setIsImportRunning(false);
    }
  }, [logRunFile, logFileFile, logFileAttachments, boreholeId, queryClient, showAlert, t]);

  return (
    <FormDialog
      open={isImporting}
      title={t("importLogRuns")}
      onClose={() => {
        setIsImporting(false);
        setLogRunFile(undefined);
        setLogFileFile(undefined);
        setLogFileAttachments([]);
        setImportErrors([]);
      }}
      isCloseDisabled={isImportRunning}
      actions={[
        { label: "cancel", variant: "outlined", color: "primary", disabled: isImportRunning },
        {
          label: "import",
          variant: "contained",
          color: "primary",
          disabled: isImportRunning || !logRunFile || importErrors.length > 0,
          onClick: startImport,
        },
      ]}>
      <Fragment key={String(isImporting)}>
        <BoreholesCard data-cy="import-logRuns" title={t("logRuns")}>
          <FormContainer>
            <Typography>{t("importLogRunsDescription")}</Typography>
            <FileDropzone
              onChange={files => {
                setLogRunFile(files[0]);
                setImportErrors([]);
              }}
              accept={{ "text/csv": [".csv"] }}
            />
            <ImportErrorSection prefix="LogRun" rowMessageKey="importErrorRowRun" errors={importErrors} />
          </FormContainer>
        </BoreholesCard>
        <BoreholesCard data-cy="import-logFiles" title={t("logFiles")}>
          <FormContainer>
            <Typography>{t("importLogFilesDescription")}</Typography>
            <Stack gap={0.5}>
              <Typography variant="h6">{t("csvFile")}</Typography>
              <FileDropzone
                onChange={files => {
                  setLogFileFile(files[0]);
                  setImportErrors([]);
                }}
                accept={{ "text/csv": [".csv"] }}
              />
            </Stack>
            <Stack gap={0.5}>
              <Typography variant="h6">{t("attachments")}</Typography>
              <FileDropzone
                onChange={files => {
                  setLogFileAttachments(files);
                  setImportErrors([]);
                }}
                multiple={true}
              />
            </Stack>
            <ImportErrorSection prefix="LogFile" rowMessageKey="importErrorRowFile" errors={importErrors} />
          </FormContainer>
        </BoreholesCard>
      </Fragment>
      {isImportRunning && (
        <Backdrop
          sx={{ color: theme.palette.primary.main, backgroundColor: theme.palette.background.backdrop }}
          open={isImportRunning}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </FormDialog>
  );
};
