import { FC, useCallback, useContext, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Step, StepLabel, Stepper } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { boreholeQueryKey } from "../../../../../api/borehole.ts";
import { uploadResumable } from "../../../../../api/resumableUpload.ts";
import { isAbortError } from "../../../../../api/transferProgress.ts";
import { AlertContext } from "../../../../../components/alert/alertContext.tsx";
import { FormDialog } from "../../../../../components/form/form.ts";
import { useRequiredId } from "../../../../../hooks/useRequiredId.ts";
import { useResetTabStatus } from "../../../../../hooks/useResetTabStatus.ts";
import { useApiErrorAlert } from "../../../../../hooks/useShowAlertOnError.tsx";
import { deleteLogFile, LogImportValidationError, useImportLogs } from "../log.ts";
import { LogImportResultItem, LogImportUploadState } from "../logInterfaces.ts";
import { parseLogFilesCsv } from "../logUtils.ts";
import { ImportFilesStep } from "./importFilesStep.tsx";
import { attachmentsToUpload } from "./importReport.ts";
import { ImportReportStep } from "./importReportStep.tsx";
import { ImportRunsStep } from "./importRunsStep.tsx";
import { ImportUploadProgress } from "./importUploadProgress.tsx";

interface ImportLogWizardProps {
  isImporting: boolean;
  setIsImporting: (isImporting: boolean) => void;
}

/** What the progress bar shows about the attachment currently on the wire. */
interface UploadProgressState {
  fileName: string;
  current: number;
  count: number;
  transferred: number;
  total?: number;
}

const runsStep = 0;
const filesStep = 1;
const reportStep = 2;

const stepLabelKeys = ["logRuns", "logFiles", "importReport"];

/**
 * Collects the two CSV files and the attachments, imports them, and shows what the import did.
 *
 * The report is reached as soon as the import answers and the attachments are sent afterwards,
 * so the classification can be read while the files are still on the wire.
 */
