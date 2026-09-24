import { FC, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Step, StepLabel, Stepper } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { boreholeQueryKey } from "../../../../../api/borehole.ts";
import { logFileUploadTarget, uploadResumable } from "../../../../../api/resumableUpload.ts";
import { isAbortError, progressRefreshIntervalMs } from "../../../../../api/transferProgress.ts";
import { AlertContext } from "../../../../../components/alert/alertContext.tsx";
import { FormDialog } from "../../../../../components/form/form.ts";
import { useRequiredId } from "../../../../../hooks/useRequiredId.ts";
import { useResetTabStatus } from "../../../../../hooks/useResetTabStatus.ts";
import { useApiErrorAlert } from "../../../../../hooks/useShowAlertOnError.tsx";
import { deleteLogFile, LogImportValidationError, useImportLogs, useRequiredAttachments } from "../log.ts";
import { LogImportResultItem, LogImportUploadState } from "../logInterfaces.ts";
import { ImportFilesStep } from "./importFilesStep.tsx";
import {
  AttachmentUploadContext,
  ImportLogWizardProps,
  ImportStep,
  UploadProgressState,
} from "./importLogWizardInterfaces.ts";
import { attachmentsToUpload, AttachmentUpload } from "./importReport.ts";
import { ImportReportStep } from "./importReportStep.tsx";
import { ImportRunsStep } from "./importRunsStep.tsx";
import { ImportUploadProgress } from "./importUploadProgress.tsx";

const stepLabelKeys = ["logRuns", "logFiles", "importReport"];

/** Removes the record the import wrote for an attachment that never arrived. */
const discardRecord = async (logFileId: number) => await deleteLogFile(logFileId).catch(() => undefined);

/**
 * Sends one attachment and keeps its record only if it arrives.
 * @param upload The attachment and the record it belongs to.
 * @param position The attachment's place in the run, counted from one.
 * @param context What the attachment's run supplies.
 */
