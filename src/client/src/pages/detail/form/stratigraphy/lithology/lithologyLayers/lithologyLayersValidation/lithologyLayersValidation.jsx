import { createRef, useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import LithologyLayersError from "../../lithologyLayersError";
import LithologyLayersList from "../lithologyLayersList";
import * as Styled from "./styles.js";

export const LithologyLayersValidation = props => {
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
    if ((lastLayerRef?.current && previousLength === 0) || (layerLength > previousLength && !selectedLayer)) {
      lastLayerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    // update the previous length
    setPreviousLength(layerLength || 0);
  }, [layerRefs, layersWithValidation?.data?.length, previousLength, selectedLayer]);

  return (
    <Box data-cy="styled-layer-container">
      {/* validation before all layers */}
      {layersWithValidation?.validation && layersWithValidation?.validation?.missingLayers && (
        <div style={{ flex: "1 1 0px" }}>
          <LithologyLayersError
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
          <Styled.Layer key={item.id} ref={layerRefs[index]} data-cy={"styled-layer-" + index} isFirst={index === 0}>
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
                  <LithologyLayersError
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

            <LithologyLayersList
              data={{
                itemWithValidation: item,
                item: layers?.data?.find(l => l.id === item.id),
                isEditable,
                selectedLayer,
                showDelete,
                setShowDelete,
                setSelectedLayer,
              }}
            />

            {/* validation before each layer */}
            {showDelete === item.id && (
              <LithologyLayersError
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
              <LithologyLayersError
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

export default LithologyLayersValidation;
