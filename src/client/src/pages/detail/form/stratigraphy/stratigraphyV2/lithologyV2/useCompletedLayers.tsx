import { useMemo } from "react";
import { BaseLayer } from "../../../../../../api/stratigraphy.ts";
import { LayerDepth, Lithology } from "../../lithology.ts";

export function useCompletedLayers(layers: BaseLayer[] = [], layerDepths?: LayerDepth[]) {
  const completedLayers = useMemo(() => {
    const sortedLayers = [...layers].sort((a, b) => a.fromDepth - b.fromDepth);
    const resultLayers: BaseLayer[] = [];

    // Helper to check if a layer is Lithology (by property presence)
    const isLithology = (layer: BaseLayer): layer is Lithology => {
      return "hasBedding" in layer && "isUnconsolidated" in layer;
    };

    // Add gap at start if needed
    if (layerDepths && layerDepths.length > 0 && sortedLayers.length > 0) {
      const sortedDepths = [...layerDepths].sort((a, b) => a.fromDepth - b.fromDepth);
      const firstDepth = sortedDepths[0].fromDepth;
      const firstLayer = sortedLayers[0];
      if (firstDepth < firstLayer.fromDepth) {
        const gapLayer: BaseLayer = {
          id: 0,
          fromDepth: firstDepth,
          toDepth: firstLayer.fromDepth,
          isGap: true,
          stratigraphyId: firstLayer.stratigraphyId,
          ...(isLithology(firstLayer) && { hasBedding: false, isUnconsolidated: true }),
        };
        resultLayers.push(gapLayer);
      }
    }

    let lastDepth = 0;
    sortedLayers.forEach((layer, index) => {
      // If there's a gap between this layer and the previous depth, add a gap filler
      if (layer.fromDepth > lastDepth && index > 0) {
        const prev = resultLayers[resultLayers.length - 1];
        const gapLayer: BaseLayer = {
          id: 0,
          fromDepth: lastDepth,
          toDepth: layer.fromDepth,
          isGap: true,
          stratigraphyId: layer.stratigraphyId,
          ...(isLithology(prev) && { hasBedding: false, isUnconsolidated: prev.isUnconsolidated ?? true }),
        };
        resultLayers.push(gapLayer);
      }

      resultLayers.push({ ...layer, isGap: false });
      lastDepth = layer.toDepth;
    });

    // Add gap at end if needed
    if (layerDepths && layerDepths.length > 0 && sortedLayers.length > 0) {
      const sortedDepths = [...layerDepths].sort((a, b) => a.fromDepth - b.fromDepth);
      const lastDepthValue = sortedDepths[sortedDepths.length - 1].toDepth;
      const lastLayer = sortedLayers[sortedLayers.length - 1];
      if (lastLayer.toDepth < lastDepthValue) {
        const prev = resultLayers[resultLayers.length - 1];
        const gapLayer: BaseLayer = {
          id: 0,
          fromDepth: lastLayer.toDepth,
          toDepth: lastDepthValue,
          isGap: true,
          stratigraphyId: lastLayer.stratigraphyId,
          ...(isLithology(lastLayer) && { hasBedding: false, isUnconsolidated: prev.isUnconsolidated ?? true }),
        };
        resultLayers.push(gapLayer);
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
