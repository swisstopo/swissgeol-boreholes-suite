import { useLithostratigraphies, useLithostratigraphyMutations } from "../../../../../../api/fetchApiV2.js";
import HierarchicalDataEditProfile from "../hierarchicalDataEditProfile.jsx";
import { useTranslation } from "react-i18next";

/**
 * Manages the lithostratigraphy data and mutations.
 */
const LithostratigraphyEditProfile = ({ selectedStratigraphyID, isEditable, sx, navState, setNavState }) => {
  const { t } = useTranslation();

  const { data: layers } = useLithostratigraphies(selectedStratigraphyID);
  const {
    add: { mutate: addLayer },
    delete: { mutate: deleteLayer },
    update: { mutate: updateLayer },
  } = useLithostratigraphyMutations();

  return (
    <HierarchicalDataEditProfile
      layerData={layers}
      addLayer={addLayer}
      deleteLayer={deleteLayer}
      updateLayer={updateLayer}
      headerLabels={["formation", "member", "bed"]}
      domainSchemaName="custom.lithostratigraphy_top_bedrock"
      dataProperty="lithostratigraphyId"
      titel={t("lithostratigraphy")}
      selectedStratigraphyID={selectedStratigraphyID}
      isEditable={isEditable}
      sx={{ ...sx }}
      navState={navState}
      setNavState={setNavState}
    />
  );
};

export default LithostratigraphyEditProfile;
