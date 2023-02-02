import React, { useCallback, useEffect, useState, useRef } from "react";
import * as Styled from "./styles";
import TranslationText from "../../../translationText";
import ProfileLayersValidation from "./components/profileLayersValidation";
import LithologicalDescriptionLayers from "./components/lithologicalDescriptionLayers/lithologicalDescriptionLayers";
import { createLayerApi, getData } from "./api";
import { Stack, Tooltip, Typography } from "@mui/material";
import {
  addLithologicalDescription,
  useLithoDescription,
} from "../../../../../api/fetchApiV2";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { withTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "react-query";

const ProfileLayers = props => {
  const {
    isEditable,
    selectedStratigraphyID,
    selectedLayer,
    setSelectedLayer,
    reloadLayer,
    onUpdated,
  } = props.data;
  const { t } = props;
  const [layers, setLayers] = useState(null);
  const [selectedLithologicalDescription, setSelectedLithologicalDescription] =
    useState(null);
  const [showDelete, setShowDelete] = useState();

  const mounted = useRef(false);

  // React-query mutations and queries.
  const queryClient = useQueryClient();
  const lithoDescQuery = useLithoDescription(selectedStratigraphyID);

  const addMutation = useMutation(
    async params => {
      const result = await addLithologicalDescription(params);
      return result;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["lithoDesc"] });
      },
    },
  );

  const setData = useCallback(stratigraphyID => {
    // Todo: use get layers from new api.
    getData(stratigraphyID).then(res => {
      if (mounted.current) {
        setLayers(res);
      }
    });
  }, []);

  useEffect(() => {
    mounted.current = true;

    if (selectedStratigraphyID && mounted.current) {
      setData(selectedStratigraphyID);
    } else {
      setLayers(null);
    }
    return () => {
      mounted.current = false;
    };
  }, [selectedStratigraphyID, reloadLayer, setData]);

  const createNewLayer = () => {
    createLayerApi(selectedStratigraphyID).then(res => {
      if (res) {
        onUpdated("newLayer");
      }
    });
  };

  const setSelectedLayerFunc = item => {
    if (item === selectedLayer) {
      // unselect if layer is clicked again
      setSelectedLayer(null);
    } else {
      setSelectedLayer(item);
      setSelectedLithologicalDescription(null);
    }
  };

  const addLithologicalDesc = () => {
    if (
      lithoDescQuery?.data[lithoDescQuery?.data.length - 1]?.toDepth === null
    ) {
      alert(t("first_add_layer_to_depth"));
      return;
    }

    setSelectedLithologicalDescription(null);
    layers?.data?.length !== 0
      ? addMutation.mutate({
          stratigraphyId: selectedStratigraphyID,
          fromDepth: lithoDescQuery?.data.at(-1)?.toDepth ?? 0,
        })
      : alert(t("first_add_lithology"));
  };

  return (
    <Styled.Container>
      <Stack direction="row" sx={{ overflow: "auto" }}>
        <Stack direction="column" sx={{ minWidth: "20em" }}>
          <Stack
            direction="row"
            sx={{ marginBottom: 1, marginRight: 0.5, marginLeft: 0.5 }}>
            <Typography>{t("lithology")}</Typography>
            {isEditable && selectedStratigraphyID !== null && (
              <Tooltip title={t("add")}>
                <AddCircleIcon
                  sx={{ marginLeft: 1.5 }}
                  data-cy="add-layer-icon"
                  onClick={createNewLayer}
                />
              </Tooltip>
            )}
          </Stack>
          {layers !== null && layers?.data?.length !== 0 && (
            <ProfileLayersValidation
              data={{
                layers,
                isEditable,
                onUpdated,
                selectedLayer,
                showDelete,
                setShowDelete,
                selectedStratigraphyID,
                setSelectedLayer: setSelectedLayerFunc,
              }}
            />
          )}
        </Stack>
        {selectedLayer === null && (
          <Stack direction="column">
            <Stack
              direction="row"
              sx={{
                marginBottom: 1,
                marginRight: 0.5,
                marginLeft: 0.5,
              }}>
              <Typography>{t("lithological_description")}</Typography>
              {isEditable && selectedStratigraphyID !== null && (
                <Tooltip title={t("add")} sx={{}}>
                  <AddCircleIcon
                    sx={{ marginLeft: 1.5 }}
                    onClick={addLithologicalDesc}
                  />
                </Tooltip>
              )}
            </Stack>
            {lithoDescQuery?.data?.length > 0 && (
              <LithologicalDescriptionLayers
                isEditable={isEditable}
                lithologicalDescriptions={lithoDescQuery?.data}
                setSelectedDescription={setSelectedLithologicalDescription}
                selectedDescription={selectedLithologicalDescription}
                layers={layers}
                addMutation={addMutation}
                selectedStratigraphyID={selectedStratigraphyID}
              />
            )}
          </Stack>
        )}
      </Stack>
      {layers?.data?.length === 0 && (
        <Styled.Empty>
          <TranslationText id="nothingToShow" />
        </Styled.Empty>
      )}
    </Styled.Container>
  );
};

export default withTranslation()(ProfileLayers);
