import { useChronostratigraphies, useChronostratigraphyMutations } from "../../../../../api/fetchApiV2.js";
import HierarchicalDataEditProfile from "../hierarchicalDataEditProfile.jsx";
import { useTranslation } from "react-i18next";

/**
 * Manages the chronostratigraphy data and mutations.
 */
const ChronostratigraphyEditProfile = ({ selectedStratigraphyID, isEditable, sx, navState, setNavState }) => {
  const { t } = useTranslation();

  const { data: layers } = useChronostratigraphies(selectedStratigraphyID);
  const {
    add: { mutate: addLayer },
    delete: { mutate: deleteLayer },
    update: { mutate: updateLayer },
  } = useChronostratigraphyMutations();

  return (
    <HierarchicalDataEditProfile
      layerData={layers}
      addLayer={addLayer}
      deleteLayer={deleteLayer}
      updateLayer={updateLayer}
      headerLabels={["eon", "era", "period", "epoch", "subepoch", "age", "subage"]}
      domainSchemaName="custom.chronostratigraphy_top_bedrock"
      dataProperty="chronostratigraphyId"
      titel={t("chronostratigraphy")}
      selectedStratigraphyID={selectedStratigraphyID}
      isEditable={isEditable}
      sx={{ ...sx }}
      navState={navState}
      setNavState={setNavState}
    />
  );
};

export default ChronostratigraphyEditProfile;
