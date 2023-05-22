import React, { useEffect } from "react";
import { NumericFormat } from "react-number-format";
import { useLayers } from "../../../../api/fetchApiV2";
import { LinearProgress, Box } from "@mui/material";

const handleColor = layer =>
  `rgb(${(
    JSON.parse(layer?.lithostratigraphy?.conf ?? null)?.color ?? [255, 255, 255]
  ).join()})`;

const handlePattern = layer =>
  `url(/img/lit/${JSON.parse(layer?.lithology?.conf ?? null)?.image})`;

/**
 * Displays the lithology layers.
 */
const LithologyViewProfile = ({
  stratigraphyId,
  navState,
  setNavState,
  minPixelHeightForDepthLabel = 30,
}) => {
  const { data: layers } = useLayers(stratigraphyId);

  useEffect(() => {
    setNavState(prev => prev.setContentHeightFromLayers("lithology", layers));
  }, [layers, setNavState]);

  if (!layers) {
    return <LinearProgress />;
  }

  return (
    <>
      {layers.map(layer => {
        const color = handleColor(layer);
        const pattern = handlePattern(layer);
        const height =
          (layer.toDepth - layer.fromDepth) * navState.pixelPerMeter;
        return (
          <Box
            sx={{
              backgroundColor: color,
              backgroundImage: pattern,
              position: "absolute",
              top: layer.fromDepth * navState.pixelPerMeter,
              left: 0,
              right: 0,
              height: height + "px",
            }}
            key={layer.id}>
            {height > minPixelHeightForDepthLabel && (
              <Box
                sx={{
                  fontSize: "0.7em",
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "white",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                }}>
                <NumericFormat
                  value={layer.toDepth}
                  thousandSeparator="'"
                  displayType="text"
                  suffix={" m"}
                />
              </Box>
            )}
          </Box>
        );
      })}
    </>
  );
};

export default LithologyViewProfile;
