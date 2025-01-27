import { forwardRef, SyntheticEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useLocation } from "react-router-dom";
import { BdmsTab, BdmsTabContentBox, BdmsTabs } from "../../../../components/styledTabComponents.js";
import { BoreholeForm } from "./boreholeForm.tsx";
import { BoreholePanelProps } from "./boreholePanelInterfaces";
import Geometry from "./geometry.jsx";
import Sections from "./sections.jsx";

export const BoreholePanel = forwardRef(({ borehole, onSubmit }: BoreholePanelProps, ref) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = useMemo(
    () => [
      {
        label: t("general"),
        hash: "general",
      },
      { label: t("sections"), hash: "sections" },
      { label: t("boreholeGeometry"), hash: "geometry" },
    ],
    [t],
  );

  const handleIndexChange = (event: SyntheticEvent | null, index: number) => {
    const newLocation = location.pathname + "#" + tabs[index].hash;
    if (location.pathname + location.hash !== newLocation) {
      history.push(newLocation);
    }
  };

  // Update active tab index based on hash
  useEffect(() => {
    if (!location.hash) {
      history.replace(location.pathname + "#" + tabs[activeIndex].hash);
    } else {
      const newTabIndex = tabs.findIndex(t => t.hash === location.hash.replace("#", ""));
      if (newTabIndex > -1) {
        setActiveIndex(newTabIndex);
      }
    }
  }, [activeIndex, history, location.hash, location.pathname, tabs]);

  return (
    <>
      <BdmsTabs value={activeIndex} onChange={handleIndexChange}>
        {tabs.map(tab => {
          return <BdmsTab data-cy={tab.hash + "-tab"} label={tab.label} key={tab.hash} />;
        })}
      </BdmsTabs>
      <BdmsTabContentBox flex="1 0 0" sx={{ overflow: "auto" }}>
        {activeIndex === 0 && <BoreholeForm borehole={borehole} onSubmit={onSubmit} ref={ref} />}
        {activeIndex === 1 && <Sections />}
        {activeIndex === 2 && <Geometry measuredDepth={borehole?.totalDepth} />}
      </BdmsTabContentBox>
    </>
  );
});
