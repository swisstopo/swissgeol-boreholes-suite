import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  LinearProgress,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  IconButton,
  ButtonGroup,
} from "@mui/material";
import LayerCard from "./layerCard";
import LayerGap from "./layerGap";
import {
  useChronostratigraphies,
  useChronostratigraphyMutations,
} from "../../../../api/fetchApiV2";
import { AddCircle, VisibilityOff, Visibility } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import NavigationChild from "./navigationChild";

const ChronostratigraphyEditProfile = ({
  selectedStratigraphyID,
  isEditable,
  sx,
  navState,
  setNavState,
}) => {
  const { data: layers } = useChronostratigraphies(selectedStratigraphyID);
  const { t } = useTranslation();
  const {
    add: { mutate: addChronostratigraphy },
  } = useChronostratigraphyMutations();

  const [header, setHeader] = useState([
    { title: "eon", isVisible: true },
    { title: "era", isVisible: true },
    { title: "period", isVisible: true },
    { title: "epoch", isVisible: true },
    { title: "subepoch", isVisible: true },
    { title: "age", isVisible: true },
    { title: "subage", isVisible: true },
  ]);

  useEffect(() => {
    setNavState(prev => prev.setContentHeightFromLayers("chrono", layers));
  }, [layers, setNavState]);

  const layerDisplayStack = [];
  if (layers) {
    layers.forEach((layer, index) => {
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
            height={
              (layers[index].fromDepth - previousLayerToDepth) *
              navState.pixelPerMeter
            }
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
          height={(layer.toDepth - layer.fromDepth) * navState.pixelPerMeter}
        />,
      );
    });
  }

  const headerElement = (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center", padding: "1em" }}>
        <Typography>{t("chronostratigraphy")}</Typography>
        {isEditable && (
          <IconButton
            aria-label={t("add")}
            onClick={() => {
              const newFromDepth = layers.at(-1)?.toDepth ?? 0;
              const newToDepth = newFromDepth + 10; // new layer is created with a depth of 10m
              addChronostratigraphy({
                stratigraphyId: selectedStratigraphyID,
                fromDepth: newFromDepth,
                toDepth: newToDepth,
              });

              // adjust navigation state to make new layer visible
              setNavState(prevState =>
                prevState.setLensStart(
                  Math.max(0, newToDepth - navState.lensSize),
                ),
              );
            }}
            data-cy="add-chrono-button">
            <AddCircle />
          </IconButton>
        )}
        <Box sx={{ flex: "1" }} />
        <ButtonGroup size="small">
          {header.map((h, index) => (
            <Button
              key={index}
              color="inherit"
              variant="text"
              startIcon={h.isVisible ? <Visibility /> : <VisibilityOff />}
              sx={{ paddingLeft: "1em" }}
              onClick={() => {
                setHeader(
                  header.map((h, headerIndex) =>
                    index === headerIndex
                      ? { ...h, isVisible: !h.isVisible }
                      : h,
                  ),
                );
              }}
              data-cy={`chrono-visibility-${index}`}>
              <Typography noWrap>{t(h.title)}</Typography>
            </Button>
          ))}
        </ButtonGroup>
      </Stack>
      <Table sx={{ tableLayout: "fixed" }}>
        <TableBody>
          <TableRow>
            {header.map(
              (h, index) =>
                h.isVisible && (
                  <TableCell
                    key={index}
                    sx={{
                      textAlign: "center",
                      borderTop: "none",
                      borderLeft: "solid 1px rgba(0, 0, 0, 0.12)",
                      borderRight: "solid 1px rgba(0, 0, 0, 0.12)",
                      borderBottom: "solid 1px rgba(0, 0, 0, 0.12)",
                    }}>
                    <Typography noWrap variant="subtitle1">
                      {t(h.title)}
                    </Typography>
                  </TableCell>
                ),
            )}
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  );

  return (
    <NavigationChild
      sx={{ ...sx }}
      navState={navState}
      setNavState={setNavState}
      header={headerElement}>
      {layers ? layerDisplayStack : <LinearProgress />}
    </NavigationChild>
  );
};

export default ChronostratigraphyEditProfile;
