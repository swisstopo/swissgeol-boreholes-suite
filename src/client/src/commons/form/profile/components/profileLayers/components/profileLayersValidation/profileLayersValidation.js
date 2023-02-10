import React from "react";
import ProfileLayersError from "../profileLayersError";
import ProfileLayersList from "../profileLayersList";
import * as Styled from "./styles";
import { Box } from "@mui/material";

export const ProfileLayersValidation = props => {
  const {
    layers,
    isEditable,
    onUpdated,
    selectedLayer,
    showDelete,
    setShowDelete,
    selectedStratigraphyID,
    setSelectedLayer,
  } = props.data;
  return (
    <Box data-cy="styled-layer-container">
      {/* validation before all layers */}
      {layers?.validation && layers?.validation?.missingLayers && (
        <div style={{ borderTop: "1px solid lightgrey", flex: "1 1 0px" }}>
          <ProfileLayersError
            data={{
              title: "missingLayers",
              isEditable,
              id: layers?.data?.[0].id,
              isInside: false,
              onUpdated: onUpdated,
            }}
          />
        </div>
      )}
      {/* layers list */}
      {layers?.data &&
        layers?.data.map((item, index) => (
          <Styled.Layer
            key={item.id}
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
                  />
                ))}

            <ProfileLayersList
              data={{
                item,
                layers,
                isEditable,
                selectedLayer,
                showDelete,
                setShowDelete,
                setSelectedLayer,
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
                  layerLength: layers?.data.length,
                  closeDelete: () => setShowDelete(),
                }}
              />
            )}
          </Styled.Layer>
        ))}

      {/* validation after all layers */}
      {layers?.validation &&
        Object.keys(layers?.validation)
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
              />
            </div>
          ))}
    </Box>
  );
};

export default ProfileLayersValidation;
