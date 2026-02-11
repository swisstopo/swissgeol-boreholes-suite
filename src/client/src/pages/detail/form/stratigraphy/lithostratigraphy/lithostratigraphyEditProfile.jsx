import { useTranslation } from "react-i18next";
import { useLithostratigraphies, useLithostratigraphyMutations } from "../../../../../api/stratigraphy.ts";
import HierarchicalDataEditProfile from "../hierarchicalDataEditProfile.jsx";

/**
 * Manages the lithostratigraphy data and mutations.
 */
const LithostratigraphyEditProfile = ({ selectedStratigraphyID, sx, navState, setNavState }) => {
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
      codelistSchemaName="lithostratigraphy"
      dataProperty="lithostratigraphyId"
      titel={t("lithostratigraphy")}
      selectedStratigraphyID={selectedStratigraphyID}
      sx={{ ...sx }}
      navState={navState}
      setNavState={setNavState}
    />
  );
};

export default LithostratigraphyEditProfile;
