import React, { useState } from "react";
import { Stack, Typography, CircularProgress, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import ChronostratigraphyLayers from "./chronostratigraphyLayers";
import LithologyLayers from "./lithologyLayers";
import { useChronostratigraphies } from "../../../../../../../api/fetchApiV2";

const ChronostratigraphyPanel = ({ selectedStratigraphyID, isEditable }) => {
  const { data: chronostratigraphyQueryData } = useChronostratigraphies(
    selectedStratigraphyID,
  );
  const { t } = useTranslation();

  const [navigationState, setNavigationState] = useState({
    minimapCursor: "grab",
    scale: 1,
    // Distance from top in px
    top: 0,
    // pixel / meter
    pxm: 0,
    // height of this component in pixels
    height: 0,
  });

  if (!chronostratigraphyQueryData) {
    return <CircularProgress />;
  }

  return (
    <Stack direction="row" sx={{ flex: "1" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: "0 1 12em",
        }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: "0 0 9em",
          }}>
          <Typography>{t("lithology")}</Typography>
        </Box>
        <LithologyLayers
          stratigraphyId={selectedStratigraphyID}
          isEditable={isEditable}
          navigationState={navigationState}
          setNavigationState={setNavigationState}
        />
      </Box>

      <ChronostratigraphyLayers
        sx={{ flex: "1" }}
        selectedStratigraphyID={selectedStratigraphyID}
        isEditable={isEditable}
        navigationState={navigationState}
        setNavigationState={setNavigationState}
      />
    </Stack>
  );
};

export default ChronostratigraphyPanel;
