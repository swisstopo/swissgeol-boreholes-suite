import { forwardRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TabPanel } from "../../../../components/tabs/tabPanel.tsx";
import { BoreholeForm } from "./boreholeForm.tsx";
import { BoreholePanelProps } from "./boreholePanelInterfaces";
import Geometry from "./geometry.jsx";
import Sections from "./sections.jsx";

export const BoreholePanel = forwardRef(({ borehole, onSubmit }: BoreholePanelProps, ref) => {
  const { t } = useTranslation();

  const tabs = useMemo(
    () => [
      {
        label: t("general"),
        hash: "general",
        component: <BoreholeForm borehole={borehole} onSubmit={onSubmit} ref={ref} />,
      },
      { label: t("sections"), hash: "sections", component: <Sections /> },
      { label: t("boreholeGeometry"), hash: "geometry", component: <Geometry measuredDepth={borehole?.totalDepth} /> },
    ],
    [borehole, onSubmit, ref, t],
  );

  return <TabPanel tabs={tabs} />;
});
