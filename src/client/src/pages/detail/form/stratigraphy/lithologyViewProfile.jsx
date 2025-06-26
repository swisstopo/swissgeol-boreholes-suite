import { useEffect } from "react";
import { NumericFormat } from "react-number-format";
import { Box, LinearProgress } from "@mui/material";
import { useLayers } from "../../../../api/stratigraphy.ts";
import { theme } from "../../../../AppTheme.ts";

const handlePattern = layer => `url(/img/lit/${JSON.parse(layer?.lithology?.conf ?? null)?.image})`;

/**
 * Displays the lithology layers.
 */
const LithologyViewProfile = ({ stratigraphyId, navState, setNavState, minPixelHeightForDepthLabel = 30 }) => {
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
                  backgroundImage: handlePattern(layer),
                  top: layer.fromDepth * navState.pixelPerMeter,
                  height: height + "px",
                }}>
                {height > minPixelHeightForDepthLabel && (
                  <Box
                    sx={{
                      fontSize: "0.7em",
                      fontWeight: "bold",
                      textAlign: "center",
                      color: "white",
                      backgroundColor: theme.palette.background.dark,
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                    }}>
                    <NumericFormat value={layer.toDepth} thousandSeparator="'" displayType="text" suffix={" m MD"} />
                  </Box>
                )}
              </Box>,
            ];
      })}
    </>
  );
};

export default LithologyViewProfile;
