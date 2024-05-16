import BoreholeGeneralSegment from "../segments/boreholeGeneralSegment";
import BoreholeDetailSegment from "../segments/boreholeDetailSegment";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import Sections from "./sections";
import Geometry from "./geometry";
import { BdmsTabContentBox, BdmsTabs, BdmsTab } from "../../../../components/styledTabComponents";

const BoreholePanel = ({ size, boreholeId, borehole, updateChange, updateNumber, isEditable }) => {
  const { t } = useTranslation();

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
      <BdmsTabs value={activeIndex} onChange={(event, newValue) => setActiveIndex(newValue)}>
        <BdmsTab label={t("general")} data-cy={"general-tab"} />
        <BdmsTab label={t("sections")} data-cy={"sections-tab"} />
        <BdmsTab label={t("boreholeGeometry")} data-cy={"geometry-tab"} />
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
        {activeIndex === 2 && <Geometry isEditable={isEditable} boreholeId={boreholeId} />}
      </BdmsTabContentBox>
    </>
  );
};

export default BoreholePanel;
