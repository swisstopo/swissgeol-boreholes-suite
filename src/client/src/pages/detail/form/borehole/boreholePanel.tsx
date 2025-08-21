import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TabPanel } from "../../../../components/tabs/tabPanel.tsx";
import { BoreholeForm } from "./boreholeForm.tsx";
import { BoreholeProps } from "./boreholePanelInterfaces";
import Geometry from "./geometry.jsx";
import Sections from "./sections.jsx";

export const BoreholePanel: FC<BoreholeProps> = ({ borehole }) => {
  const { t } = useTranslation();

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
        hasContent: (borehole?.sections?.length ?? 0) > 0,
      },
      {
        label: t("geometry"),
        hash: "#geometry",
        component: <Geometry measuredDepth={borehole?.totalDepth} />,
        hasContent: (borehole?.boreholeGeometry?.length ?? 0) > 0,
      },
    ],
    [borehole, t],
  );

  return <TabPanel tabs={tabs} />;
};
