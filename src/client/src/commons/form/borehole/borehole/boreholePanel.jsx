import BoreholeGeneralSegment from "../segments/boreholeGeneralSegment";
import BoreholeDetailSegment from "../segments/boreholeDetailSegment";
import { useTranslation } from "react-i18next";

const BoreholePanel = ({ size, borehole, updateChange, updateNumber, isEditable }) => {
  const { t } = useTranslation();

  return (
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
  );
};

export default BoreholePanel;
