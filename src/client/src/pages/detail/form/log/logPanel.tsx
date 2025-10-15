import { FC, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress, Stack } from "@mui/material";
import { AddButton } from "../../../../components/buttons/buttons.tsx";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { TabPanel } from "../../../../components/tabs/tabPanel.tsx";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { EditStateContext } from "../../editStateContext.tsx";
import { useLogsByBoreholeId } from "./log.ts";
import { LogTable } from "./logTable.tsx";

export const LogPanel: FC = () => {
  const { t } = useTranslation();
  const { editingEnabled } = useContext(EditStateContext);
  const { id: boreholeId } = useRequiredParams();
  const { data: logRuns = [], isLoading } = useLogsByBoreholeId(Number(boreholeId));

  const addRun = useCallback(() => {
    console.log("Add log run");
  }, []);

  if (isLoading) {
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );
  }

  return (
    <Box sx={{ position: "relative" }}>
      <TabPanel
        supportFullscreen={!editingEnabled}
        title={t("log")}
        tabs={[
          {
            label: t("table"),
            hash: "#table",
            component: <LogTable runs={logRuns} isLoading={isLoading} boreholeId={boreholeId} />,
          },
        ]}
      />
      {editingEnabled && (
        <Stack direction="row" gap={0.75} sx={{ position: "absolute", top: 0, right: 0, mx: 2, my: 1 }}>
          <AddButton label="addLogRun" variant="contained" onClick={addRun} />
        </Stack>
      )}
    </Box>
  );
};
