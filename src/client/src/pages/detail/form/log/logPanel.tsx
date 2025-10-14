import { FC, useCallback, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress, Stack } from "@mui/material";
import { AddButton } from "../../../../components/buttons/buttons.tsx";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { TabPanel } from "../../../../components/tabs/tabPanel.tsx";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { EditStateContext } from "../../editStateContext.tsx";
import { LogRun, useLogsByBoreholeId } from "./log.ts";
import { LogRunModal } from "./logRunModal.tsx";
import { LogTable } from "./logTable.tsx";

export const LogPanel: FC = () => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);
  const { id: boreholeId } = useRequiredParams();
  const [selectedLogRun, setSelectedLogRun] = useState<LogRun | undefined>();
  const { data: logRuns = [], isLoading } = useLogsByBoreholeId(Number(boreholeId));

  const addRun = useCallback(() => {
    setSelectedLogRun({
      id: 0,
      boreholeId: Number(boreholeId),
    });
  }, [boreholeId]);

  const updateTmpLogRun = useCallback(() => {
    console.log("setSelectedLogRun to undefined and update tmpLogRun");
    setSelectedLogRun(undefined);
  }, [setSelectedLogRun]);

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
              component: <LogTable runs={logRuns} isLoading={isLoading} setSelectedLogRun={setSelectedLogRun} />,
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
