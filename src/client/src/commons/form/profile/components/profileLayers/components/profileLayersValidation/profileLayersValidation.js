import React, { useEffect, createRef, useRef } from "react";
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

  // add refs to layers to allow scroll behaviour
  const layerRefs = Array(layers?.data?.length)
    .fill(null)
    .map(() => createRef(null));

  // store previous length of list
  const prevLengthRef = useRef(0);
  const lastLayerRef = layerRefs[layers?.data?.length - 1];

  useEffect(() => {
    // scroll to the last item in the list
    if (lastLayerRef?.current && layers?.data?.length > prevLengthRef.current) {
      lastLayerRef.current.scrollIntoView({ behavior: "smooth" });
    }
    // update the previous length
    prevLengthRef.current = layers?.data?.length;
  }, [layers.data, lastLayerRef]);

  return (
    <Box data-cy="styled-layer-container">
      {/* validation before all layers */}
      {layersWithValidation?.validation &&
        layersWithValidation?.validation?.missingLayers && (
          <div style={{ borderTop: "1px solid lightgrey", flex: "1 1 0px" }}>
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
