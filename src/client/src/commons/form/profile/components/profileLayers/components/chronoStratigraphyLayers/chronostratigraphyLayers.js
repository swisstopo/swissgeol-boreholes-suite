import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  CircularProgress,
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
} from "../../../../../../../api/fetchApiV2";
import { AddCircle, VisibilityOff, Visibility } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

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

const ChronostratigraphyLayers = ({
  selectedStratigraphyID,
  isEditable,
  sx,
  navigationState: state,
}) => {
  const { data: chronostratigraphyQueryData } = useChronostratigraphies(
    selectedStratigraphyID,
  );
  const { t } = useTranslation();
  const {
    add: { mutate: addChronostratigraphy },
  } = useChronostratigraphyMutations();

  const [header, setHeader] = useState(getHeader(t));

  useEffect(() => {
    return setHeader(getHeader(t));
  }, [t]);

  if (!chronostratigraphyQueryData) {
    return <CircularProgress />;
  }

  const layerDisplayStack = [];
  const layers = chronostratigraphyQueryData || [];
  layers
    .sort((a, b) => a.fromDepth - b.fromDepth || a.toDepth - b.toDepth)
    .forEach((layer, index) => {
      const factor = state?.pxm / (state?.scale ?? 1);

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
            height={(layers[index].fromDepth - previousLayerToDepth) * factor}
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
          height={(layer.toDepth - layer.fromDepth) * factor}
        />,
      );
    });

  return (
    <Box sx={{ ...sx, display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: "0 0 9em" }}>
        <Stack direction="row" sx={{ alignItems: "center", padding: "1em" }}>
          <Typography>{t("chronostratigraphy")}</Typography>
          {isEditable && (
            <IconButton
              aria-label={t("add")}
              onClick={() => {
                addChronostratigraphy({
                  stratigraphyId: selectedStratigraphyID,
                  fromDepth: layers.at(-1)?.toDepth ?? 0,
                  toDepth: (layers.at(-1)?.toDepth ?? 0) + 10,
                });
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
                <Typography noWrap>{h.title}</Typography>
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
                        {h.title}
                      </Typography>
                    </TableCell>
                  ),
              )}
            </TableRow>
          </TableBody>
        </Table>
      </Box>
      <Box sx={{ overflow: "hidden", flex: "1 1 100%", position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            top: -state?.top / (state?.scale ?? 1),
          }}
          data-cy="chrono-layers">
          {layerDisplayStack}
        </Box>
      </Box>
    </Box>
  );
};

export default ChronostratigraphyLayers;
