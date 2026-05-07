import { FC, Fragment, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Backdrop, CircularProgress, Stack, Typography } from "@mui/material";
import { theme } from "../../../../AppTheme.ts";
import { BoreholesCard } from "../../../../components/boreholesCard.tsx";
import { FormContainer, FormDialog } from "../../../../components/form/form.ts";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { FileDropzone } from "./fileDropzone.tsx";
import { LogImportError, LogImportValidationError, useImportLogs } from "./log.ts";

interface LogFileCsvInfo {
  requiredFilesPerRun: Record<string, string[]>;
}

const buildFileName = (cols: string[], nameIndex: number, extensionIndex: number): string => {
  const name = cols[nameIndex]?.trim() ?? "";
  const ext = extensionIndex >= 0 ? (cols[extensionIndex]?.trim() ?? "") : "";
  return ext ? `${name}.${ext}` : name;
};

const parseLogFilesCsv = async (csvFile: File): Promise<LogFileCsvInfo> => {
  const text = await csvFile.text();
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return { requiredFilesPerRun: {} };

  const headers = lines[0].split(";").map(h => h.trim().toLowerCase());
  const runNumberIndex = headers.indexOf("runnumber");
  if (runNumberIndex === -1) return { requiredFilesPerRun: {} };

  const nameIndex = headers.indexOf("name");
  const extensionIndex = headers.indexOf("extension");
  const result: Record<string, string[]> = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";");
    const runNumber = cols[runNumberIndex]?.trim();
    if (!runNumber) continue;
    result[runNumber] ??= [];
    if (nameIndex >= 0) {
      const fileName = buildFileName(cols, nameIndex, extensionIndex);
      if (fileName) result[runNumber].push(fileName);
    }
  }
  return { requiredFilesPerRun: result };
};

interface ImportLogModalProps {
  isImporting: boolean;
  setIsImporting: (isImporting: boolean) => void;
}

const ImportErrorSection: FC<{
  prefix: "LogRun" | "LogFile";
  getHeader: (errorKey: string, group: LogImportError[]) => string;
  errors: LogImportError[];
}> = ({ prefix, getHeader, errors }) => {
  const { t } = useTranslation();
  const grouped = new Map<string, LogImportError[]>();
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
            {getHeader(errorKey, group)}
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
  const [logRunFile, setLogRunFile] = useState<File>();
  const [logFileFile, setLogFileFile] = useState<File>();
  const [requiredFilesPerRun, setRequiredFilesPerRun] = useState<Record<string, string[]>>({});
  const [attachmentsPerRun, setAttachmentsPerRun] = useState<Record<string, File[]>>({});

  const importMutation = useImportLogs();
  const importErrors = importMutation.error instanceof LogImportValidationError ? importMutation.error.errors : [];

  const runNumbers = Object.keys(requiredFilesPerRun);

  const allRequiredFilesProvided = runNumbers.every(run => {
    const required = requiredFilesPerRun[run] ?? [];
    if (required.length === 0) return true;
    const provided = new Set((attachmentsPerRun[run] ?? []).map(f => f.name.toLowerCase()));
    return required.every(r => provided.has(r.toLowerCase()));
  });

  const onLogFileCsvChanged = useCallback(
    async (files: File[]) => {
      const file = files[0] as File | undefined;
      setLogFileFile(file);
      setAttachmentsPerRun({});
      importMutation.reset();
      if (file) {
        const info = await parseLogFilesCsv(file);
        setRequiredFilesPerRun(info.requiredFilesPerRun);
      } else {
        setRequiredFilesPerRun({});
      }
    },
    [importMutation],
  );

  const startImport = (): Promise<boolean> => {
    if (!logRunFile) return Promise.resolve(false);

    const formData = new FormData();
    formData.append("logRunsCsvFile", logRunFile);
    if (logFileFile) {
      formData.append("logFilesCsvFile", logFileFile);
    }

    return importMutation
      .mutateAsync({
        boreholeId: Number(boreholeId),
        formData,
        attachmentsPerRun,
      })
      .then(
        () => true,
        () => false,
      );
  };

  const isImportRunning = importMutation.isPending;
  const hasRequiredFiles = runNumbers.length === 0 || allRequiredFilesProvided;
  const isImportDisabled = isImportRunning || !logRunFile || !hasRequiredFiles || importErrors.length > 0;

  return (
    <FormDialog
      open={isImporting}
      title={t("importLogRuns")}
      onClose={() => {
        setIsImporting(false);
        setLogRunFile(undefined);
        setLogFileFile(undefined);
        setRequiredFilesPerRun({});
        setAttachmentsPerRun({});
        importMutation.reset();
      }}
      isCloseDisabled={isImportRunning}
      actions={[
        { label: "cancel", variant: "outlined", color: "primary", disabled: isImportRunning },
        {
          label: "import",
          variant: "contained",
          color: "primary",
          disabled: isImportDisabled,
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
                importMutation.reset();
              }}
              accept={{ "text/csv": [".csv"] }}
            />
            <ImportErrorSection
              prefix="LogRun"
              getHeader={(errorKey, group) =>
                group[0]?.values?.runNumber || t("importErrorRowRun", { rowNumber: errorKey.replaceAll(/\D/g, "") })
              }
              errors={importErrors}
            />
          </FormContainer>
        </BoreholesCard>
        <BoreholesCard data-cy="import-logFiles" title={t("logFiles")}>
          <FormContainer>
            <Typography>{t("importLogFilesDescription")}</Typography>
            <Stack gap={0.5}>
              <Typography variant="h6">{t("csvFile")}</Typography>
              <FileDropzone onChange={onLogFileCsvChanged} accept={{ "text/csv": [".csv"] }} />
            </Stack>
            {runNumbers.map(runNumber => (
              <Stack key={runNumber} gap={0.5}>
                <Typography variant="h6">{t("attachmentsForRun", { runNumber })}</Typography>
                <FileDropzone
                  onChange={files => {
                    setAttachmentsPerRun(prev => ({ ...prev, [runNumber]: files }));
                    importMutation.reset();
                  }}
                  multiple={true}
                  expectedFileNames={requiredFilesPerRun[runNumber]}
                />
              </Stack>
            ))}
            <ImportErrorSection
              prefix="LogFile"
              getHeader={(errorKey, group) =>
                group[0]?.values?.fileName || t("importErrorRowFile", { rowNumber: errorKey.replaceAll(/\D/g, "") })
              }
              errors={importErrors}
            />
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