export const ImportLogWizard: FC<ImportLogWizardProps> = ({ isImporting, setIsImporting }) => {
  const { t } = useTranslation();
  const boreholeId = useRequiredId();
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["log"]);
  const { showAlert } = useContext(AlertContext);
  const showApiErrorAlert = useApiErrorAlert();

  const [step, setStep] = useState(runsStep);
  const [logRunsCsvFile, setLogRunsCsvFile] = useState<File>();
  const [logFilesCsvFile, setLogFilesCsvFile] = useState<File>();
  const [requiredFilesPerRun, setRequiredFilesPerRun] = useState<Record<string, string[]>>({});
  const [attachmentsPerRun, setAttachmentsPerRun] = useState<Record<string, File[]>>({});
  const [report, setReport] = useState<LogImportResultItem[]>();
  const [uploadStates, setUploadStates] = useState<Record<number, LogImportUploadState>>({});
  const [progress, setProgress] = useState<UploadProgressState>();
  const [isUploading, setIsUploading] = useState(false);
  const runningUploads = useRef<AbortController | null>(null);

  const importMutation = useImportLogs();

  const setUploadState = useCallback((logFileId: number, state: LogImportUploadState) => {
    setUploadStates(previous => ({ ...previous, [logFileId]: state }));
  }, []);

  const onLogFilesCsvChanged = useCallback(async (file?: File) => {
    setLogFilesCsvFile(file);
    setAttachmentsPerRun({});
    setRequiredFilesPerRun(file ? (await parseLogFilesCsv(file)).requiredFilesPerRun : {});
  }, []);

  /**
   * Sends the attachments one after another and keeps the record only for those that arrive.
   *
   * A record whose attachment does not arrive is removed again, because the import wrote it
   * before the upload ran and a record without its file would be skipped as already existing by
   * every later import.
   * @param items The report as the server returned it.
   */
  const uploadAttachments = useCallback(
    async (items: LogImportResultItem[]) => {
      const pending = attachmentsToUpload(items, attachmentsPerRun);
      if (pending.length === 0) return;

      const controller = new AbortController();
      runningUploads.current = controller;
      setIsUploading(true);
      setUploadStates(Object.fromEntries(pending.map(upload => [upload.logFileId, "pending" as LogImportUploadState])));

      const ownsWizard = () => runningUploads.current === controller;

      let position = 0;
      for (const upload of pending) {
        position++;

        if (controller.signal.aborted) {
          if (ownsWizard()) setUploadState(upload.logFileId, "failed");
          await deleteLogFile(upload.logFileId).catch(() => undefined);
          continue;
        }

        if (ownsWizard()) {
          setUploadState(upload.logFileId, "uploading");
          setProgress({ fileName: upload.file.name, current: position, count: pending.length, transferred: 0 });
        }

        try {
          await uploadResumable(
            upload.file,
            { logRunId: String(upload.logRunId), logFileId: String(upload.logFileId) },
            {
              signal: controller.signal,
              onProgress: ({ loaded, total }) => {
                if (!ownsWizard()) return;
                setProgress({
                  fileName: upload.file.name,
                  current: position,
                  count: pending.length,
                  transferred: loaded,
                  total,
                });
              },
            },
          );
          if (ownsWizard()) setUploadState(upload.logFileId, "uploaded");
        } catch (error) {
          if (ownsWizard()) setUploadState(upload.logFileId, "failed");
          await deleteLogFile(upload.logFileId).catch(() => undefined);

          // The files behind a transport that just failed are not tried; they are skipped and
          // their records removed by the same branch that a cancellation takes.
          if (!isAbortError(error)) controller.abort();
        }
      }

      // Only the run that still holds the slot may release it, so a later one is not left with its
      // uploads reported as finished while they are still on the wire.
      if (ownsWizard()) {
        runningUploads.current = null;
        setProgress(undefined);
        setIsUploading(false);
      }
    },
    [attachmentsPerRun, setUploadState],
  );

  /** Reports a refused import in the words the server chose where it supplied any. */
  const showImportError = useCallback(
    (error: unknown) => {
      if (error instanceof LogImportValidationError) {
        showAlert(t(error.messageKey, error.values ?? {}), "error");
        return;
      }
      showApiErrorAlert(error);
    },
    [showAlert, showApiErrorAlert, t],
  );

  const startImport = useCallback(async () => {
    try {
      const items = await importMutation.mutateAsync({
        boreholeId,
        logRunsCsvFile,
        logFilesCsvFile,
        attachmentsPerRun,
      });
      setReport(items);
      setStep(reportStep);
      await uploadAttachments(items);
    } catch (error) {
      showImportError(error);
    }
  }, [
    attachmentsPerRun,
    boreholeId,
    importMutation,
    logFilesCsvFile,
    logRunsCsvFile,
    showImportError,
    uploadAttachments,
  ]);

  const close = useCallback(() => {
    runningUploads.current?.abort();
    runningUploads.current = null;
    setIsUploading(false);
    setIsImporting(false);
    setStep(runsStep);
    setLogRunsCsvFile(undefined);
    setLogFilesCsvFile(undefined);
    setRequiredFilesPerRun({});
    setAttachmentsPerRun({});
    setReport(undefined);
    setUploadStates({});
    setProgress(undefined);
    importMutation.reset();
    resetTabStatus();
    queryClient.invalidateQueries({ queryKey: ["logs", boreholeId] });
    queryClient.invalidateQueries({ queryKey: [boreholeQueryKey, boreholeId] });
  }, [boreholeId, importMutation, queryClient, resetTabStatus, setIsImporting]);

  /**
   * Returns to the files step with the staged CSVs and attachments still selected.
   *
   * The report of the import that just ran is dropped, because a second import writes only what
   * is still missing and would otherwise be read next to outcomes it no longer describes.
   */
  const backToFilesStep = useCallback(() => {
    setReport(undefined);
    setUploadStates({});
    setProgress(undefined);
    importMutation.reset();
    setStep(filesStep);
  }, [importMutation]);

  const hasAnyCsv = logRunsCsvFile !== undefined || logFilesCsvFile !== undefined;

  // FormDialog closes itself whenever an action resolves truthy, so every action here says
  // explicitly whether it is done with the dialog rather than leaving it to what it happens to
  // return. The actions that close have already done their own cleanup in close().
  const cancelAction = { label: "cancel", variant: "outlined" as const, color: "primary" as const };

  const backToRunsAction = {
    label: "back",
    variant: "outlined" as const,
    color: "primary" as const,
    onClick: () => {
      setStep(runsStep);
      return false;
    },
  };

  // Going back while attachments are on the wire would change the selection the running loop
  // reads, so the uploads have to be cancelled first.
  const backToFilesAction = {
    label: "back",
    variant: "outlined" as const,
    color: "primary" as const,
    disabled: isUploading,
    onClick: () => {
      backToFilesStep();
      return false;
    },
  };

  const nextAction = {
    label: "next",
    variant: "contained" as const,
    color: "primary" as const,
    onClick: () => {
      setStep(filesStep);
      return false;
    },
  };

  const importAction = {
    label: "import",
    variant: "contained" as const,
    color: "primary" as const,
    disabled: !hasAnyCsv || importMutation.isPending,
    onClick: async () => {
      await startImport();
      return false;
    },
  };

  const closeAction = {
    label: "close",
    variant: "contained" as const,
    color: "primary" as const,
    onClick: () => {
      close();
      return false;
    },
  };

  const actionsPerStep = [
    [cancelAction, nextAction],
    [cancelAction, backToRunsAction, importAction],
    [backToFilesAction, closeAction],
  ];
  const actions = actionsPerStep[step];

  return (
    <FormDialog open={isImporting} title={t("importLogRuns")} onClose={close} actions={actions}>
      <Stepper activeStep={step} sx={{ mb: 2 }}>
        {stepLabelKeys.map(key => (
          <Step key={key}>
            <StepLabel>{t(key)}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {step === runsStep && <ImportRunsStep file={logRunsCsvFile} onFileChange={setLogRunsCsvFile} />}
      {step === filesStep && (
        <ImportFilesStep
          file={logFilesCsvFile}
          requiredFilesPerRun={requiredFilesPerRun}
          attachmentsPerRun={attachmentsPerRun}
          onFileChange={onLogFilesCsvChanged}
          onAttachmentsChange={(runNumber, files) =>
            setAttachmentsPerRun(previous => ({ ...previous, [runNumber]: files }))
          }
        />
      )}
      {step === reportStep && report && (
        <>
          {progress && <ImportUploadProgress {...progress} onCancel={() => runningUploads.current?.abort()} />}
          <ImportReportStep items={report} uploadStates={uploadStates} />
        </>
      )}
    </FormDialog>
  );
};
