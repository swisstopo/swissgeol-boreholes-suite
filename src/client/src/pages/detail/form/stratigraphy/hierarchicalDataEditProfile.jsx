import { useContext, useEffect, useId, useMemo, useState } from "react";
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
import { EditStateContext } from "../../editStateContext.tsx";
import LayerCard from "./layerCard.jsx";
import LayerGap from "./layerGap.jsx";
import { NavigationChild } from "./navigation/NavigationChild.tsx";

const headerStackSx = { alignItems: "center", padding: "1em" };
const flexSpacerSx = { flex: "1" };
const visibilityButtonSx = { paddingLeft: "1em" };
const headerTableSx = { tableLayout: "fixed" };
const headerCellSx = {
  textAlign: "center",
  borderTop: "none",
  borderLeft: "solid 1px rgba(0, 0, 0, 0.12)",
  borderRight: "solid 1px rgba(0, 0, 0, 0.12)",
  borderBottom: "solid 1px rgba(0, 0, 0, 0.12)",
};

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

  const id = useId();
  const [options, setOptions] = useState(null);
  const [header, setHeader] = useState(headerLabels.map(h => ({ title: h, isVisible: true })));
  const { editingEnabled } = useContext(EditStateContext);

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

  const pixelPerMeter = navState.pixelPerMeter;
  const layerDisplayStack = useMemo(() => {
    const stack = [];
    if (!layers) return stack;
    layers.forEach((layer, index) => {
      const previousLayerToDepth = index === 0 ? 0 : layers[index - 1]?.toDepth;
      const nextLayerFromDepth = index === layers.length - 1 ? Number.MAX_VALUE : layers[index + 1]?.fromDepth;

      if (layer.fromDepth > previousLayerToDepth) {
        stack.push(
          <LayerGap
            addLayer={addLayer}
            updateLayer={updateLayer}
            key={-index}
            previousLayer={layers[index - 1]}
            nextLayer={layers[index]}
            height={(layers[index].fromDepth - previousLayerToDepth) * pixelPerMeter}
          />,
        );
      }
      stack.push(
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
          height={(layer.toDepth - layer.fromDepth) * pixelPerMeter}
        />,
      );
    });
    return stack;
  }, [layers, pixelPerMeter, addLayer, updateLayer, deleteLayer, dataProperty, options, header]);

  const lensSize = navState.lensSize;
  const headerElement = useMemo(() => (
    <Box>
      <Stack direction="row" sx={headerStackSx}>
        <Typography>{titel}</Typography>
        {editingEnabled && (
          <IconButton
            aria-label={t("add")}
            onClick={() => {
              const newFromDepth = layers?.at(-1)?.toDepth ?? 0;
              const newToDepth = newFromDepth + 10; // new layer is created with a depth of 10m
              addLayer({
                stratigraphyId: selectedStratigraphyID,
                fromDepth: newFromDepth,
                toDepth: newToDepth,
              });

              // adjust navigation state to make new layer visible
              setNavState(prevState => prevState.setLensStart(Math.max(0, newToDepth - lensSize)));
            }}
            data-cy="add-layer-button">
            <AddCircle />
          </IconButton>
        )}
        <Box sx={flexSpacerSx} />
        <ButtonGroup size="small">
          {header.map((h, index) => (
            <Button
              key={index}
              color="inherit"
              variant="text"
              startIcon={h.isVisible ? <Visibility /> : <VisibilityOff />}
              sx={visibilityButtonSx}
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
      <Table sx={headerTableSx}>
        <TableBody>
          <TableRow>
            {header.map(
              (h, index) =>
                h.isVisible && (
                  <TableCell key={index} sx={headerCellSx}>
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
  ), [titel, editingEnabled, t, header, addLayer, selectedStratigraphyID, layers, lensSize, setNavState]);

  return (
    <NavigationChild sx={sx} navState={navState} setNavState={setNavState} header={headerElement}>
      {layers ? layerDisplayStack : <LinearProgress />}
    </NavigationChild>
  );
};

export default HierarchicalDataEditProfile;
