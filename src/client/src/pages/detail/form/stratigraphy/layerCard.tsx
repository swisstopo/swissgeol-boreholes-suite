import { ElementType, FC, memo, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Close, Delete, Edit } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Card,
  CardActionArea,
  CircularProgress,
  ClickAwayListener,
  IconButton,
  InputBaseComponentProps,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import { theme } from "../../../../AppTheme.ts";
import { formatNumberForDisplay, parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.ts";
import { NumericFormatWithThousandSeparator } from "../../../../components/form/numericFormatWithThousandSeparator.tsx";
import { EditStateContext } from "../../editStateContext.tsx";
import { CodelistOption, HeaderColumn, HierarchicalLayer } from "./hierarchicalDataEditProfile.tsx";

const State = Object.freeze({
  EDITING: Symbol("Editing"),
  EDITABLE: Symbol("Editable"), // borehole editing session started but not yet editing this layer
  DELETED: Symbol("Deleted"),
  DISPLAY: Symbol("Display"),
});

// A selected hierarchy level. Empty when the path names an unknown codelist, null past the end of the path.
type Selection = Partial<CodelistOption> | null;

const isCodelistOption = (selection: Selection): selection is CodelistOption => !!selection?.label;

// The layer's codelist id is stored under a property whose name depends on the hierarchy (dataProperty).
const getLayerValue = (layer: HierarchicalLayer, dataProperty: string): unknown =>
  (layer as unknown as Record<string, unknown>)[dataProperty];

interface LayerCardProps {
  updateLayer: (layer: HierarchicalLayer) => void;
  deleteLayer: (id: number) => void;
  dataProperty: string; // string that specifies the property of the layer object that contains the data
  layer: HierarchicalLayer; // the layer object to display
  minFromDepth: number; // minimal allowed fromDepth
  maxToDepth: number; // maximal allowed toDepth
  header: HeaderColumn[]; // header object with titles and visibility
  options: CodelistOption[][] | null; // options array for every level of the hierarchy
  height: number; // height of the layerCard in pixels
}

const LayerCard: FC<LayerCardProps> = ({
  updateLayer,
  deleteLayer,
  dataProperty,
  layer,
  minFromDepth,
  maxToDepth,
  header,
  options,
  height,
}) => {
  const { t } = useTranslation();

  const [fromDepthErrorMessage, setFromDepthErrorMessage] = useState("");
  const [toDepthErrorMessage, setToDepthErrorMessage] = useState("");
  const [fromDepth, setFromDepth] = useState<number | null>(null);
  const [toDepth, setToDepth] = useState<number | null>(null);
  const { editingEnabled } = useContext(EditStateContext);
  const defaultCardState = editingEnabled ? State.EDITABLE : State.DISPLAY;
  const [cardState, setCardState] = useState<symbol>(defaultCardState);
  const [syncedEditingEnabled, setSyncedEditingEnabled] = useState(editingEnabled);

  if (editingEnabled !== syncedEditingEnabled) {
    setSyncedEditingEnabled(editingEnabled);
    // do not resurrect deleted layers
    setCardState(prevState => (prevState === State.DELETED ? prevState : defaultCardState));
  }

  // Show the from/to depth labels only once the cell is tall enough that the center label and the
  // two depth labels do not overlap. Below the center-label threshold, even the center text hides
  // so very thin cells become pure colored bands.
  const minPixelHeightForDepthLabels = 120;
  const minPixelHeightForCenterLabel = 24;
  const showCenterLabel = height >= minPixelHeightForCenterLabel;

  // create selection array from the path of the selected codelist
  // one element for each header
  const selection = useMemo<Selection[] | null>(() => {
    if (layer && options) {
      let selectedOption: CodelistOption | undefined;
      search: for (const optionsAtLevel of options) {
        for (const option of optionsAtLevel) {
          if (option.id === getLayerValue(layer, dataProperty)) {
            selectedOption = option;
            break search;
          }
        }
      }

      const selections: Partial<CodelistOption>[] =
        selectedOption?.path?.map((id, index) => options[index].find(c => c.id === id) ?? {}) ?? [];

      // set color of empty path elements to the closest defined parent
      let currentColor = selections[0]?.color ?? null;
      const coloredSelections = selections.map((selection, index) => {
        if (index === 0 || selection.color) {
          currentColor = selection.color ?? currentColor;
          return selection;
        }
        return { ...selection, color: currentColor ?? undefined };
      });

      // make selection array the same length as header array
      return [
        ...coloredSelections.slice(0, header.length),
        ...Array.from({ length: Math.max(0, header.length - selections.length) }, () => null),
      ];
    }
    return null;
  }, [dataProperty, header.length, layer, options]);

  const handleFromDepth = useCallback(
    (newFromDepth: number | null) => {
      setFromDepth(newFromDepth);
      const errors = [];
      if (newFromDepth === null || Number.isNaN(newFromDepth)) {
        errors.push(t("errorInvalidEntry"));
      } else {
        if (newFromDepth < minFromDepth) {
          errors.push(t("errorFromDepthTooLow"));
        }
        if (newFromDepth >= (layer.toDepth ?? 0)) {
          errors.push(t("errorFromDepthGreaterThanToDepth"));
        }
      }
      setFromDepthErrorMessage(errors.join(", "));
      if (errors.length === 0 && layer.fromDepth !== newFromDepth) {
        updateLayer({
          ...layer,
          fromDepth: newFromDepth,
        });
      }
    },

    [layer, minFromDepth, updateLayer, t],
  );

  const handleToDepth = useCallback(
    (newToDepth: number | null) => {
      setToDepth(newToDepth);
      const errors = [];
      if (newToDepth === null || Number.isNaN(newToDepth)) {
        errors.push(t("errorInvalidEntry"));
      } else {
        if (newToDepth > maxToDepth) {
          errors.push(t("errorToDepthTooHigh"));
        }
        if (newToDepth <= (layer.fromDepth ?? 0)) {
          errors.push(t("errorFromDepthGreaterThanToDepth"));
        }
      }
      setToDepthErrorMessage(errors.join(", "));
      if (errors.length === 0 && layer.toDepth !== newToDepth) {
        updateLayer({
          ...layer,
          toDepth: newToDepth,
        });
      }
    },
    [layer, maxToDepth, updateLayer, t],
  );

  const handleLayerChange = (newValue: CodelistOption | null, index: number) => {
    let value: Selection = newValue;
    if (!value) {
      // layer at index was deleted, search defined parent value
      let i = index - 1;
      while (i >= 0 && !selection?.[i]?.id) {
        i--;
      }
      value = selection?.[i] ?? null;
    }

    updateLayer({
      ...layer,
      [dataProperty]: value?.id ?? null,
    });
  };

  if (!layer || !options || !selection) {
    return (
      <Card
        square
        variant="outlined"
        sx={{
          height: "10em",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
        <CircularProgress />
      </Card>
    );
  }

  const headerBar = (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        padding: "0.2rem 1rem",
        pt: 2,
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
      }}>
      {[State.DISPLAY, State.EDITABLE].includes(cardState) && height >= minPixelHeightForDepthLabels && (
        <Typography>{formatNumberForDisplay(layer?.fromDepth) ?? "-"} m MD</Typography>
      )}
      {State.EDITING === cardState && (
        <TextField
          sx={{ margin: "0.8rem 0" }}
          label={t("fromDepth")}
          defaultValue={fromDepth ?? layer.fromDepth}
          slotProps={{
            input: { inputComponent: NumericFormatWithThousandSeparator as ElementType<InputBaseComponentProps> },
          }}
          error={!!fromDepthErrorMessage}
          helperText={fromDepthErrorMessage}
          onBlur={e => handleFromDepth(parseFloatWithThousandsSeparator(e.target.value))}
          size="small"
        />
      )}
      <Box sx={{ flex: "1" }} />
      {State.EDITING === cardState && (
        <IconButton
          aria-label={t("close")}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation();
            setCardState(State.EDITABLE);
          }}>
          <Close />
        </IconButton>
      )}
      {State.EDITABLE === cardState && (
        <>
          <IconButton
            aria-label={t("edit")}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation();
              setCardState(State.EDITING);
            }}>
            <Edit />
          </IconButton>
          <IconButton
            color="error"
            aria-label={t("delete")}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation();
              setCardState(State.DELETED);
              deleteLayer(layer.id);
            }}>
            <Delete />
          </IconButton>
        </>
      )}
    </Box>
  );

  const footerBar = (
    <Box
      sx={{
        padding: "0.2rem 1rem",
        position: "absolute",
        left: "0",
        bottom: "0",
      }}>
      {[State.DISPLAY, State.EDITABLE].includes(cardState) && height >= minPixelHeightForDepthLabels && (
        <Typography>{formatNumberForDisplay(layer?.toDepth) ?? "-"} m MD</Typography>
      )}
      {State.EDITING === cardState && (
        <TextField
          sx={{ margin: "0.8rem 0" }}
          label={t("toDepth")}
          defaultValue={toDepth ?? layer.toDepth}
          slotProps={{
            input: { inputComponent: NumericFormatWithThousandSeparator as ElementType<InputBaseComponentProps> },
          }}
          error={!!toDepthErrorMessage}
          helperText={toDepthErrorMessage}
          onBlur={e => handleToDepth(parseFloatWithThousandsSeparator(e.target.value))}
          size="small"
        />
      )}
    </Box>
  );

  const cardContent = (
    <Box
      data-cy="layer-card"
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${header.reduce((acc, h) => acc + Number(h.isVisible), 0)},minmax(0,1fr))`,
        justifyItems: "stretch",
        alignItems: "stretch",
        borderLeft: `1px solid ${theme.palette.border.light}`,
        borderTop: `1px solid ${theme.palette.border.light}`,
        minHeight: State.EDITING === cardState ? "14rem" : "0",
        height: height + "px",
        position: "relative",
        overflowY: "hidden",
      }}>
      {selection.map(
        (selectedItem, index) =>
          header[index]?.isVisible && (
            <Box
              key={header[index].title}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: selectedItem?.color ? `rgb(${selectedItem?.color?.join()})` : "transparent",
                borderRight: `1px solid ${theme.palette.border.light}`,
                padding: "0 1rem",
              }}>
              {[State.DISPLAY, State.EDITABLE].includes(cardState) && showCenterLabel && (
                <Typography sx={{ textAlign: "center" }}>{selectedItem?.label ?? "-"}</Typography>
              )}
              {State.EDITING === cardState && (
                <Autocomplete
                  sx={{ flex: "1" }}
                  size="small"
                  options={options[index] ?? []}
                  value={isCodelistOption(selectedItem) ? selectedItem : null}
                  renderInput={params => <TextField {...params} label={t(header[index].title)} />}
                  onChange={(_event, value) => handleLayerChange(value, index)}
                />
              )}
            </Box>
          ),
      )}
      {headerBar}
      {footerBar}
    </Box>
  );

  return (
    <>
      {State.DISPLAY === cardState && cardContent}
      {State.EDITABLE === cardState && (
        <CardActionArea onClick={() => setCardState(State.EDITING)} component="div">
          {cardContent}
        </CardActionArea>
      )}
      {State.EDITING === cardState && (
        <ClickAwayListener onClickAway={() => setCardState(State.EDITABLE)}>
          <Box
            onWheel={e => e.stopPropagation()}
            sx={{
              minHeight: "220px",
              height: height + "px",
              overflowY: "auto",
            }}>
            {cardContent}
          </Box>
        </ClickAwayListener>
      )}
      {State.DELETED === cardState && <Skeleton variant="rectangular" height={`${height}px`} />}
    </>
  );
};

export default memo(LayerCard);
