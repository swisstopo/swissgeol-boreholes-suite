import BoreholeGeneralSegment from "../segments/boreholeGeneralSegment.jsx";
import BoreholeDetailSegment from "../segments/boreholeDetailSegment.jsx";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import Sections from "./sections.jsx";
import Geometry from "./geometry.jsx";
import { BdmsTab, BdmsTabContentBox, BdmsTabs } from "../../../../../components/styledTabComponents.jsx";
import { useHistory, useLocation } from "react-router-dom";

const BoreholePanel = ({ size, boreholeId, borehole, updateChange, updateNumber, isEditable }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const tabs = [
    {
      label: t("general"),
      hash: "general",
    },
    { label: t("sections"), hash: "sections" },
    { label: t("boreholeGeometry"), hash: "geometry" },
  ];

  const handleIndexChange = (event, index) => {
    setActiveIndex(index);
    const newLocation = location.pathname + "#" + tabs[index].hash;
    if (location.pathname + location.hash !== newLocation) {
      history.push(newLocation);
    }
  };

  useEffect(() => {
    const newTabIndex = tabs.findIndex(t => t.hash === location.hash.replace("#", ""));
    if (newTabIndex > -1 && activeIndex !== newTabIndex) {
      handleIndexChange(null, newTabIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  useEffect(() => {
    if (!location.hash) {
      history.replace(location.pathname + "#" + tabs[activeIndex].hash);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <BdmsTabs value={activeIndex} onChange={handleIndexChange}>
        {tabs.map((tab, index) => {
          return <BdmsTab data-cy={tab.hash + "-tab"} label={tab.label} key={index} />;
        })}
      </BdmsTabs>
      <BdmsTabContentBox flex="1 0 0" sx={{ overflow: "auto" }}>
        {activeIndex === 0 && (
          <>
            <BoreholeGeneralSegment
              size={size}
              borehole={borehole}
              updateChange={updateChange}
              updateNumber={updateNumber}
              isEditable={isEditable}
            />
            <BoreholeDetailSegment
              size={size}
              borehole={borehole}
              updateChange={updateChange}
              updateNumber={updateNumber}
              isEditable={isEditable}
            />
          </>
        )}
        {activeIndex === 1 && <Sections isEditable={isEditable} boreholeId={boreholeId} />}
        {activeIndex === 2 && (
          <Geometry isEditable={isEditable} boreholeId={boreholeId} measuredDepth={borehole?.data?.total_depth} />
        )}
      </BdmsTabContentBox>
    </>
  );
};

export default BoreholePanel;
