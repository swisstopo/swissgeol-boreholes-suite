import { Dispatch, SetStateAction } from "react";
import { Box } from "@mui/material";
import { theme } from "../../../../../../AppTheme.ts";
import { NavigationLens } from "../../navigation/NavigationLens.tsx";
import { NavState } from "../../navigation/navState.ts";
import { ScaledLayerColumn } from "../scaledLayerColumn/ScaledLayerColumn.tsx";
import { useLithostratigraphyLensLayers } from "./useLithostratigraphyLensLayers.ts";

interface LensColumnProps {
  stratigraphyId: number;
  navState: NavState;
  setNavState: Dispatch<SetStateAction<NavState>>;
}

// Mini-overview column that wraps NavigationLens: the lens rectangle drives the parent NavState's
// lensStart (drag the lens to pan the main view), and the background paints each layer in its
// lithostratigraphy color so users have a borehole-at-a-glance reference while panning. The
// underlying NavigationLens returns three pieces (lens-up / lens-body / lens-down) with grid-area
// assignments — the parent CSS grid is responsible for placing them in their tracks.
export const LensColumn = ({ stratigraphyId, navState, setNavState }: LensColumnProps) => {
  const { validLayers, getColor } = useLithostratigraphyLensLayers(stratigraphyId);
  return (
    <NavigationLens
      navState={navState}
      setNavState={setNavState}
      renderBackground={bgNavState => (
        <ScaledLayerColumn
          layers={validLayers}
          navState={bgNavState}
          getKey={l => l.id}
          minPixelHeight={1}
          renderLayer={layer => (
            <Box
              sx={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
              style={{ backgroundColor: getColor(layer) ?? theme.palette.neutral.main }}
            />
          )}
        />
      )}
    />
  );
};
