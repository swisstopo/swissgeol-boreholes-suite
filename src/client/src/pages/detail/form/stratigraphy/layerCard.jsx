import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClickAwayListener } from "@mui/base";
import { Close, Delete, Edit } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Card,
  CardActionArea,
  CircularProgress,
  IconButton,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import { formatNumberForDisplay, parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.js";
import { NumericFormatWithThousandSeparator } from "../../../../components/form/numericFormatWithThousandSeparator.js";
import { DetailContext } from "../../detailContext.tsx";

const State = Object.freeze({
  EDITING: Symbol("Editing"),
  EDITABLE: Symbol("Editable"), // borehole editing session started but not yet editing this layer
  DELETED: Symbol("Deleted"),
  DISPLAY: Symbol("Display"),
});

const LayerCard = ({
  updateLayer,
  deleteLayer,
  dataProperty, // string that specifies the property of the layer object that contains the data
  layer, // {id, fromDepth, toDepth, [dataProperty]}: the layer object to display
  minFromDepth, // number: minimal allowed fromDepth
  maxToDepth, // number: maximal allowed toDepth
  header, // Array<{title, isVisible}>: header object with titles and visibility
  options, // options array for every level of the hierarchy
  height, // height of the layerCard in pixels
}) => {
  const { t } = useTranslation();

  const [fromDepthErrorMessage, setFromDepthErrorMessage] = useState("");
  const [toDepthErrorMessage, setToDepthErrorMessage] = useState("");
  const [fromDepth, setFromDepth] = useState(null);
  const [toDepth, setToDepth] = useState(null);
  const [selection, setSelection] = useState(null);
  const [cardState, setCardState] = useState(null);
  const { editingEnabled } = useContext(DetailContext);

  const minPixelHeightForDepthLabels = 65;

  useEffect(() => {
    setCardState(prevState => {
      // do not resurrect deleted layers
      if (prevState === State.DELETED) {
        return prevState;
      } else {
        return editingEnabled ? State.EDITABLE : State.DISPLAY;
      }
    });
  }, [editingEnabled]);

  // create selection array from the path of the selected codelist
  // one element for each header
  useEffect(() => {
    if (layer && options) {
      let selectedOption;
      search: for (const optionsAtLevel of options) {
        for (const option of optionsAtLevel) {
          if (option.id === layer[dataProperty]) {
            selectedOption = option;
            break search;
          }
        }
      }

      const selections = selectedOption?.path?.map((id, index) => options[index].find(c => c.id === id) ?? {}) ?? [];

      // set color of empty path elements to the closest defined parent
      let currentColor = selections[0]?.color ?? null;
      for (let i = 1; i < selections.length; i++) {
        const selection = selections[i];
        if (selection.color) {
          currentColor = selection.color;
        } else {
          selection.color = currentColor;
        }
      }

      // make selection array the same length as header array
      setSelection(
        selections.slice(0, header.length).concat(Array(Math.max(0, header.length - selections.length)).fill(null)),
      );
    }
  }, [dataProperty, header.length, layer, options]);

  const handleFromDepth = useCallback(
    newFromDepth => {
      setFromDepth(newFromDepth);
      const errors = [];
      if (newFromDepth === "" || isNaN(newFromDepth)) {
        errors.push(t("errorInvalidEntry"));
      } else {
        if (newFromDepth < minFromDepth) {
          errors.push(t("errorFromDepthTooLow"));
        }
        if (newFromDepth >= layer.toDepth) {
          errors.push(t("errorFromDepthGreaterThanToDepth"));
        }
      }
      setFromDepthErrorMessage(errors.join(", "));
      if (errors.length === 0 && layer.fromDepth !== +newFromDepth) {
        updateLayer({
          ...layer,
          fromDepth: newFromDepth,
        });
      }
    },

    [layer, minFromDepth, updateLayer, t],
  );

  const handleToDepth = useCallback(
    newToDepth => {
      setToDepth(newToDepth);
      const errors = [];
      if (newToDepth === "" || isNaN(newToDepth)) {
        console.log("hey invalid");
        console.log(newToDepth);
        errors.push(t("errorInvalidEntry"));
      } else {
        if (newToDepth > maxToDepth) {
          errors.push(t("errorToDepthTooHigh"));
        }
        if (newToDepth <= layer.fromDepth) {
          errors.push(t("errorFromDepthGreaterThanToDepth"));
        }
      }
      setToDepthErrorMessage(errors.join(", "));
      if (errors.length === 0 && layer.toDepth !== +newToDepth) {
        updateLayer({
          ...layer,
          toDepth: newToDepth,
        });
      }
    },
    [layer, maxToDepth, updateLayer, t],
  );

  const handleLayerChange = (newValue, index) => {
    if (!newValue) {
      // layer at index was deleted, search defined parent value
      let i = index - 1;
      while (i >= 0 && !selection[i]?.id) {
        i--;
      }
      newValue = selection[i] ?? null;
    }

    updateLayer({
      ...layer,
      [dataProperty]: newValue?.id ?? null,
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
          label={t("fromdepth")}
          defaultValue={fromDepth ?? layer.fromDepth}
          InputProps={{
            inputComponent: NumericFormatWithThousandSeparator,
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
          label={t("todepth")}
          defaultValue={toDepth ?? layer.toDepth}
          InputProps={{
            inputComponent: NumericFormatWithThousandSeparator,
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
        gridTemplateColumns: `repeat(${header.reduce((acc, h) => acc + h.isVisible, 0)},minmax(0,1fr))`,
        justifyItems: "stretch",
        alignItems: "stretch",
        borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
        borderTop: "1px solid rgba(0, 0, 0, 0.12)",
        minHeight: State.EDITING === cardState ? "14rem" : "0",
        height: height + "px",
        position: "relative",
        overflowY: "hidden",
      }}>
      {selection.map(
        (selectedItem, index) =>
          header[index].isVisible && (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: selectedItem?.color ? `rgb(${selectedItem?.color?.join()})` : "transparent",
                borderRight: "1px solid rgba(0, 0, 0, 0.12)",
                padding: "0 1rem",
              }}>
              {[State.DISPLAY, State.EDITABLE].includes(cardState) && (
                <Typography sx={{ textAlign: "center" }}>{selectedItem?.label ?? "-"}</Typography>
              )}
              {State.EDITING === cardState && (
                <Autocomplete
                  sx={{ flex: "1" }}
                  size="small"
                  options={options[index] ?? []}
                  value={selectedItem?.label ? selectedItem : null}
                  renderInput={params => <TextField {...params} label={t(header[index].title)} />}
                  onChange={(event, value) => handleLayerChange(value, index)}
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

export default LayerCard;
