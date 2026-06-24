import { useTranslation } from "react-i18next";
import HierarchicalDataEditProfile from "../hierarchicalDataEditProfile.jsx";
import { useLithostratigraphies, useLithostratigraphyMutations } from "../stratigraphy.ts";

const lithostratigraphyHeaderLabels = ["formation", "member", "bed"];

/**
 * Manages the lithostratigraphy data and mutations.
 */
const LithostratigraphyEditProfile = ({ selectedStratigraphyID, navState, setNavState }) => {
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
      headerLabels={lithostratigraphyHeaderLabels}
      codelistSchemaName="lithostratigraphy"
      dataProperty="lithostratigraphyId"
      titel={t("lithostratigraphy")}
      selectedStratigraphyID={selectedStratigraphyID}
      navState={navState}
      setNavState={setNavState}
    />
  );
};

export default LithostratigraphyEditProfile;
