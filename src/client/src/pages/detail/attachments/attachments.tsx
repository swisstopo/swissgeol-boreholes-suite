import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import { useBorehole } from "../../../api/borehole.ts";
import { Tab, TabPanel } from "../../../components/tabs/tabPanel.tsx";
import { useBoreholeDataAvailability } from "../../../hooks/useBoreholeDataAvailability.ts";
import { useRequiredParams } from "../../../hooks/useRequiredParams.ts";
import { Documents } from "./tabs/documents.tsx";
import { Photos } from "./tabs/photos.tsx";
import { Profiles } from "./tabs/profiles.tsx";

export const Attachments: FC = () => {
  const { t } = useTranslation();
  const { id } = useRequiredParams<{ id: string }>();
  const boreholeId = parseInt(id);
  const { data: borehole } = useBorehole(boreholeId);
  const { hasPhotos, hasProfiles, hasDocuments } = useBoreholeDataAvailability(borehole);

  const tabs = useMemo<Tab[]>(
    () => [
      {
        label: t("profiles"),
        hash: "#profiles",
        component: <Profiles boreholeId={boreholeId} />,
        hasContent: hasProfiles,
      },
      {
        label: t("photos"),
        hash: "#photos",
        component: <Photos boreholeId={boreholeId} />,
        hasContent: hasPhotos,
      },
      {
        label: t("documents"),
        hash: "#documents",
        component: <Documents boreholeId={boreholeId} />,
        hasContent: hasDocuments,
      },
    ],
    [boreholeId, hasProfiles, hasDocuments, hasPhotos, t],
  );
  return (
    <Box sx={{ position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>
      <TabPanel tabs={tabs} />
    </Box>
  );
};
