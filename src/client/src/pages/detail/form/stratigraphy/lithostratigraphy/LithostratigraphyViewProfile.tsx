import { Dispatch, FC, SetStateAction, useEffect, useMemo } from "react";
import { Box, LinearProgress } from "@mui/material";
import { LithostratigraphyLayer } from "../../../../../api/generated";
import { getLithostratigraphyColor } from "../components/scaledLayerColumn/getLithostratigraphyColor.ts";
import { ScaledLayerColumn } from "../components/scaledLayerColumn/ScaledLayerColumn.tsx";
import { NavState } from "../navigation/navState.ts";
import { useLithostratigraphies } from "../stratigraphy.ts";

interface LithostratigraphyViewProfileProps {
  stratigraphyId: number;
  navState: NavState;
  setNavState: Dispatch<SetStateAction<NavState>>;
}

type ScaledLithostratigraphyLayer = LithostratigraphyLayer & { fromDepth: number; toDepth: number };

// Displays the lithostratigraphy layers as a depth-proportional colored profile.
export const LithostratigraphyViewProfile: FC<LithostratigraphyViewProfileProps> = ({
  stratigraphyId,
  navState,
  setNavState,
}) => {
  const { data: layers } = useLithostratigraphies(stratigraphyId);

  const validLayers = useMemo<ReadonlyArray<ScaledLithostratigraphyLayer>>(
    () => (layers ?? []).filter((l): l is ScaledLithostratigraphyLayer => l.fromDepth !== null && l.toDepth !== null),
    [layers],
  );

  useEffect(() => {
    setNavState(prev => prev.setContentHeightFromLayers("lithostrati", validLayers));
  }, [validLayers, setNavState]);

  if (!layers) return <LinearProgress />;

  return (
    <ScaledLayerColumn
      layers={validLayers}
      navState={navState}
      getKey={l => l.id}
      minPixelHeight={1}
      renderLayer={layer => (
        <Box
          sx={{ position: "absolute", inset: 0 }}
          style={{ backgroundColor: getLithostratigraphyColor(layer) ?? "rgb(255,255,255)" }}
        />
      )}
    />
  );
};
