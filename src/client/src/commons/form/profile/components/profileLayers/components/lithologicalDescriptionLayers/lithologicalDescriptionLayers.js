import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Input,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import WarningIcon from "@mui/icons-material/Warning";
import {
  updateLithologicalDescription,
  useDomains,
  deleteLithologicalDescription,
} from "../../../../../../../api/fetchApiV2";
import produce from "immer";
import { useMutation, useQueryClient } from "react-query";
import { withTranslation } from "react-i18next";

const LithologicalDescriptionLayers = props => {
  const {
    isEditable,
    lithologicalDescriptions,
    setSelectedDescription,
    selectedDescription,
    layers,
    addMutation,
    selectedStratigraphyID,
    t,
  } = props;
  const [fromDepth, setFromDepth] = useState(null);
  const [toDepth, setToDepth] = useState(null);
  const [description, setDescription] = useState(null);
  const [qtDescriptionId, setQtDescriptionId] = useState(null);
  const [displayDescriptions, setDisplayDescriptions] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(0);

  // React-query mutations and queries.
  const queryClient = useQueryClient();
  const domains = useDomains();

  const deleteMutation = useMutation(
    async id => {
      const result = await deleteLithologicalDescription(id);
      return result;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["lithoDesc"] });
      },
    },
  );

  const updateMutation = useMutation(
    async params => {
      const result = await updateLithologicalDescription(params);
      return result;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["lithoDesc"] });
      },
    },
  );

  const selectableFromDepths = layers?.data?.map(l => l.depth_from);
  const selectableToDepths = layers?.data?.map(l => l.depth_to);

  useEffect(() => {
    // Include empty items in description column to signal missing descriptions.
    const tempDescriptions = [];
    lithologicalDescriptions
      .sort((a, b) => a.fromDepth - b.fromDepth)
      .forEach((d, index) => {
        if (
          index !== 0 &&
          d.fromDepth !== lithologicalDescriptions[index - 1].toDepth
        ) {
          tempDescriptions.push({
            id: null,
            fromDepth: lithologicalDescriptions[index - 1].toDepth,
            toDepth: d.fromDepth,
            description: (
              <Stack
                direction="row"
                alignItems="center"
                gap={1}
                sx={{ color: "#9f3a38" }}>
                <Typography sx={{ fontWeight: "bold" }}>
                  {t("errorGap")}
                </Typography>
                <WarningIcon />
              </Stack>
            ),

            qtDescription: null,
          });
        }
        tempDescriptions.push(d);
      });
    setDisplayDescriptions(tempDescriptions);
  }, [lithologicalDescriptions, layers, t]);

  useEffect(() => {
    if (isEditable && layers?.data?.length > 0) {
      // Update depth for lithological descriptions if layer depths change.
      const selectableFromDepths = layers?.data?.map(l => l.depth_from);
      const selectableToDepths = layers?.data?.map(l => l.depth_to);

      lithologicalDescriptions.forEach(d => {
        // case if layer was deleted.
        if (
          !selectableFromDepths?.includes(d.fromDepth) &&
          !selectableToDepths?.includes(d.toDepth)
        ) {
          deleteMutation.mutate(d.id);
        }

        // case if fromDepth of layer changed.
        if (!selectableFromDepths?.includes(d.fromDepth)) {
          let closest = selectableFromDepths?.sort(
            (a, b) => Math.abs(d.fromDepth - a) - Math.abs(d.fromDepth - b),
          )[0];
          // case if layer is deleted with expansion.
          if (d.toDepth === closest) {
            deleteMutation.mutate(d.id);
          } else {
            updateMutation.mutate({
              ...d,
              fromDepth: closest,
            });
          }
        }
        // case if toDepth of layer changed.
        if (!selectableToDepths?.includes(d.toDepth)) {
          let closest = selectableToDepths?.sort(
            (a, b) => Math.abs(d.toDepth - a) - Math.abs(d.toDepth - b),
          )[0];
          // case if layer is deleted with expansion.
          if (d.fromDepth === closest) {
            deleteMutation.mutate(d.id);
          } else {
            updateMutation.mutate({
              ...d,
              toDepth: closest,
            });
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layers, isEditable]);

  const changeSelectionAndSubmit = item => {
    if (selectedDescription) {
      submit({
        fromDepth: fromDepth,
        toDepth: toDepth,
        description: description,
        qtDescriptionId: qtDescriptionId,
      });
    }
    if (item) {
      setFromDepth(item.fromDepth);
      setToDepth(item.toDepth);
      setDescription(item.description);
      setQtDescriptionId(item.qtDescriptionId);
    }
    setSelectedDescription(item);
  };

  const submit = formData => {
    const updatedDescription = produce(selectedDescription, draft => {
      draft.fromDepth = parseFloat(formData.fromDepth);
      draft.toDepth = parseFloat(formData.toDepth);
      draft.description = formData.description;
      draft.qtDescriptionId = parseInt(formData.qtDescriptionId);
    });
    updateMutation.mutate(updatedDescription);
  };

  const calculateLayerWidth = (fromDepth, toDepth) => {
    if (selectableFromDepths && selectableToDepths) {
      const completeDepths = selectableToDepths
        .concat(
          selectableFromDepths.filter(
            item => selectableToDepths.indexOf(item) < 0,
          ),
        )
        .sort((a, b) => a - b);
      const layerDistance =
        (completeDepths.indexOf(toDepth) - completeDepths.indexOf(fromDepth)) *
        10;
      if (layerDistance < 10) return "10em";
      return layerDistance + "em";
    } else {
      return "10em";
    }
  };

  return (
    <Box>
      {displayDescriptions &&
        displayDescriptions
          ?.sort((a, b) => a.fromDepth - b - fromDepth)
          .map((item, index) => (
            <Stack
              direction="row"
              data-cy={`lithological-description-${index}`}
              sx={{
                borderTop: index === 0 ? "1px solid lightgrey" : "0px",
                borderLeft: "1px solid lightgrey",
                boxShadow: "inset -1px 0 0 lightgrey, inset 0 -1px 0 lightgrey",
                flex: "1 1 100%",
                height:
                  selectedDescription?.id === item.id
                    ? "16em"
                    : calculateLayerWidth(item?.fromDepth, item?.toDepth),
                width: "30em",
                overflowY: "auto",
                padding: "5px",
                backgroundColor:
                  item.id === null || item.id === showDeleteDialog
                    ? "#fff6f6"
                    : selectedDescription?.id === item?.id && "lightgrey",
                "&:hover": {
                  backgroundColor: "#ebebeb",
                },
              }}
              key={index}
              isFirst={index === 0 ? true : false}>
              {showDeleteDialog !== item.id && (
                <>
                  {selectedDescription !== item && (
                    <Stack direction="column" justifyContent="space-between">
                      <Typography variant="subtitle1">
                        {item.fromDepth} m
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          overflow: "auto",
                          display: "-webkit-box",
                          WebkitLineClamp: "2",
                          WebkitBoxOrient: "vertical",
                        }}>
                        {item.description}
                      </Typography>
                      {item.id !== null && (
                        <Typography variant="subtitle2">
                          {t("qt_description")}: {item.qtDescription?.en ?? "-"}
                        </Typography>
                      )}
                      <Typography variant="subtitle1">
                        {item.toDepth} m
                      </Typography>
                    </Stack>
                  )}
                  {selectedDescription?.id === item?.id && (
                    <Stack direction="column" sx={{ width: "100%" }}>
                      <FormControl
                        variant="standard"
                        sx={{ minWidth: 120 }}
                        size="small">
                        <InputLabel htmlFor="from-depth">
                          {t("layer_depth_from")}
                        </InputLabel>
                        <Select
                          data-cy="from-depth-select"
                          defaultValue={fromDepth}
                          input={<Input id="from-depth" />}
                          onChange={e => {
                            e.stopPropagation();
                            setFromDepth(e.target.value);
                          }}>
                          <MenuItem value="">
                            <em>{t("reset")}</em>
                          </MenuItem>
                          {selectableFromDepths.map(d => (
                            <MenuItem value={d}>{d}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        data-cy="decription-textfield"
                        label={t("description")}
                        multiline
                        rows={3}
                        placeholder={t("description")}
                        hiddenLabel
                        value={description}
                        onChange={e => {
                          setDescription(e.target.value);
                        }}
                        variant="standard"
                        type="text"
                        size="small"
                        sx={{ overflow: "auto" }}
                      />
                      <FormControl
                        variant="standard"
                        sx={{ minWidth: 120 }}
                        size="small">
                        <InputLabel htmlFor="qt-description">
                          {t("qt_description")}
                        </InputLabel>
                        <Select
                          data-cy="qt-decription-select"
                          defaultValue={qtDescriptionId}
                          input={<Input id="qt-description" />}
                          onChange={e => {
                            e.stopPropagation();
                            setQtDescriptionId(e.target.value);
                          }}>
                          <MenuItem value="">
                            <em>{t("reset")}</em>
                          </MenuItem>
                          {domains?.data
                            ?.filter(d => d.schema === "qt_description")
                            .map(d => (
                              <MenuItem value={d.id}>{d.en}</MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                      <FormControl
                        variant="standard"
                        sx={{ minWidth: 120 }}
                        size="small">
                        <InputLabel htmlFor="to-depth">
                          {t("layer_depth_to")}
                        </InputLabel>
                        <Select
                          data-cy="to-depth-select"
                          defaultValue={toDepth}
                          input={<Input id="to-depth" />}
                          onChange={e => {
                            e.stopPropagation();
                            setToDepth(e.target.value);
                          }}>
                          <MenuItem value="">
                            <em>{t("reset")}</em>
                          </MenuItem>
                          {selectableToDepths
                            ?.filter(d => d > fromDepth)
                            .map(d => (
                              <MenuItem value={d}>{d}</MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  )}
                  {isEditable && (
                    <Stack
                      direction="row"
                      sx={{ marginLeft: "auto", padding: "3px" }}>
                      {selectedDescription?.id !== item?.id &&
                      item.id !== null ? (
                        <>
                          <Tooltip title={t("edit")}>
                            <ModeEditIcon
                              onClick={() => changeSelectionAndSubmit(item)}
                            />
                          </Tooltip>
                          <Tooltip title={t("delete")}>
                            <DeleteIcon
                              sx={{ color: "red", opacity: 0.7 }}
                              onClick={() => {
                                setShowDeleteDialog(item.id);
                              }}
                            />
                          </Tooltip>
                        </>
                      ) : (
                        item.id === null && (
                          <Tooltip title={t("add")}>
                            <AddCircleIcon
                              style={{ color: "#9f3a38" }}
                              onClick={() => {
                                addMutation.mutate({
                                  stratigraphyId: selectedStratigraphyID,
                                  fromDepth: item.fromDepth,
                                  toDepth: item.toDepth,
                                });
                              }}
                            />
                          </Tooltip>
                        )
                      )}
                      {selectedDescription?.id === item?.id && (
                        <Tooltip title={t("stop-editing")}>
                          <ClearIcon
                            onClick={() => changeSelectionAndSubmit(null)}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                  )}
                </>
              )}
              {showDeleteDialog === item.id && (
                <Stack
                  alignItems="flex-start"
                  sx={{ width: "100%", color: "#9f3a38" }}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <WarningIcon />
                    <Typography sx={{ fontWeight: "bold" }}>
                      {t("errorAttention")}
                    </Typography>{" "}
                  </Stack>
                  <Typography sx={{ color: "#9f3a38" }} variant="subtitle2">
                    {t("deletelayerconfirmation")}
                  </Typography>
                  <Box alignSelf="flex-end" sx={{ marginTop: "auto" }}>
                    <Button
                      variant="cancel"
                      size="small"
                      startIcon={<ClearIcon />}
                      onClick={() => setShowDeleteDialog(null)}>
                      {t("cancel")}
                    </Button>
                    <Button
                      variant="delete"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        deleteMutation.mutate(item.id);
                      }}>
                      {t("confirm")}
                    </Button>
                  </Box>
                </Stack>
              )}
            </Stack>
          ))}
    </Box>
  );
};
export default withTranslation()(LithologicalDescriptionLayers);
