import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import { Tab, TabPanel } from "../../../components/tabs/tabPanel.tsx";
import { useRequiredParams } from "../../../hooks/useRequiredParams.ts";
import { Documents } from "./tabs/documents.tsx";
import { Photos } from "./tabs/photos.tsx";
import { Profiles } from "./tabs/profiles.tsx";

export const Attachments: FC = () => {
  const { t } = useTranslation();
  const { id } = useRequiredParams<{ id: string }>();
  const boreholeId = parseInt(id);

  const tabs = useMemo<Tab[]>(
    () => [
      {
        label: t("profiles"),
        hash: "#profiles",
        component: <Profiles boreholeId={boreholeId} />,
      },
      {
        label: t("photos"),
        hash: "#photos",
        component: <Photos boreholeId={boreholeId} />,
      },
      {
        label: t("documents"),
        hash: "#documents",
        component: <Documents boreholeId={boreholeId} />,
      },
    ],
    [boreholeId, t],
  );
  return (
    <Box sx={{ position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
      <TabPanel tabs={tabs} />
    </Box>
  );
};
