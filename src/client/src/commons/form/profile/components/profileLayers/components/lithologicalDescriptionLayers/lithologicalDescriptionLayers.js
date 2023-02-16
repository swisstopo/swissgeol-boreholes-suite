import React, { useState, useEffect, createRef, useRef } from "react";
import { Box, Stack, Typography } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import {
  updateLithologicalDescription,
  deleteLithologicalDescription,
} from "../../../../../../../api/fetchApiV2";
import produce from "immer";
import { useMutation, useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import LithologicalDescriptionInput from "./lithologicalDescriptionInput";
import LithologicalDescriptionDisplay from "./lithologicalDescriptionDisplay";
import LithologicalDescriptionDeleteDialog from "./lithologicalDescriptionDeleteDialog";
import ActionButtons from "./actionButtons";
import { useTheme } from "@mui/material/styles";

const LithologicalDescriptionLayers = props => {
  const {
    isEditable,
    lithologicalDescriptions,
    setSelectedDescription,
    selectedDescription,
    layers,
    addMutation,
    selectedStratigraphyID,
    deleteParams,
  } = props;
  const [fromDepth, setFromDepth] = useState(null);
  const [toDepth, setToDepth] = useState(null);
  const [description, setDescription] = useState(null);
  const [qtDescriptionId, setQtDescriptionId] = useState(null);
  const [displayDescriptions, setDisplayDescriptions] = useState(null);
  const [descriptionIdSelectedForDelete, setDescriptionIdSelectedForDelete] =
    useState(0);

  const { t } = useTranslation();
  const theme = useTheme();

  // react-query mutations and queries
  const queryClient = useQueryClient();

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

  const descriptionRefs = Array(displayDescriptions?.length)
    .fill(null)
    .map(() => createRef(null));

  // store previous length of list
  const prevLengthRef = useRef(0);

  const lastDescriptionRef = descriptionRefs[displayDescriptions?.length - 1];

  useEffect(() => {
    // scroll to the last item in the list
    if (
      lastDescriptionRef?.current &&
      displayDescriptions?.length > prevLengthRef.current
    ) {
      lastDescriptionRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // update the previous length
    prevLengthRef.current = displayDescriptions?.length;
  }, [displayDescriptions, lastDescriptionRef]);

  const selectableFromDepths = layers?.data?.map(l => l.depth_from);
  const selectableToDepths = layers?.data?.map(l => l.depth_to);

  useEffect(() => {
    // include empty items in description column to signal missing descriptions
    const tempDescriptions = [];
    lithologicalDescriptions
      .sort((a, b) => a.fromDepth - b.fromDepth)
      .forEach((lithologicalDescription, index) => {
        const expectedFromDepth =
          index === 0 ? 0 : lithologicalDescriptions[index - 1]?.toDepth;
        if (lithologicalDescription.fromDepth !== expectedFromDepth) {
          tempDescriptions.push({
            id: null,
            fromDepth: expectedFromDepth,
            toDepth: lithologicalDescription.fromDepth,
            description: (
              <Stack
                direction="row"
                alignItems="center"
                gap={1}
                sx={{ color: theme.palette.error.main }}>
                <Typography sx={{ fontWeight: "bold" }}>
                  {t("errorGap")}
                </Typography>
                <WarningIcon />
              </Stack>
            ),
            qtDescription: null,
          });
        }
        tempDescriptions.push(lithologicalDescription);
      });
    setDisplayDescriptions(tempDescriptions);
  }, [lithologicalDescriptions, layers, t, theme]);

  // updates lithological description if layer is deleted
  useEffect(() => {
    if (deleteParams && lithologicalDescriptions.length) {
      const { resolvingAction, layer } = deleteParams;
      // delete description if the layer was deleted with extention
      if (resolvingAction !== 0) {
        deleteMutation.mutate(
          lithologicalDescriptions?.find(
            d => d.fromDepth === layer.fromDepth && d.toDepth === layer.toDepth,
          ).id,
        );
      }
      // case: extend upper layer to bottom
      if (resolvingAction == 1) {
        const upperDescription = lithologicalDescriptions?.find(
          d => d.toDepth === layer.fromDepth,
        );
        updateMutation.mutate({
          ...upperDescription,
          toDepth: layer.toDepth,
        });
      }
      // case: extend lower layer to top
      if (resolvingAction == 2) {
        const lowerDerscription = lithologicalDescriptions?.find(
          d => d.fromDepth === layer.toDepth,
        );
        updateMutation.mutate({
          ...lowerDerscription,
          fromDepth: layer.fromDepth,
        });
      }
    }
  }, [deleteParams]);

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
          ?.sort((a, b) => a.fromDepth - b.fromDepth)
          .map((item, index) => (
            <Stack
              direction="row"
              data-cy={`lithological-description-${index}`}
              sx={{
                boxShadow: "inset -1px 0 0 lightgrey, inset 0 -1px 0 lightgrey",
                flex: "1 1 100%",
                height:
                  selectedDescription?.id === item.id
                    ? "16em"
                    : calculateLayerWidth(item?.fromDepth, item?.toDepth),
                overflowY: "auto",
                padding: "5px",
                backgroundColor:
                  item.id === null || item.id === descriptionIdSelectedForDelete
                    ? theme.palette.error.background
                    : selectedDescription?.id === item?.id && "lightgrey",
                "&:hover": {
                  backgroundColor: "#ebebeb",
                },
              }}
              key={index}
              ref={descriptionRefs[index]}
              onClick={() => {
                if (isEditable && selectedDescription?.id !== item?.id)
                  changeSelectionAndSubmit(item);
              }}
              isFirst={index === 0 ? true : false}>
              {descriptionIdSelectedForDelete !== item.id && (
                <>
                  {selectedDescription?.id !== item?.id && (
                    <LithologicalDescriptionDisplay item={item} />
                  )}
                  {selectedDescription?.id === item?.id && (
                    <LithologicalDescriptionInput
                      setFromDepth={setFromDepth}
                      setDescription={setDescription}
                      setToDepth={setToDepth}
                      setQtDescriptionId={setQtDescriptionId}
                      selectableFromDepths={selectableFromDepths}
                      selectableToDepths={selectableToDepths}
                      lithologicalDescriptions={lithologicalDescriptions}
                      item={item}
                    />
                  )}
                  {isEditable && (
                    <ActionButtons
                      item={item}
                      changeSelectionAndSubmit={changeSelectionAndSubmit}
                      setDescriptionIdSelectedForDelete={
                        setDescriptionIdSelectedForDelete
                      }
                      addMutation={addMutation}
                      selectedDescription={selectedDescription}
                      selectedStratigraphyID={selectedStratigraphyID}
                    />
                  )}
                </>
              )}
              {descriptionIdSelectedForDelete === item.id && (
                <LithologicalDescriptionDeleteDialog
                  item={item}
                  setDescriptionIdSelectedForDelete={
                    setDescriptionIdSelectedForDelete
                  }
                  deleteMutation={deleteMutation}
                />
              )}
            </Stack>
          ))}
    </Box>
  );
};
export default LithologicalDescriptionLayers;
