import { useMemo } from "react";
import { BaseLayer } from "../../../../../../api/stratigraphy.ts";

export function useCompletedLayers(layers: BaseLayer[] = []) {
  const completedLayers = useMemo(() => {
    const sortedLayers = [...layers].sort((a, b) => a.fromDepth - b.fromDepth);
    const resultLayers: BaseLayer[] = [];

    let lastDepth = 0;
    sortedLayers.forEach((layer, index) => {
      // If there's a gap between this layer and the previous depth, add a gap filler
      if (layer.fromDepth > lastDepth && index > 0) {
        const gapLayer: BaseLayer = {
          id: index,
          fromDepth: lastDepth,
          toDepth: layer.fromDepth,
          isGap: true,
          stratigraphyId: layer.stratigraphyId,
        };
        resultLayers.push(gapLayer);
      }

      resultLayers.push(layer);
      lastDepth = layer.toDepth;
    });

    return resultLayers;
  }, [layers]);

  return { completedLayers };
}
