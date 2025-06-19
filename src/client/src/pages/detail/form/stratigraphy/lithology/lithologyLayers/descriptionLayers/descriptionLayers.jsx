import { createRef, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import WarningIcon from "@mui/icons-material/Warning";
import { Box, Stack, Typography } from "@mui/material";
import { produce } from "immer";
import { theme } from "../../../../../../../AppTheme.ts";
import ActionButtons from "./actionButtons.jsx";
import DescriptionDeleteDialog from "./descriptionDeleteDialog.jsx";
import DescriptionDisplay from "./descriptionDisplay.jsx";
import DescriptionInput from "./descriptionInput.jsx";

const DescriptionLayers = props => {
  const {
    isEditable,
    descriptions,
    setSelectedDescription,
    selectedDescription,
    layers,
    addMutation,
    updateMutation,
    deleteMutation,
    selectedStratigraphyID,
    deleteParams,
  } = props;
  const [fromDepth, setFromDepth] = useState(null);
  const [toDepth, setToDepth] = useState(null);
  const [description, setDescription] = useState(null);
  const [descriptionQualityId, setDescriptionQualityId] = useState(null);
  const [displayDescriptions, setDisplayDescriptions] = useState(null);
  const [descriptionIdSelectedForDelete, setDescriptionIdSelectedForDelete] = useState(0);
  const [selectableDepths, setSelectableDepths] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [previousLength, setPreviousLength] = useState(0);

  const { t } = useTranslation();

  const descriptionRefs = useMemo(
    () =>
      Array(displayDescriptions?.length)
        .fill(null)
        .map(() => createRef(null)),
    [displayDescriptions],
  );

  useEffect(() => {
    const lastDescriptionRef = descriptionRefs[displayDescriptions?.length - 1];
    // scroll to the last item in the list
    if (
      (lastDescriptionRef?.current && previousLength === 0) ||
      (displayDescriptions?.length > previousLength &&
        // prevents scrolling when existing layer depths is changed so that an undefined interval is produced while editing.
        !selectedDescription)
    ) {
      lastDescriptionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    // update the previous length
    if (displayDescriptions !== null) {
      setPreviousLength(displayDescriptions?.length || 0);
    }
  }, [displayDescriptions, selectedDescription, descriptionRefs, previousLength]);

  useEffect(() => {
    // include empty items in description column to signal missing descriptions
    const tempDescriptions = [];
    if (!descriptions || !layers?.data) return;
    descriptions
      ?.sort((a, b) => a.fromDepth - b.fromDepth)
      .forEach((description, index) => {
        const expectedFromDepth = index === 0 ? 0 : descriptions?.[index - 1]?.toDepth;
        if (description.fromDepth !== expectedFromDepth) {
          tempDescriptions.push({
            id: null,
            fromDepth: expectedFromDepth,
            toDepth: description.fromDepth,
            description: (
              <Stack direction="row" alignItems="center" gap={1} sx={{ color: theme.palette.error.main }}>
                <Typography sx={{ fontWeight: "bold" }}>{t("errorGap")}</Typography>
                <WarningIcon />
              </Stack>
            ),
            descriptionQuality: null,
          });
        }
        tempDescriptions.push(description);
      });
    setDisplayDescriptions(tempDescriptions);
  }, [descriptions, layers, t]);

  // updates description if layer is deleted
  useEffect(() => {
    if (deleteParams && descriptions?.length) {
      const { resolvingAction, layer } = deleteParams;
      // delete description if the layer was deleted with extension
      if (resolvingAction !== 0) {
        deleteMutation.mutate(
          descriptions?.find(d => d.fromDepth === layer.fromDepth && d.toDepth === layer.toDepth)?.id,
        );
      }
      // case: extend upper layer to bottom
      if (resolvingAction === 1) {
        const upperDescription = descriptions?.find(d => d.toDepth === layer.fromDepth);
        updateMutation.mutate({
          ...upperDescription,
          toDepth: layer.toDepth,
        });
      }
      // case: extend lower layer to top
      if (resolvingAction === 2) {
        const lowerDerscription = descriptions?.find(d => d.fromDepth === layer.toDepth);
        updateMutation.mutate({
          ...lowerDerscription,
          fromDepth: layer.fromDepth,
        });
      }
    }
    // eslint-disable-next-line
  }, [deleteParams]);

  useEffect(() => {
    if (selectedDescription) {
      const updatedDescription = produce(selectedDescription, draft => {
        draft.fromDepth = parseFloat(fromDepth);
        draft.toDepth = parseFloat(toDepth);
        draft.description = description;
        draft.descriptionQualityId = parseInt(descriptionQualityId);
      });
      updateMutation.mutate(updatedDescription);
    }
    // eslint-disable-next-line
  }, [description, descriptionQualityId, toDepth, fromDepth]);

  const selectItem = item => {
    if (item) {
      setFromDepth(item.fromDepth);
      setToDepth(item.toDepth);
      setDescription(item.description);
      setDescriptionQualityId(item.descriptionQualityId);
    }
    setSelectedDescription(item);
  };

  // calculate selectable depths and gaps
  useEffect(() => {
    const selectableFromDepths = layers?.data?.map(l => l.depth_from);
    const selectableToDepths = layers?.data?.map(l => l.depth_to);
    if (selectableFromDepths && selectableToDepths) {
      const selectableDepths = selectableToDepths
        .concat(selectableFromDepths.filter(item => selectableToDepths.indexOf(item) < 0))
        .sort((a, b) => a - b);

      const missingFromDepths = displayDescriptions
        ?.map(d => d.fromDepth)
        .filter(d => !selectableFromDepths.includes(d));
      const missingToDepths = displayDescriptions?.map(d => d.toDepth).filter(d => !selectableToDepths.includes(d));

      const missingDepths = missingFromDepths?.filter(d => missingToDepths.includes(d));

      const gaps = [];
      for (let i = 0; i < selectableDepths.length; i++) {
        const gap = missingDepths?.filter(d => d > selectableDepths[i] && d < selectableDepths[i + 1]);
        gaps.push(gap);
      }

      setGaps(gaps);
      // Include 0 depths as option, if first lithology layer is missing.
      if (!selectableDepths.includes(0)) selectableDepths.unshift(0);
      setSelectableDepths(selectableDepths);
    }
  }, [layers?.data, displayDescriptions]);

  const calculateLayerHeight = (fromDepth, toDepth) => {
    // case height must be reduced because of gaps in lithology.
    if (!selectableDepths.includes(fromDepth) || (!selectableDepths.includes(toDepth) && gaps?.length)) {
      const gapLength = gaps.find(g => g?.includes(fromDepth) || g?.includes(toDepth))?.length;

      if (gapLength) {
        return 10 / (gapLength + 1);
      } else {
        return 10;
      }
    }
    // case height must be enhanced because descriptions stretching several lithology layers.

    const layerDistance = (selectableDepths.indexOf(toDepth) - selectableDepths.indexOf(fromDepth)) * 10;

    if (layerDistance < 10) return 10;
    return layerDistance;
  };

  return (
    <Box sx={{ boxShadow: 4 }}>
      {displayDescriptions &&
        displayDescriptions
          ?.sort((a, b) => a.fromDepth - b.fromDepth)
          .map((item, index) => {
            const calculatedHeight = calculateLayerHeight(item?.fromDepth, item?.toDepth);
            const isItemSelected = selectedDescription?.id === item?.id;
            const isItemToDelete = item.id === descriptionIdSelectedForDelete;
            return (
              <Stack
                direction="row"
                data-cy={`description-${index}`}
                sx={{
                  boxShadow: 5,
                  flex: "1 1 100%",
                  height: isItemSelected ? "auto" : calculatedHeight + "em",
                  overflowY: "auto",
                  padding: "5px",
                  backgroundColor:
                    item.id === null || isItemToDelete ? theme.palette.error.background : isItemSelected && "lightgrey",
                  "&:hover": {
                    backgroundColor: theme.palette.background.lightgrey,
                  },
                }}
                key={index}
                ref={descriptionRefs[index]}
                onClick={() => {
                  if (isEditable && !isItemSelected) selectItem(item);
                }}>
                {!isItemToDelete && (
                  <>
                    {!isItemSelected && <DescriptionDisplay item={item} layerHeight={calculatedHeight} />}
                    {isItemSelected && (
                      <DescriptionInput
                        setFromDepth={setFromDepth}
                        description={description}
                        descriptionQualityId={descriptionQualityId}
                        fromDepth={fromDepth}
                        toDepth={toDepth}
                        setDescription={setDescription}
                        setToDepth={setToDepth}
                        setDescriptionQualityId={setDescriptionQualityId}
                        selectableDepths={selectableDepths}
                        descriptions={descriptions}
                        item={item}
                        updateMutation={updateMutation}
                        selectItem={selectItem}
                      />
                    )}
                    {isEditable && (
                      <ActionButtons
                        item={item}
                        selectItem={selectItem}
                        setDescriptionIdSelectedForDelete={setDescriptionIdSelectedForDelete}
                        addMutation={addMutation}
                        selectedDescription={selectedDescription}
                        selectedStratigraphyID={selectedStratigraphyID}
                      />
                    )}
                  </>
                )}
                {isItemToDelete && (
                  <DescriptionDeleteDialog
                    item={item}
                    setDescriptionIdSelectedForDelete={setDescriptionIdSelectedForDelete}
                    deleteMutation={deleteMutation}
                  />
                )}
              </Stack>
            );
          })}
    </Box>
  );
};
export default DescriptionLayers;
