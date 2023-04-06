import React, { useEffect, useState, useMemo, createRef } from "react";
import ProfileLayersError from "../profileLayersError";
import ProfileLayersList from "../profileLayersList";
import * as Styled from "./styles";
import { Box } from "@mui/material";

export const ProfileLayersValidation = props => {
  const {
    layers,
    layersWithValidation,
    isEditable,
    onUpdated,
    selectedLayer,
    showDelete,
    setShowDelete,
    selectedStratigraphyID,
    setSelectedLayer,
    isStratigraphy,
  } = props.data;
  const { setDeleteParams } = props;
  const [previousLength, setPreviousLength] = useState(0);

  // add refs to layers to allow scroll behaviour
  const layerRefs = useMemo(
    () =>
      Array(layersWithValidation?.data?.length)
        .fill(null)
        .map(() => createRef(null)),
    [layersWithValidation?.data?.length],
  );

  useEffect(() => {
    const layerLength = layersWithValidation?.data?.length;
    const lastLayerRef = layerRefs[layerLength - 1];
    // scroll to the last item in the list
    if (
      (lastLayerRef?.current && previousLength === 0) ||
      (layerLength > previousLength && !selectedLayer)
    ) {
      lastLayerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    // update the previous length
    setPreviousLength(layerLength || 0);
  }, [
    layerRefs,
    layersWithValidation?.data?.length,
    previousLength,
    selectedLayer,
  ]);

  return (
    <Box data-cy="styled-layer-container">
      {/* validation before all layers */}
      {layersWithValidation?.validation &&
        layersWithValidation?.validation?.missingLayers && (
          <div style={{ flex: "1 1 0px" }}>
            <ProfileLayersError
              data={{
                title: "missingLayers",
                isEditable,
                id: layersWithValidation?.data?.[0].id,
                isInside: false,
                onUpdated: onUpdated,
              }}
              setDeleteParams={setDeleteParams}
            />
          </div>
        )}
      {/* layers list */}
      {layersWithValidation?.data &&
        layersWithValidation?.data.map((item, index) => (
          <Styled.Layer
            key={item.id}
            ref={layerRefs[index]}
            data-cy={"styled-layer-" + index}
            isFirst={index === 0 ? true : false}>
            {/* validation before each layer */}
            {item.validation &&
              Object.keys(item.validation)
                .filter(
                  key =>
                    key !== "missingTo" &&
                    key !== "missingFrom" &&
                    key !== "invertedDepth" &&
                    key !== "bottomOverlap" &&
                    key !== "bottomDisjoint" &&
                    key !== "bedrockLitPetWrong" &&
                    key !== "bedrockLitStratiWrong" &&
                    key !== "bedrockChronoWrong",
                )
                .map((key, index) => (
                  <ProfileLayersError
                    data={{
                      title: key,
                      isEditable,
                      id: item.id,
                      isInside: true,
                      onUpdated: onUpdated,
                    }}
                    key={index}
                    setDeleteParams={setDeleteParams}
                  />
                ))}

            <ProfileLayersList
              data={{
                itemWithValidation: item,
                item: layers?.data?.find(l => l.id === item.id),
                isEditable,
                selectedLayer,
                showDelete,
                setShowDelete,
                setSelectedLayer,
                isStratigraphy,
                onUpdated,
              }}
            />

            {/* validation before each layer */}
            {showDelete === item.id && (
              <ProfileLayersError
                data={{
                  title: "delete",
                  isEditable,
                  id: item.id,
                  isInside: true,
                  onUpdated: onUpdated,
                  layerIndex: index,
                  layerLength: layersWithValidation?.data.length,
                  closeDelete: () => setShowDelete(),
                }}
                setDeleteParams={setDeleteParams}
              />
            )}
          </Styled.Layer>
        ))}

      {/* validation after all layers */}
      {layersWithValidation?.validation &&
        Object.keys(layersWithValidation?.validation)
          .filter(key => key !== "missingLayers")
          .map((key, index) => (
            <div key={index}>
              <ProfileLayersError
                data={{
                  title: key,
                  isEditable,
                  id: selectedStratigraphyID,
                  isInside: false,
                  onUpdated: onUpdated,
                }}
                key={index}
                setDeleteParams={setDeleteParams}
              />
            </div>
          ))}
    </Box>
  );
};

export default ProfileLayersValidation;
