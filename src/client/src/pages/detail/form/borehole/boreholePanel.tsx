import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/system";
import { TabPanel } from "../../../../components/tabs/tabPanel.tsx";
import { useBoreholeDataAvailability } from "../../../../hooks/useBoreholeDataAvailability.ts";
import { BoreholeForm } from "./boreholeForm.tsx";
import { BoreholeProps } from "./boreholePanelInterfaces";
import Geometry from "./geometry.jsx";
import Sections from "./sections.jsx";

export const BoreholePanel: FC<BoreholeProps> = ({ borehole }) => {
  const { t } = useTranslation();
  const { hasGeometry, hasSections } = useBoreholeDataAvailability(borehole);

  const tabs = useMemo(
    () => [
      {
        label: t("general"),
        hash: "#general",
        component: <BoreholeForm borehole={borehole} />,
      },
      {
        label: t("sections"),
        hash: "#sections",
        component: <Sections />,
        hasContent: hasSections,
      },
      {
        label: t("geometry"),
        hash: "#geometry",
        component: <Geometry measuredDepth={borehole?.totalDepth} />,
        hasContent: hasGeometry,
      },
    ],
    [borehole, hasGeometry, hasSections, t],
  );

  return (
    <Box sx={{ position: "relative" }}>
      <TabPanel tabs={tabs} />
    </Box>
  );
};
