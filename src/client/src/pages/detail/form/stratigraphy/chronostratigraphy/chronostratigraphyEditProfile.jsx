import { useTranslation } from "react-i18next";
import { useChronostratigraphies, useChronostratigraphyMutations } from "../../../../../api/stratigraphy.ts";
import HierarchicalDataEditProfile from "../hierarchicalDataEditProfile.jsx";

/**
 * Manages the chronostratigraphy data and mutations.
 */
const ChronostratigraphyEditProfile = ({ selectedStratigraphyID, sx, navState, setNavState }) => {
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
      codelistSchemaName="chronostratigraphy"
      dataProperty="chronostratigraphyId"
      titel={t("chronostratigraphy")}
      selectedStratigraphyID={selectedStratigraphyID}
      sx={{ ...sx }}
      navState={navState}
      setNavState={setNavState}
    />
  );
};

export default ChronostratigraphyEditProfile;
