import React from "react";
import {
  useLithostratigraphies,
  useLithostratigraphyMutations,
} from "../../../../api/fetchApiV2";
import HierarchicalDataEditProfile from "./hierarchicalDataEditProfile";
import { useTranslation } from "react-i18next";

/**
 * Manages the lithostratigraphy data and mutations.
 */
const LithostratigraphyEditProfile = ({
  selectedStratigraphyID,
  isEditable,
  sx,
  navState,
  setNavState,
}) => {
  const { t } = useTranslation();

  const { data: layers } = useLithostratigraphies(selectedStratigraphyID);
  const mutations = useLithostratigraphyMutations();

  return (
    <HierarchicalDataEditProfile
      layerData={layers}
      mutations={mutations}
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
