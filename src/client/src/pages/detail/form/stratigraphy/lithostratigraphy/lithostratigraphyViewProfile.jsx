import { useEffect } from "react";
import { Box, LinearProgress } from "@mui/material";
import { useLithostratigraphies } from "../../../../../api/stratigraphy.ts";

const handleColor = layer =>
  `rgb(${(JSON.parse(layer?.lithostratigraphy?.conf ?? null)?.color ?? [255, 255, 255]).join()})`;

/**
 * Displays the lithostratigraphy layers.
 */
const LithostratigraphyViewProfile = ({ stratigraphyId, navState, setNavState }) => {
  const { data: layers } = useLithostratigraphies(stratigraphyId);

  useEffect(() => {
    setNavState(prev => prev.setContentHeightFromLayers("lithostrati", layers));
  }, [layers, setNavState]);

  if (!layers) {
    return <LinearProgress />;
  }

  return (
    <>
      {layers.flatMap(layer => {
        const height = (layer.toDepth - layer.fromDepth) * navState.pixelPerMeter;
        return !isFinite(height) ||
          height < 1 ||
          layer.fromDepth > navState.lensEnd ||
          layer.toDepth < navState.lensStart
          ? []
          : [
              <Box
                key={layer.id}
                sx={{ position: "absolute", left: 0, right: 0 }}
                style={{
                  backgroundColor: handleColor(layer),
                  top: layer.fromDepth * navState.pixelPerMeter,
                  height: height + "px",
                }}
              />,
            ];
      })}
    </>
  );
};

export default LithostratigraphyViewProfile;
