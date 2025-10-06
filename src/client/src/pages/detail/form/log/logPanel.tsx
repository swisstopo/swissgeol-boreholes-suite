import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import { TabPanel } from "../../../../components/tabs/tabPanel.tsx";
import { LogTable } from "./logTable.tsx";

export const LogPanel: FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ position: "relative" }}>
      <TabPanel
        supportFullscreen={true}
        title={t("log")}
        tabs={[
          {
            label: t("logTable"),
            hash: "#table",
            component: <LogTable />,
          },
        ]}
      />
    </Box>
  );
};
