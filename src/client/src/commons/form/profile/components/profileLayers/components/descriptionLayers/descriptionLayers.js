import React, {
  useState,
  useEffect,
  createRef,
  useRef,
  useCallback,
} from "react";
import { Box, Stack, Typography } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import produce from "immer";
import { useTranslation } from "react-i18next";
import DescriptionInput from "./descriptionInput";
import DescriptionDisplay from "./descriptionDisplay";
import DescriptionDeleteDialog from "./descriptionDeleteDialog";
import ActionButtons from "./actionButtons";
import { useTheme } from "@mui/material/styles";

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
  const [qtDescriptionId, setQtDescriptionId] = useState(null);
  const [displayDescriptions, setDisplayDescriptions] = useState(null);
  const [descriptionIdSelectedForDelete, setDescriptionIdSelectedForDelete] =
    useState(0);

  const { t } = useTranslation();
  const theme = useTheme();

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
      lastDescriptionRef.current.scrollIntoView({
        alignToTop: true,
        scrollIntoViewOptions: { block: "start", inline: "start" },
        behavior: "smooth",
      });
    }
    // update the previous length
    prevLengthRef.current = displayDescriptions?.length;
  }, [displayDescriptions, lastDescriptionRef]);

  const selectableFromDepths = layers?.data?.map(l => l.depth_from);
  const selectableToDepths = layers?.data?.map(l => l.depth_to);

  useEffect(() => {
    // include empty items in description column to signal missing descriptions
    const tempDescriptions = [];
    descriptions
      .sort((a, b) => a.fromDepth - b.fromDepth)
      .forEach((description, index) => {
        const expectedFromDepth =
          index === 0 ? 0 : descriptions[index - 1]?.toDepth;
        if (description.fromDepth !== expectedFromDepth) {
          tempDescriptions.push({
            id: null,
            fromDepth: expectedFromDepth,
            toDepth: description.fromDepth,
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
        tempDescriptions.push(description);
      });
    setDisplayDescriptions(tempDescriptions);
  }, [descriptions, layers, t, theme]);

  // updates description if layer is deleted
  useEffect(() => {
    if (deleteParams && descriptions.length) {
      const { resolvingAction, layer } = deleteParams;
      // delete description if the layer was deleted with extention
      if (resolvingAction !== 0) {
        deleteMutation.mutate(
          descriptions?.find(
            d => d.fromDepth === layer.fromDepth && d.toDepth === layer.toDepth,
          )?.id,
        );
      }
      // case: extend upper layer to bottom
      if (resolvingAction === 1) {
        const upperDescription = descriptions?.find(
          d => d.toDepth === layer.fromDepth,
        );
        updateMutation.mutate({
          ...upperDescription,
          toDepth: layer.toDepth,
        });
      }
      // case: extend lower layer to top
      if (resolvingAction === 2) {
        const lowerDerscription = descriptions?.find(
          d => d.fromDepth === layer.toDepth,
        );
        updateMutation.mutate({
          ...lowerDerscription,
          fromDepth: layer.fromDepth,
        });
      }
    }
    // eslint-disable-next-line
  }, [deleteParams]);

  const selectItem = item => {
    if (item) {
      setFromDepth(item.fromDepth);
      setToDepth(item.toDepth);
      setDescription(item.description);
      setQtDescriptionId(item.qtDescriptionId);
    }
    setSelectedDescription(item);
  };

  const submitUpdate = useCallback(() => {
    if (selectedDescription) {
      const updatedDescription = produce(selectedDescription, draft => {
        draft.fromDepth = parseFloat(fromDepth);
        draft.toDepth = parseFloat(toDepth);
        draft.description = description;
        draft.qtDescriptionId = parseInt(qtDescriptionId);
      });
      updateMutation.mutate(updatedDescription);
    }
    selectItem(null);
    // eslint-disable-next-line
  }, [description, qtDescriptionId, toDepth, fromDepth, selectedDescription]);

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
              data-cy={`description-${index}`}
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
                  selectItem(item);
              }}
              isFirst={index === 0 ? true : false}>
              {descriptionIdSelectedForDelete !== item.id && (
                <>
                  {selectedDescription?.id !== item?.id && (
                    <DescriptionDisplay item={item} />
                  )}
                  {selectedDescription?.id === item?.id && (
                    <DescriptionInput
                      setFromDepth={setFromDepth}
                      setDescription={setDescription}
                      setToDepth={setToDepth}
                      setQtDescriptionId={setQtDescriptionId}
                      selectableDepths={selectableFromDepths.concat(
                        selectableToDepths.filter(
                          d => !selectableFromDepths.includes(d),
                        ),
                      )}
                      lithologicalDescriptions={descriptions}
                      submitUpdate={submitUpdate}
                      item={item}
                    />
                  )}
                  {isEditable && (
                    <ActionButtons
                      item={item}
                      selectItem={selectItem}
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
                <DescriptionDeleteDialog
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
export default DescriptionLayers;
