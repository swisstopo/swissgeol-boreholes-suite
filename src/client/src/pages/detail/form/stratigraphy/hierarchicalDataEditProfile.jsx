import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AddCircle, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { useCodelistSchema } from "../../../../components/codelist.ts";
import { DetailContext } from "../../detailContext.tsx";
import LayerCard from "./layerCard.jsx";
import LayerGap from "./layerGap.jsx";
import NavigationChild from "./navigationChild.jsx";

/**
 * Component for editing hierarchical layer data.
 */
const HierarchicalDataEditProfile = ({
  layerData: layers, // array of layers
  addLayer, // function that adds a layer
  deleteLayer, // function that deletes a layer
  updateLayer, // function that updates a layer
  headerLabels, // array of translation keys
  codelistSchemaName, // string that specifies the codelist schema to use
  dataProperty, // string that specifies the property of the layer object that contains the data
  titel, // The titel, displayed in the header
  selectedStratigraphyID,
  sx,
  navState,
  setNavState,
}) => {
  const { t, i18n } = useTranslation();

  const [id] = useState(Math.random().toString(36).substring(2, 10));
  const [options, setOptions] = useState(null);
  const [header, setHeader] = useState(headerLabels.map(h => ({ title: h, isVisible: true })));
  const { editingEnabled } = useContext(DetailContext);

  const { data: schemaData } = useCodelistSchema(codelistSchemaName);

  // create options array from codelist schema
  // The options are the same for all layers
  useEffect(() => {
    if (schemaData) {
      setOptions(
        [...schemaData]
          .sort((a, b) => a.order - b.order)
          .reduce((accu, d) => {
            const path = d.path.split(".").map(id => +id);
            const level = path.length - 1;
            (accu[level] = accu[level] || []).push({
              label: d[i18n.language],
              id: d.id,
              color: JSON.parse(d.conf ?? null)?.color,
              path: path,
            });
            return accu;
          }, []),
      );
    }
  }, [i18n.language, schemaData]);

  useEffect(() => {
    setNavState(prev => prev.setContentHeightFromLayers(id, layers));
  }, [id, layers, setNavState]);

  const layerDisplayStack = [];
  if (layers) {
    layers.forEach((layer, index) => {
      const previousLayerToDepth = index === 0 ? 0 : layers[index - 1]?.toDepth;
      const nextLayerFromDepth = index === layers.length - 1 ? Number.MAX_VALUE : layers[index + 1]?.fromDepth;

      if (layer.fromDepth > previousLayerToDepth) {
        layerDisplayStack.push(
          <LayerGap
            addLayer={addLayer}
            updateLayer={updateLayer}
            key={-index}
            previousLayer={layers[index - 1]}
            nextLayer={layers[index]}
            height={(layers[index].fromDepth - previousLayerToDepth) * navState.pixelPerMeter}
          />,
        );
      }
      layerDisplayStack.push(
        <LayerCard
          updateLayer={updateLayer}
          deleteLayer={deleteLayer}
          dataProperty={dataProperty}
          options={options}
          key={layer.id}
          layer={layer}
          minFromDepth={previousLayerToDepth}
          maxToDepth={nextLayerFromDepth}
          header={header}
          height={(layer.toDepth - layer.fromDepth) * navState.pixelPerMeter}
        />,
      );
    });
  }

  const headerElement = (
    <Box>
      <Stack direction="row" sx={{ alignItems: "center", padding: "1em" }}>
        <Typography>{titel}</Typography>
        {editingEnabled && (
          <IconButton
            aria-label={t("add")}
            onClick={() => {
              const newFromDepth = layers.at(-1)?.toDepth ?? 0;
              const newToDepth = newFromDepth + 10; // new layer is created with a depth of 10m
              addLayer({
                stratigraphyId: selectedStratigraphyID,
                fromDepth: newFromDepth,
                toDepth: newToDepth,
              });

              // adjust navigation state to make new layer visible
              setNavState(prevState => prevState.setLensStart(Math.max(0, newToDepth - navState.lensSize)));
            }}
            data-cy="add-layer-button">
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
                  header.map((h, headerIndex) => (index === headerIndex ? { ...h, isVisible: !h.isVisible } : h)),
                );
              }}
              data-cy={`column-visibility-${index}`}>
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
    <NavigationChild sx={{ ...sx }} navState={navState} setNavState={setNavState} header={headerElement}>
      {layers ? layerDisplayStack : <LinearProgress />}
    </NavigationChild>
  );
};

export default HierarchicalDataEditProfile;
