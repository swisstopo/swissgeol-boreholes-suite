import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress, Stack } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { AddButton } from "../../../../components/buttons/buttons.tsx";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { TabPanel } from "../../../../components/tabs/tabPanel.tsx";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { EditStateContext } from "../../editStateContext.tsx";
import { SaveContext } from "../../saveContext.tsx";
import { LogRunChangeTracker, TmpLogRun, useLogRunMutations, useLogsByBoreholeId } from "./log.ts";
import { LogRunModal } from "./logRunModal.tsx";
import { LogTable } from "./logTable.tsx";
import { preparelogRunForSubmit } from "./logUtils.ts";

export const LogPanel: FC = () => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);
  const { id: boreholeId } = useRequiredParams();
  const [selectedLogRunId, setSelectedLogRunId] = useState<string | undefined>();
  const { registerSaveHandler, registerResetHandler, unMount, markAsChanged } = useContext(SaveContext);
  const { data: logRuns = [], isLoading } = useLogsByBoreholeId(Number(boreholeId));
  const [tmpLogRuns, setTmpLogRuns] = useState<LogRunChangeTracker[]>([]);
  const tmpLogRunsFlat: TmpLogRun[] = useMemo(() => tmpLogRuns.map(l => l.item as TmpLogRun), [tmpLogRuns]);

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
        boreholeId: Number(boreholeId),
        tmpId: "new",
      } as TmpLogRun;
    }
    return tmpLogRunsFlat.find(l => l.tmpId === selectedLogRunId || l.id.toString() === selectedLogRunId);
  }, [boreholeId, selectedLogRunId, tmpLogRunsFlat]);

  const addRun = useCallback(() => {
    setSelectedLogRunId("new");
  }, []);

  const updateLogRunItem = useCallback(
    (selectedId: string | undefined, item: TmpLogRun, hasChanges: boolean) => {
      setTmpLogRuns(prev => {
        if (hasChanges) {
          markAsChanged(true);

          if (selectedId != "new" && selectedId !== undefined) {
            return prev.map(l => (l.item.tmpId === selectedId ? { item, hasChanges: true } : l));
          }

          // fallback to add if id is undefined and add a new tmpId
          return [...prev, { item: { ...item, tmpId: uuidv4() }, hasChanges: true }];
        }

        return prev;
      });
    },
    [markAsChanged, setTmpLogRuns],
  );

  const updateTmpLogRun = useCallback(
    (logRun: TmpLogRun, hasChanges: boolean) => {
      updateLogRunItem(selectedLogRunId, logRun, hasChanges);
      setSelectedLogRunId(undefined);
    },
    [selectedLogRunId, updateLogRunItem],
  );

  const initTmpLogRuns = useCallback(() => {
    setTmpLogRuns(logRuns.map(lr => ({ item: { tmpId: lr.id.toString(), ...lr }, hasChanges: false })));
  }, [logRuns, setTmpLogRuns]);

  const deleteRuns = useCallback(async () => {
    const logRunsToDelete = logRuns.filter(lr => !tmpLogRunsFlat.some(tlr => tlr.id === lr.id));
    if (logRunsToDelete.length === 0) return;
    await deleteLogRuns(logRunsToDelete);
  }, [deleteLogRuns, logRuns, tmpLogRunsFlat]);

  const addAndUpdateLogRuns = useCallback(async () => {
    for (const logRun of tmpLogRuns.filter(l => l.hasChanges).map(l => l.item)) {
      preparelogRunForSubmit(logRun);
      if (logRun.id === 0) {
        await addLogRun({ ...logRun, boreholeId: Number(boreholeId) });
      } else {
        await updateLogRun(logRun);
      }
    }
  }, [addLogRun, boreholeId, tmpLogRuns, updateLogRun]);

  const onReset = useCallback(async () => {
    initTmpLogRuns();
  }, [initTmpLogRuns]);

  const onSave = useCallback(async () => {
    await Promise.all([deleteRuns(), addAndUpdateLogRuns()]);
    return true;
  }, [addAndUpdateLogRuns, deleteRuns]);

  useEffect(() => {
    registerSaveHandler(onSave);
    registerResetHandler(onReset);
    return () => {
      unMount();
    };
  }, [onReset, onSave, registerResetHandler, registerSaveHandler, unMount]);

  useEffect(() => {
    initTmpLogRuns();
  }, [initTmpLogRuns]);

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
                />
              ),
            },
          ]}
        />
        {editingEnabled && (
          <Stack direction="row" gap={0.75} sx={{ position: "absolute", top: 0, right: 0, mx: 2, my: 1 }}>
            <AddButton label="addLogRun" variant="contained" onClick={addRun} />
          </Stack>
        )}
      </Box>
      <LogRunModal logRun={selectedLogRun} updateLogRun={updateTmpLogRun} />
    </>
  );
};
