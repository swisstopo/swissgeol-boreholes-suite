import { defaultRowHeight } from "./components/stratigraphyTablePrimitives.tsx";
import { BaseLayer, LayerDepth, Lithology } from "./stratigraphy.ts";

export const computeCellHeight = (fromDepth: number, toDepth: number, depths: LayerDepth[]) => {
  const startIndex = depths.findIndex(l => l.fromDepth === fromDepth);
  const endIndex = depths.findIndex(l => l.toDepth === toDepth);
  if (startIndex === -1 || endIndex === -1) return defaultRowHeight;
  return (endIndex - startIndex + 1) * defaultRowHeight;
};

const isLithology = (layer: BaseLayer): layer is Lithology => {
  return "hasBedding" in layer && "isUnconsolidated" in layer;
};

const createGapLayer = (fromDepth: number, toDepth: number, stratigraphyId: number, isUnconsolidated?: boolean) => {
  const gapLayer: BaseLayer = {
    id: 0,
    fromDepth,
    toDepth,
    isGap: true,
    stratigraphyId,
    ...(isUnconsolidated !== undefined && { hasBedding: false, isUnconsolidated }),
  };
  return { item: gapLayer, hasChanges: false } as BaseLayerChangeTracker;
};

const checkForStartGaps = (layers: BaseLayerChangeTracker[], depths: LayerDepth[]) => {
  const gapLayers: BaseLayerChangeTracker[] = [];
  if (layers.length > 0) {
    const firstLayerFromDepth = layers[0].item.fromDepth ?? 0;
    const preLayers = depths.filter(d => d.toDepth <= firstLayerFromDepth).sort((a, b) => a.fromDepth - b.fromDepth);

    for (const d of preLayers) {
      gapLayers.push(
        createGapLayer(
          d.fromDepth,
          d.toDepth,
          layers[0].item.stratigraphyId,
          isLithology(layers[0].item) ? true : undefined,
        ),
      );
    }
  }
  return gapLayers;
};

const checkForGapsBetween = (depths: LayerDepth[], current: BaseLayerChangeTracker, prev?: BaseLayerChangeTracker) => {
  const gapLayers: BaseLayerChangeTracker[] = [];
  const currFrom = current.item.fromDepth ?? 0;
  const prevTo = prev?.item.toDepth ?? 0;
  if (prev && !prev.item.isGap && currFrom > prevTo) {
    const gapDepths = depths
      .filter(d => d.fromDepth >= prevTo && d.toDepth <= currFrom)
      .sort((a, b) => a.fromDepth - b.fromDepth);

    for (const d of gapDepths) {
      gapLayers.push(
        createGapLayer(
          d.fromDepth,
          d.toDepth,
          current.item.stratigraphyId,
          isLithology(prev.item) ? (prev.item.isUnconsolidated ?? true) : undefined,
        ),
      );
    }
  }
  return gapLayers;
};

const checkForEndGaps = (layers: BaseLayerChangeTracker[], depths: LayerDepth[]) => {
  const gapLayers: BaseLayerChangeTracker[] = [];
  if (layers.length > 0) {
    const lastLayer = layers.at(-1);
    if (lastLayer && !lastLayer.item.isGap) {
      const lastLayerToDepth = lastLayer.item.toDepth ?? 0;
      const postLayers = depths.filter(d => d.fromDepth >= lastLayerToDepth).sort((a, b) => a.fromDepth - b.fromDepth);

      for (const d of postLayers) {
        gapLayers.push(
          createGapLayer(
            d.fromDepth,
            d.toDepth,
            layers.at(-1)!.item.stratigraphyId,
            isLithology(layers.at(-1)!.item) ? (layers.at(-1)!.item.isUnconsolidated ?? true) : undefined,
          ),
        );
      }
    }
  }
  return gapLayers;
};

export const getLayersWithGaps = (
  layers: BaseLayerChangeTracker[],
  depths: LayerDepth[],
  stratigraphyId: number,
): BaseLayerChangeTracker[] => {
  const sortedLayers = [...layers]
    .filter(l => !l.item.isGap)
    .sort((a, b) => (a.item.fromDepth ?? 0) - (b.item.fromDepth ?? 0));
  const resultLayers: BaseLayerChangeTracker[] = [];

  if (sortedLayers.length === 0) {
    // If layers is empty but depths has entries, create a gap layer for each depth entry
    for (const d of depths) {
      resultLayers.push(createGapLayer(d.fromDepth, d.toDepth, stratigraphyId, true));
    }
  } else {
    // Add gap layers for each depth entry before the first layer
    resultLayers.push(...checkForStartGaps(sortedLayers, depths));

    // Add layers and handle gaps between them
    for (let index = 0; index < sortedLayers.length; index++) {
      const current = sortedLayers[index];
      const prev = index > 0 ? sortedLayers[index - 1] : undefined;

      // For each gap between layers, add a gap for each matching depths entry
      resultLayers.push(...checkForGapsBetween(depths, current, prev));

      // Add the current layer
      resultLayers.push({
        item: { ...current.item, isGap: current.item.isGap ?? false },
        hasChanges: current.hasChanges ?? false,
      });
    }

    // Add gap layers for each depth entry after the last layer
    resultLayers.push(...checkForEndGaps(sortedLayers, depths));
  }

  return resultLayers;
};

interface BaseLayerChangeTracker {
  item: BaseLayer;
  hasChanges: boolean;
}