const sendAttachment = async (upload: AttachmentUpload, position: number, context: AttachmentUploadContext) => {
  const { controller, count, ownsWizard, setUploadState, setProgress } = context;

  if (controller.signal.aborted) {
    if (ownsWizard()) setUploadState(upload.logFileId, "failed");
    await discardRecord(upload.logFileId);
    return;
  }

  if (ownsWizard()) {
    setUploadState(upload.logFileId, "uploading");
    setProgress({ fileName: upload.file.name, current: position, count, transferred: 0 });
  }

  // The byte count changes faster than it can be read, so it is refreshed on an interval. The
  // last event of a file is always shown, otherwise its numbers would stop short of its size.
  let lastReportedAt = 0;

  try {
    await uploadResumable(
      upload.file,
      logFileUploadTarget,
      { logRunId: String(upload.logRunId), logFileId: String(upload.logFileId) },
      {
        signal: controller.signal,
        onProgress: ({ loaded, total }) => {
          if (!ownsWizard()) return;

          const isSent = total !== undefined && loaded >= total;
          const now = Date.now();
          if (!isSent && now - lastReportedAt < progressRefreshIntervalMs) return;
          lastReportedAt = now;

          setProgress({ fileName: upload.file.name, current: position, count, transferred: loaded, total });
        },
      },
    );
    if (ownsWizard()) setUploadState(upload.logFileId, "uploaded");
  } catch (error) {
    if (ownsWizard()) setUploadState(upload.logFileId, "failed");
    await discardRecord(upload.logFileId);

    // The files behind a transport that just failed are not tried; they are skipped and
    // their records removed by the same branch that a cancellation takes.
    if (!isAbortError(error)) controller.abort();
  }
};

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

  const [step, setStep] = useState(ImportStep.Runs);
  const [logRunsCsvFile, setLogRunsCsvFile] = useState<File>();
  const [logFilesCsvFile, setLogFilesCsvFile] = useState<File>();
  const [attachmentsPerRun, setAttachmentsPerRun] = useState<Record<string, File[]>>({});
  const [uploadStates, setUploadStates] = useState<Record<number, LogImportUploadState>>({});
  const [progress, setProgress] = useState<UploadProgressState>();
  const runningUploads = useRef<AbortController | null>(null);

  // Closing the wizard aborts what it has on the wire, but the dialog is also torn down when the
  // page it belongs to is left, which no action of the wizard passes through.
  useEffect(() => () => runningUploads.current?.abort(), []);

  const importMutation = useImportLogs();
  const requiredAttachmentsMutation = useRequiredAttachments();
  const requiredFilesPerRun = requiredAttachmentsMutation.data ?? {};
  const report = importMutation.data;
  const isUploading = Object.values(uploadStates).some(state => state === "pending" || state === "uploading");

  const setUploadState = useCallback((logFileId: number, state: LogImportUploadState) => {
    setUploadStates(previous => ({ ...previous, [logFileId]: state }));
  }, []);

  const onLogFilesCsvChanged = useCallback(
    (file?: File) => {
      setLogFilesCsvFile(file);
      setAttachmentsPerRun({});
      requiredAttachmentsMutation.reset();

      if (!file) return;

      // Without the expected names the wizard cannot ask for the attachments, so the step stays
      // empty and the error the mutation holds is shown instead.
      requiredAttachmentsMutation.mutate({ boreholeId, logFilesCsvFile: file });
    },
    [boreholeId, requiredAttachmentsMutation],
  );

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

      setUploadStates(Object.fromEntries(pending.map(upload => [upload.logFileId, "pending"])));

      const context: AttachmentUploadContext = {
        controller,
        count: pending.length,
        ownsWizard: () => runningUploads.current === controller,
        setUploadState,
        setProgress,
      };

      let position = 0;
      for (const upload of pending) {
        position++;
        await sendAttachment(upload, position, context);
      }

      // Only the run that still holds the slot may release it, so a later one is not left with its
      // uploads reported as finished while they are still on the wire.
      if (context.ownsWizard()) {
        runningUploads.current = null;
        setProgress(undefined);
      }

      void queryClient.invalidateQueries({ queryKey: ["logs", boreholeId] });
    },
    [attachmentsPerRun, boreholeId, queryClient, setUploadState],
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
    const controller = new AbortController();
    runningUploads.current?.abort();
    runningUploads.current = controller;

    try {
      const items = await importMutation.mutateAsync({
        boreholeId,
        logRunsCsvFile,
        logFilesCsvFile,
        attachmentsPerRun,
      });
      if (runningUploads.current !== controller || controller.signal.aborted) return;

      setStep(ImportStep.Report);
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
    setIsImporting(false);
    setStep(ImportStep.Runs);
    setLogRunsCsvFile(undefined);
    setLogFilesCsvFile(undefined);
    setAttachmentsPerRun({});
    setUploadStates({});
    setProgress(undefined);
    importMutation.reset();
    requiredAttachmentsMutation.reset();
    resetTabStatus();
    void queryClient.invalidateQueries({ queryKey: ["logs", boreholeId] });
    void queryClient.invalidateQueries({ queryKey: [boreholeQueryKey, boreholeId] });
  }, [boreholeId, importMutation, queryClient, requiredAttachmentsMutation, resetTabStatus, setIsImporting]);

  /**
   * Returns to the files step with the staged CSVs and attachments still selected.
   *
   * The report of the import that just ran is dropped, because a second import writes only what
   * is still missing and would otherwise be read next to outcomes it no longer describes.
   */
  const backToFilesStep = useCallback(() => {
    setUploadStates({});
    setProgress(undefined);
    importMutation.reset();
    setStep(ImportStep.Files);
  }, [importMutation]);

  const hasAnyCsv = logRunsCsvFile !== undefined || logFilesCsvFile !== undefined;

  // FormDialog closes itself whenever an action resolves truthy, so every action here says
  // explicitly whether it is done with the dialog rather than leaving it to what it happens to
  // return. The actions that close have already done their own cleanup in close().
  const isImportOnTheWire = importMutation.isPending;

  const cancelAction = {
    label: "cancel",
    variant: "outlined" as const,
    color: "primary" as const,
    disabled: isImportOnTheWire,
  };

  const backToRunsAction = {
    label: "back",
    variant: "outlined" as const,
    color: "primary" as const,
    disabled: isImportOnTheWire,
    onClick: () => {
      setStep(ImportStep.Runs);
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
      setStep(ImportStep.Files);
      return false;
    },
  };

  // A log files CSV whose expected names could not be read leaves the wizard unable to ask for the
  // attachments, and an import started anyway would write log file records no upload ever fills.
  const isLogFilesCsvUnread = requiredAttachmentsMutation.isPending || requiredAttachmentsMutation.isError;

  const readError = requiredAttachmentsMutation.error;
  const explainedReadError =
    readError instanceof LogImportValidationError ? readError.messageKey : "importErrorUnreadableCsv";
  const readErrorMessageKey = readError ? explainedReadError : undefined;

  const importAction = {
    label: "import",
    variant: "contained" as const,
    color: "primary" as const,
    disabled: !hasAnyCsv || importMutation.isPending || isLogFilesCsvUnread,
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
      {step === ImportStep.Runs && <ImportRunsStep file={logRunsCsvFile} onFileChange={setLogRunsCsvFile} />}
      {step === ImportStep.Files && (
        <ImportFilesStep
          file={logFilesCsvFile}
          requiredFilesPerRun={requiredFilesPerRun}
          attachmentsPerRun={attachmentsPerRun}
          isReadingCsv={requiredAttachmentsMutation.isPending}
          readErrorMessageKey={readErrorMessageKey}
          onFileChange={onLogFilesCsvChanged}
          onAttachmentsChange={(runNumber, files) =>
            setAttachmentsPerRun(previous => ({ ...previous, [runNumber]: files }))
          }
        />
      )}
      {step === ImportStep.Report && report && (
        <>
          {progress && <ImportUploadProgress {...progress} onCancel={() => runningUploads.current?.abort()} />}
          <ImportReportStep items={report} uploadStates={uploadStates} />
        </>
      )}
    </FormDialog>
  );
};
