import { Dispatch, SetStateAction } from "react";
import { Box } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { NavigationLens } from "../../navigation/NavigationLens.tsx";
import { NavState } from "../../navigation/navState.ts";
import { ScaledLayerColumn } from "../scaledLayerColumn/ScaledLayerColumn.tsx";
import { useLithostratigraphyLensLayers } from "./useLithostratigraphyLensLayers.ts";

interface LensColumnProps {
  stratigraphyId: number;
  navState: NavState;
  setNavState: Dispatch<SetStateAction<NavState>>;
  sx?: SxProps<Theme>;
  layoutMode?: "stack" | "split";
}

// Mini-overview column that wraps NavigationLens: the lens rectangle drives the parent NavState's
// lensStart (drag the lens to pan the main view), and the background paints each layer in its
// lithostratigraphy color so users have a borehole-at-a-glance reference while panning.
export const LensColumn = ({ navState, setNavState, stratigraphyId, sx, layoutMode }: LensColumnProps) => {
  const { validLayers, getColor } = useLithostratigraphyLensLayers(stratigraphyId);

  return (
    <NavigationLens
      navState={navState}
      setNavState={setNavState}
      sx={sx}
      layoutMode={layoutMode}
      renderBackground={bgNavState => (
        <ScaledLayerColumn
          layers={validLayers}
          navState={bgNavState}
          getKey={l => l.id}
          minPixelHeight={1}
          renderLayer={layer => (
            <Box
              sx={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
              style={{ backgroundColor: getColor(layer) ?? "rgb(220,220,220)" }}
            />
          )}
        />
      )}
    />
  );
};
