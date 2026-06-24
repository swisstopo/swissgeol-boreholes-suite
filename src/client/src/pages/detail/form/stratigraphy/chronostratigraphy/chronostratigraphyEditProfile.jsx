import { useTranslation } from "react-i18next";
import HierarchicalDataEditProfile from "../hierarchicalDataEditProfile.jsx";
import { useChronostratigraphies, useChronostratigraphyMutations } from "../stratigraphy.ts";

const chronostratigraphyHeaderLabels = ["eon", "era", "period", "epoch", "subepoch", "age", "subage"];

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
      headerLabels={chronostratigraphyHeaderLabels}
      codelistSchemaName="chronostratigraphy"
      dataProperty="chronostratigraphyId"
      titel={t("chronostratigraphy")}
      selectedStratigraphyID={selectedStratigraphyID}
      sx={sx}
      navState={navState}
      setNavState={setNavState}
    />
  );
};

export default ChronostratigraphyEditProfile;
