import { useMemo } from "react";
import { BaseLayer } from "../../../../../../api/stratigraphy.ts";
import { LayerDepth } from "../../lithology.ts";

export function useCompletedLayers(layers: BaseLayer[] = [], layerDepths?: LayerDepth[]) {
  const completedLayers = useMemo(() => {
    const sortedLayers = [...layers].sort((a, b) => a.fromDepth - b.fromDepth);
    const resultLayers: BaseLayer[] = [];

    // Add gap at start if needed
    if (layerDepths && layerDepths.length > 0 && sortedLayers.length > 0) {
      const sortedDepths = [...layerDepths].sort((a, b) => a.fromDepth - b.fromDepth);
      const firstDepth = sortedDepths[0].fromDepth;
      const firstLayer = sortedLayers[0];
      if (firstDepth < firstLayer.fromDepth) {
        resultLayers.push({
          id: 0,
          fromDepth: firstDepth,
          toDepth: firstLayer.fromDepth,
          isGap: true,
          stratigraphyId: firstLayer.stratigraphyId,
        });
      }
    }

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

    // Add gap at end if needed
    if (layerDepths && layerDepths.length > 0 && sortedLayers.length > 0) {
      const sortedDepths = [...layerDepths].sort((a, b) => a.fromDepth - b.fromDepth);
      const lastDepthValue = sortedDepths[sortedDepths.length - 1].toDepth;
      const lastLayer = sortedLayers[sortedLayers.length - 1];
      if (lastLayer.toDepth < lastDepthValue) {
        resultLayers.push({
          id: resultLayers.length,
          fromDepth: lastLayer.toDepth,
          toDepth: lastDepthValue,
          isGap: true,
          stratigraphyId: lastLayer.stratigraphyId,
        });
      }
    }

    // If layers is empty but layerDepths is provided, return a single gap covering the full range
    if (sortedLayers.length === 0 && layerDepths && layerDepths.length > 0) {
      const sortedDepths = [...layerDepths].sort((a, b) => a.fromDepth - b.fromDepth);
      resultLayers.push({
        id: 0,
        fromDepth: sortedDepths[0].fromDepth,
        toDepth: sortedDepths[sortedDepths.length - 1].toDepth,
        isGap: true,
        stratigraphyId: 0,
      });
    }

    return resultLayers;
  }, [layers, layerDepths]);

  return { completedLayers };
}
