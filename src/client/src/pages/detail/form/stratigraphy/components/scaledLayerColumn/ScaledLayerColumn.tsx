import { ReactNode, useMemo } from "react";
import { Box } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { NavState } from "../../navigation/navState.ts";

export interface ScaledLayer {
  fromDepth: number;
  toDepth: number;
}

interface ScaledLayerColumnProps<T extends ScaledLayer> {
  layers: ReadonlyArray<T>;
  navState: NavState;
  renderLayer: (layer: T, index: number) => ReactNode;
  getKey?: (layer: T, index: number) => string | number;
  minPixelHeight?: number;
  sx?: SxProps<Theme>;
}

// Renders each layer as an absolutely-positioned box at depth `fromDepth * pixelPerMeter` with
// height proportional to its thickness. Culls layers outside the current lens window and any
// thinner than `minPixelHeight` at the current zoom. Surviving layers are rendered at a hard
// minimum of 1px so a zero-thickness layer (e.g. a point observation) still appears as a hairline.
export const ScaledLayerColumn = <T extends ScaledLayer>({
  layers,
  navState,
  renderLayer,
  getKey,
  minPixelHeight = 0,
  sx,
}: ScaledLayerColumnProps<T>) => {
  const { pixelPerMeter, lensStart, lensEnd } = navState;

  const visibleLayers = useMemo(() => {
    if (!Number.isFinite(pixelPerMeter) || pixelPerMeter <= 0) return [];
    return layers.filter(l => {
      const height = (l.toDepth - l.fromDepth) * pixelPerMeter;
      return Number.isFinite(height) && height >= minPixelHeight && l.fromDepth <= lensEnd && l.toDepth >= lensStart;
    });
  }, [layers, pixelPerMeter, lensStart, lensEnd, minPixelHeight]);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%", ...sx }}>
      {visibleLayers.map((layer, index) => {
        const top = layer.fromDepth * pixelPerMeter;
        const height = Math.max(1, (layer.toDepth - layer.fromDepth) * pixelPerMeter);
        const customKey = getKey?.(layer, index);
        const keyValue = customKey ?? `${index}-${layer.fromDepth}-${layer.toDepth}`;
        const testId = `scaled-layer-wrapper-${customKey ?? index}`;
        return (
          <Box
            key={keyValue}
            data-testid={testId}
            sx={{ position: "absolute", left: 0, right: 0 }}
            style={{ top: `${top}px`, height: `${height}px` }}>
            {renderLayer(layer, index)}
          </Box>
        );
      })}
    </Box>
  );
};
