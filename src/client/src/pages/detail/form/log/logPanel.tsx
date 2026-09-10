import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress, Stack } from "@mui/material";
import { Trash2, X } from "lucide-react";
import UploadIcon from "../../../../assets/icons/upload.svg?react";
import { v4 as uuidv4 } from "uuid";
import { formatBytes, isAbortError, progressRefreshIntervalMs } from "../../../../api/transferProgress.ts";
import { AddButton, BoreholesBaseButton } from "../../../../components/buttons/buttons.tsx";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { TabPanel } from "../../../../components/tabs/tabPanel.tsx";
import { useRequiredId } from "../../../../hooks/useRequiredId.ts";
import { useApiErrorAlert } from "../../../../hooks/useShowAlertOnError.tsx";
import { EditStateContext } from "../../editStateContext.tsx";
import { SaveContext } from "../../saveContext.tsx";
import { ImportLogRunsModal } from "./importLogRunsModal.tsx";
import {
  countPendingUploads,
  fetchLogRunsByBoreholeId,
  LogFileUploadProgressCallback,
  useLogRunMutations,
  useLogsByBoreholeId,
} from "./log.ts";
import { LogRun, LogRunChangeTracker } from "./logInterfaces.ts";
import { LogRunModal } from "./logRunModal.tsx";
import { LogTable } from "./logTable.tsx";
import {
  applyCreatedRun,
  applyStoredFiles,
  applyUploadedFiles,
  hasUnsavedWork,
  markRunSaved,
  prepareLogRunForSubmit,
  toTrackedRuns,
} from "./logUtils.ts";

