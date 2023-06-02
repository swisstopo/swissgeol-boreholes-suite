import React, { useEffect, useState, useCallback } from "react";
import {
  CardActionArea,
  Stack,
  Typography,
  Box,
  Card,
  IconButton,
  TextField,
  InputAdornment,
  Skeleton,
  TableCell,
  Table,
  Tooltip,
  TableRow,
  CircularProgress,
  Autocomplete,
  TableBody,
} from "@mui/material";
import { Close, Delete, Edit } from "@mui/icons-material";
import { ClickAwayListener } from "@mui/base";
import { useTranslation } from "react-i18next";

const State = Object.freeze({
  EDITING: Symbol("Editing"),
  EDITABLE: Symbol("Editable"), // borehole editing session started but not yet editing this layer
  DELETED: Symbol("Deleted"),
  DISPLAY: Symbol("Display"),
});

const LayerCard = ({
  mutations: {
    update: { mutate: updateLayer },
    delete: { mutate: deleteLayer },
  },
  dataProperty, // string that specifies the property of the layer object that contains the data
  layer, // {id, fromDepth, toDepth, [dataProperty]}: the layer object to display
  minFromDepth, // number: minimal allowed fromDepth
  maxToDepth, // number: maximal allowed toDepth
  header, // Array<{title, isVisible}>: header object with titles and visibility
  options, // options array for every level of the hierarchy
  isEditable, // boolean: specifies if values can be edited
  height, // height of the layerCard in pixels
}) => {
  const { t } = useTranslation();

  const [fromDepthErrorMessage, setFromDepthErrorMessage] = useState("");
  const [toDepthErrorMessage, setToDepthErrorMessage] = useState("");
  const [fromDepth, setFromDepth] = useState(null);
  const [toDepth, setToDepth] = useState(null);
  const [selection, setSelection] = useState(null);
  const [cardState, setCardState] = useState(null);

  const minPixelHeightForDepthLabels = 65;

  useEffect(() => {
    setCardState(prevState => {
      // do not resurrect deleted layers
      if (prevState === State.DELETED) {
        return prevState;
      } else {
        return isEditable ? State.EDITABLE : State.DISPLAY;
      }
    });
  }, [isEditable]);

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

      const selections =
        selectedOption?.path?.map(
          (id, index) => options[index].find(c => c.id === id) ?? {},
        ) ?? [];

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
        selections
          .slice(0, header.length)
          .concat(Array(header.length - selections.length).fill(null)),
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
    <Stack
      direction="row"
      sx={{ padding: "0.2em 1em", alignItems: "flex-start", flex: "0 1 0%" }}>
      {[State.DISPLAY, State.EDITABLE].includes(cardState) &&
        height >= minPixelHeightForDepthLabels && (
          <Typography>{layer?.fromDepth ?? "-"} m</Typography>
        )}
      {State.EDITING === cardState && (
        <TextField
          sx={{ margin: "0.8em 0" }}
          label={t("fromdepth")}
          defaultValue={fromDepth ?? layer.fromDepth}
          error={!!fromDepthErrorMessage}
          helperText={fromDepthErrorMessage}
          onBlur={e => handleFromDepth(e.target.value)}
          InputProps={{
            endAdornment: <InputAdornment position="end">m</InputAdornment>,
          }}
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
    </Stack>
  );

  const contentPart = (
    <Table sx={{ tableLayout: "fixed", flex: "1" }}>
      <TableBody>
        <TableRow>
          {selection.map(
            (selectedItem, index) =>
              header[index].isVisible && (
                <TableCell
                  key={index}
                  sx={{
                    paddingTop: "0",
                    paddingBottom: "0",
                    backgroundColor: selectedItem?.color
                      ? `rgb(${selectedItem?.color?.join()})`
                      : "transparent",
                    borderBottom: "none",
                    borderLeft:
                      index === 0 ? "none" : "solid 1px rgba(0, 0, 0, 0.12)",
                  }}>
                  {[State.DISPLAY, State.EDITABLE].includes(cardState) && (
                    <Tooltip title={selectedItem?.label}>
                      <Typography sx={{ textAlign: "center" }}>
                        {selectedItem?.label ?? "-"}
                      </Typography>
                    </Tooltip>
                  )}
                  {State.EDITING === cardState && (
                    <Autocomplete
                      size="small"
                      options={options[index] ?? []}
                      value={selectedItem?.label ? selectedItem : null}
                      renderInput={params => (
                        <TextField {...params} label={t(header[index].title)} />
                      )}
                      onChange={(event, value) =>
                        handleLayerChange(value, index)
                      }
                    />
                  )}
                </TableCell>
              ),
          )}
        </TableRow>
      </TableBody>
    </Table>
  );

  const footerBar = (
    <Stack
      direction="row"
      sx={{ padding: "0.2em 1em", alignItems: "flex-end", flex: "0 1 0%" }}>
      {[State.DISPLAY, State.EDITABLE].includes(cardState) &&
        height >= minPixelHeightForDepthLabels && (
          <Typography>{layer?.toDepth ?? "-"} m</Typography>
        )}
      {State.EDITING === cardState && (
        <TextField
          sx={{ margin: "0.8em 0" }}
          label={t("todepth")}
          defaultValue={toDepth ?? layer.toDepth}
          error={!!toDepthErrorMessage}
          helperText={toDepthErrorMessage}
          onBlur={e => handleToDepth(e.target.value)}
          InputProps={{
            endAdornment: <InputAdornment position="end">m</InputAdornment>,
          }}
          size="small"
        />
      )}
    </Stack>
  );

  const cardContent = (
    <Box
      data-cy="layer-card"
      sx={{ flex: "1", display: "flex", position: "relative" }}>
      <Box sx={{ position: "absolute", top: "0", left: "0", right: "0" }}>
        {headerBar}
      </Box>
      {contentPart}
      <Box sx={{ position: "absolute", bottom: "0", left: "0", right: "0" }}>
        {footerBar}
      </Box>
    </Box>
  );

  return (
    <>
      {State.DISPLAY === cardState && (
        <Card
          square
          variant="outlined"
          sx={{ height: `${height}px`, display: "flex" }}>
          {cardContent}
        </Card>
      )}
      {State.EDITABLE === cardState && (
        <Card
          square
          variant="outlined"
          sx={{ height: `${height}px`, display: "flex" }}>
          <CardActionArea
            sx={{ display: "flex", flexDirection: "column" }}
            onClick={() => setCardState(State.EDITING)}
            component="div">
            {cardContent}
          </CardActionArea>
        </Card>
      )}
      {State.EDITING === cardState && (
        <ClickAwayListener onClickAway={() => setCardState(State.EDITABLE)}>
          <Card
            square
            variant="outlined"
            onWheel={e => e.stopPropagation()}
            sx={{ height: `${height}px`, display: "flex", overflow: "auto" }}>
            <Box sx={{ minHeight: "14em", flex: "1", display: "flex" }}>
              {cardContent}
            </Box>
          </Card>
        </ClickAwayListener>
      )}
      {State.DELETED === cardState && (
        <Skeleton variant="rectangular" height={`${height}px`} />
      )}
    </>
  );
};

export default LayerCard;
