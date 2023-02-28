import React, { useState, useEffect } from "react";
import { Stack, Typography, CircularProgress, Box } from "@mui/material";
import LayerCard from "./layerCard";
import LayerGap from "./layerGap";
import { useTranslation } from "react-i18next";
import ChronostratigraphyLayers from "./chronostratigraphyLayers";
import LithologyLayers from "./lithologyLayers";
import { useChronostratigraphies } from "../../../../../../../api/fetchApiV2";

const getHeader = t => {
  return [
    { title: t("eon"), isVisible: true },
    { title: t("era"), isVisible: true },
    { title: t("period"), isVisible: true },
    { title: t("epoch"), isVisible: true },
    { title: t("subepoch"), isVisible: true },
    { title: t("age"), isVisible: true },
    { title: t("subage"), isVisible: true },
  ];
};

const ChronostratigraphyPanel = ({ selectedStratigraphyID, isEditable }) => {
  const { data: chronostratigraphyQueryData } = useChronostratigraphies(
    selectedStratigraphyID,
  );
  const { t } = useTranslation();

  const [header, setHeader] = useState(getHeader(t));
  const [navigationState, setNavigationState] = useState(null);

  useEffect(() => {
    return setHeader(getHeader(t));
  }, [t]);

  const layerDisplayStack = [];
  const layers = chronostratigraphyQueryData || [];
  layers
    .sort((a, b) => a.fromDepth - b.fromDepth || a.toDepth - b.toDepth)
    .forEach((layer, index) => {
      const previousLayerToDepth = index === 0 ? 0 : layers[index - 1]?.toDepth;
      const nextLayerFromDepth =
        index === layers.length - 1
          ? Number.MAX_VALUE
          : layers[index + 1]?.fromDepth;

      if (layer.fromDepth > previousLayerToDepth) {
        layerDisplayStack.push(
          <LayerGap
            key={-index}
            previousLayer={layers[index - 1]}
            nextLayer={layers[index]}
            isEditable={isEditable}
          />,
        );
      }
      layerDisplayStack.push(
        <LayerCard
          key={layer.id}
          layer={layer}
          minFromDepth={previousLayerToDepth}
          maxToDepth={nextLayerFromDepth}
          header={header}
          isEditable={isEditable}
        />,
      );
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
          onNavigationChanged={setNavigationState}
        />
      </Box>

      <ChronostratigraphyLayers
        sx={{ flex: "1" }}
        selectedStratigraphyID={selectedStratigraphyID}
        isEditable={isEditable}
        navigationState={navigationState}
      />
    </Stack>
  );
};

export default ChronostratigraphyPanel;