export const LogPanel: FC = () => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);
  const boreholeId = useRequiredId();
  const [selectedLogRunId, setSelectedLogRunId] = useState<string | undefined>();
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const {
    registerSaveHandler,
    registerResetHandler,
    unMount,
    setHasChanges,
    hasChanges,
    triggerReset,
    setSaveProgress,
  } = useContext(SaveContext);
  const { showPrompt } = useContext(PromptContext);
  const showApiErrorAlert = useApiErrorAlert();
  const { data: logRuns = [], isLoading } = useLogsByBoreholeId(boreholeId);
  const [tmpLogRuns, setTmpLogRuns] = useState<LogRunChangeTracker[]>([]);
  const lastReportedAt = useRef(0);
  const lastReportedFile = useRef(0);
  const runningSave = useRef<AbortController | null>(null);
  const tmpLogRunsFlat: LogRun[] = useMemo(() => tmpLogRuns.map(l => l.item as LogRun), [tmpLogRuns]);

  const {
    delete: { mutateAsync: deleteLogRuns },
    add: { mutateAsync: addLogRun },
    update: { mutateAsync: updateLogRun },
  } = useLogRunMutations();

  const selectedLogRun = useMemo(() => {
    if (selectedLogRunId === undefined) return undefined;
    if (selectedLogRunId === "new") {
      return {
        id: 0,
        boreholeId: boreholeId,
        tmpId: "new",
      } as LogRun;
    }
    return tmpLogRunsFlat.find(l => l.tmpId === selectedLogRunId || l.id.toString() === selectedLogRunId);
  }, [boreholeId, selectedLogRunId, tmpLogRunsFlat]);

  const addRun = useCallback(() => {
    setSelectedLogRunId("new");
  }, []);

  const startImport = useCallback(() => {
    if (!hasChanges) {
      setIsImporting(true);
      return;
    }
    showPrompt("messageDiscardUnsavedChanges", [
      {
        label: "cancel",
        icon: <X />,
        variant: "outlined",
      },
      {
        label: "discardChanges",
        icon: <Trash2 />,
        variant: "contained",
        action: () => {
          triggerReset();
          setIsImporting(true);
        },
      },
    ]);
  }, [hasChanges, showPrompt, triggerReset]);

  const updateLogRunItem = useCallback(
    (selectedId: string | undefined, item: LogRun, hasChanges: boolean) => {
      setTmpLogRuns(prev => {
        if (hasChanges) {
          setHasChanges(true);

          if (selectedId != "new" && selectedId !== undefined) {
            return prev.map(l => (l.item.tmpId === selectedId ? { item, hasChanges: true } : l));
          }

          // fallback to add if id is undefined and add a new tmpId
          return [...prev, { item: { ...item, tmpId: uuidv4() }, hasChanges: true }];
        }

        return prev;
      });
    },
    [setHasChanges, setTmpLogRuns],
  );

  const updateTmpLogRun = useCallback(
    (logRun: LogRun, hasChanges: boolean) => {
      updateLogRunItem(selectedLogRunId, logRun, hasChanges);
      setSelectedLogRunId(undefined);
    },
    [selectedLogRunId, updateLogRunItem],
  );

  const initTmpLogRuns = useCallback(() => {
    setTmpLogRuns(toTrackedRuns(logRuns));
  }, [logRuns, setTmpLogRuns]);

  const deleteRuns = useCallback(async () => {
    const logRunsToDelete = logRuns.filter(lr => !tmpLogRunsFlat.some(tlr => tlr.id === lr.id));
    if (logRunsToDelete.length === 0) return;
    await deleteLogRuns(logRunsToDelete);
  }, [deleteLogRuns, logRuns, tmpLogRunsFlat]);

  const addAndUpdateLogRuns = useCallback(
    async (signal: AbortSignal, onCancel: () => void) => {
      const changedLogRuns = tmpLogRuns.filter(l => l.hasChanges).map(l => l.item);
      const totalUploads = changedLogRuns.reduce((sum, logRun) => sum + countPendingUploads(logRun), 0);

      // What a previous save reported says nothing about this one, and leaving it would let the
      // throttle swallow the first file of a save started moments after the last one ended.
      lastReportedFile.current = 0;
      lastReportedAt.current = 0;

      /** Announces a part of the save that carries no progress of its own. */
      const reportPhase = (message: string) => setSaveProgress({ message, onCancel });

      // The first progress event only arrives once a file is on the wire. Until then the save
      // is already announced, so the overlay does not switch its appearance mid-upload.
      if (totalUploads > 0) {
        reportPhase(t("preparingUpload"));
      }

      // Files are uploaded one at a time, so a running offset over the log runs yields the
      // position of the file currently in flight within the whole save.
      let uploadsBeforeCurrentRun = 0;
      const reportProgress = (offset: number): LogFileUploadProgressCallback => {
        return ({ fileName, indexInRun, loaded, total }) => {
          const position = offset + indexInRun + 1;

          // Sending the bytes is only the first half of the request: the server then stores the
          // file and answers.
          const isSent = total !== undefined && loaded >= total;

          // The byte count changes faster than it can be read, so it is refreshed on an interval.
          // The first and the last event of a file are always shown, otherwise its name would
          // appear late and its numbers would stop short of its size.
          const now = Date.now();
          const startsNewFile = lastReportedFile.current !== position;
          if (!startsNewFile && !isSent && now - lastReportedAt.current < progressRefreshIntervalMs) return;
          lastReportedFile.current = position;
          lastReportedAt.current = now;

          const placeInSave = { current: position, total: totalUploads };
          const placeHint = t("uploadProgressHint", placeInSave);
          const transferHint =
            total === undefined
              ? placeHint
              : t("uploadProgressHintWithSize", {
                  ...placeInSave,
                  transferred: formatBytes(loaded),
                  size: formatBytes(total),
                });

          setSaveProgress({
            message: isSent ? t("storingFile", { name: fileName }) : t("uploadingFile", { name: fileName }),
            hint: isSent ? placeHint : transferHint,
            onCancel,
          });
        };
      };

      for (const logRun of changedLogRuns) {
        signal.throwIfAborted();

        const payload = prepareLogRunForSubmit(logRun);

        // The payload carries no identity of its own, and the run may be edited while its files
        // are going up, so what each submitted file was taken from is remembered here.
        const submittedTmpIds = logRun.logFiles?.map(file => file.tmpId);
        const pendingUploads = countPendingUploads(logRun);
        const onFileProgress = totalUploads > 0 ? reportProgress(uploadsBeforeCurrentRun) : undefined;

        try {
          if (payload.id === 0) {
            const createdLogRun = await addLogRun({
              logRun: { ...payload, boreholeId: boreholeId, logFiles: [] },
              signal,
            });

            // The run exists from here on, whatever becomes of its files, so a save that is given
            // up on next leaves a repeat updating this run rather than creating a second one.
            setTmpLogRuns(prev => applyCreatedRun(prev, logRun.tmpId, createdLogRun.id));

            if (payload.logFiles && payload.logFiles.length > 0) {
              await updateLogRun({ logRun: { ...createdLogRun, logFiles: payload.logFiles }, onFileProgress, signal });
            }
          } else {
            await updateLogRun({ logRun: payload, onFileProgress, signal });
          }

          // The run reached the server whole, so it stops being a change the panel has to keep.
          setTmpLogRuns(prev => markRunSaved(prev, logRun.tmpId));
        } finally {
          // A save that was given up on still stored the files it got through, so they are
          // marked before the rejection travels on and leaves the rest unsaved.
          setTmpLogRuns(prev => applyUploadedFiles(prev, logRun.tmpId, payload.logFiles, submittedTmpIds));
        }
        uploadsBeforeCurrentRun += pendingUploads;

        if (totalUploads > 0) {
          reportPhase(t("savingChanges"));
        }
      }
    },
    [addLogRun, boreholeId, setSaveProgress, setTmpLogRuns, t, tmpLogRuns, updateLogRun],
  );

  const onReset = useCallback(async () => {
    initTmpLogRuns();
  }, [initTmpLogRuns]);

  /**
   * A file whose upload was given up on may still have reached the server, which stores it and
   * answers nobody. The client cannot tell that apart from an upload that never arrived, so it
   * reads back what the run holds and stops offering those files for a repeat save.
   */
  const reconcileStoredFiles = useCallback(async () => {
    try {
      const storedRuns = await fetchLogRunsByBoreholeId(boreholeId);
      setTmpLogRuns(prev => applyStoredFiles(prev, storedRuns));
    } catch (error) {
      showApiErrorAlert(error);
    }
  }, [boreholeId, setTmpLogRuns, showApiErrorAlert]);

  const onSave = useCallback(async () => {
    const abortController = new AbortController();
    runningSave.current = abortController;
    try {
      await Promise.all([deleteRuns(), addAndUpdateLogRuns(abortController.signal, () => abortController.abort())]);
      return true;
    } catch (error) {
      // Giving up on the upload is not a failure. The log runs whose files already reached the
      // server keep them, and the unsaved changes stay so the save can be repeated.
      if (isAbortError(error)) {
        await reconcileStoredFiles();
        return false;
      }
      showApiErrorAlert(error);
      return false;
    } finally {
      runningSave.current = null;
    }
  }, [addAndUpdateLogRuns, deleteRuns, reconcileStoredFiles, showApiErrorAlert]);

  // Leaving the page while a save runs stops it.
  useEffect(() => {
    const saveOnMount = runningSave;
    return () => saveOnMount.current?.abort();
  }, []);

  useEffect(() => {
    registerSaveHandler(onSave);
    registerResetHandler(onReset);
    return () => {
      unMount();
    };
  }, [onReset, onSave, registerResetHandler, registerSaveHandler, unMount]);

  useEffect(() => {
    // Saving a new run creates it before its files are sent, and creating it makes the server's
    // runs be read again. Taking them while the panel still holds files waiting to be sent would
    // drop those files and mark what is left unchanged, leaving nothing to save a second time.
    setTmpLogRuns(prev => (hasUnsavedWork(prev) ? prev : toTrackedRuns(logRuns)));
  }, [logRuns]);

  if (isLoading) {
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );
  }

  return (
    <>
      <Box sx={{ position: "relative" }}>
        <TabPanel
          supportFullscreen={!editingEnabled}
          title={t("log")}
          tabs={[
            {
              label: t("table"),
              hash: "#table",
              component: (
                <LogTable
                  runs={tmpLogRunsFlat}
                  isLoading={isLoading}
                  setSelectedLogRunId={setSelectedLogRunId}
                  setTmpLogRuns={setTmpLogRuns}
                  boreholeId={boreholeId}
                />
              ),
            },
          ]}
        />
        {editingEnabled && (
          <Stack direction="row" gap={0.75} sx={{ position: "absolute", top: 0, right: 0, mx: 2, my: 1 }}>
            <BoreholesBaseButton
              label="import"
              variant="outlined"
              color="secondary"
              icon={<UploadIcon />}
              onClick={startImport}
            />
            <AddButton label="addLogRun" variant="contained" onClick={addRun} />
          </Stack>
        )}
      </Box>
      <ImportLogRunsModal isImporting={isImporting} setIsImporting={setIsImporting} />
      <LogRunModal logRun={selectedLogRun} updateLogRun={updateTmpLogRun} runs={tmpLogRunsFlat} />
    </>
  );
};
