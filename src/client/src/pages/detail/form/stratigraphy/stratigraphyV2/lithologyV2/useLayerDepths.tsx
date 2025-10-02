import { useMemo } from "react";
import { LayerDepth, Lithology } from "../../lithology.ts";

export function useLayerDepths(lithologies: Lithology[]) {
  const depths = useMemo(() => {
    const layerDepths: LayerDepth[] = [];
    lithologies.forEach(l => {
      layerDepths.push({ fromDepth: l.fromDepth, toDepth: l.toDepth, lithologyId: l.id });
    });
    layerDepths.sort((a, b) => a.fromDepth - b.fromDepth);
    const filledLayerDepths: LayerDepth[] = [];
    for (let i = 0; i < layerDepths.length; i++) {
      const previous = layerDepths[i - 1];
      const current = layerDepths[i];
      const next = layerDepths[i + 1];

      const hasFromDepthOverlap = previous ? current.fromDepth < previous.toDepth : false;
      const hasToDepthOverlap = next ? current.toDepth > next.fromDepth : false;

      filledLayerDepths.push({
        ...layerDepths[i],
        hasFromDepthError: hasFromDepthOverlap,
        hasToDepthError: hasToDepthOverlap,
      });
      // add gap layer
      if (i < layerDepths.length - 1) {
        if (current.toDepth < next.fromDepth) {
          filledLayerDepths.push({
            fromDepth: current.toDepth,
            toDepth: next.fromDepth,
            lithologyId: 0,
            hasFromDepthError: true,
            hasToDepthError: true,
          });
        }
      }
    }
    return filledLayerDepths;
  }, [lithologies]);

  return { depths };
}
