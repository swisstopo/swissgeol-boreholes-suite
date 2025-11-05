import { BaseLayer, FaciesDescription, LithologicalDescription } from "../../../../api/stratigraphy.ts";
import { LayerDepth, Lithology } from "./lithology.ts";

const createGapLayerDepth = (fromDepth: number, toDepth: number): LayerDepth => ({
  fromDepth,
  toDepth,
  lithologyId: 0,
  hasFromDepthError: true,
  hasToDepthError: true,
});

const checkDescriptionDepthExtendingCurrentLayers = (descriptions: BaseLayer[], layerDepths: LayerDepth[]) => {
  const firstLayer = layerDepths.at(0)!;
  const lastLayer = layerDepths.at(-1)!;

  const firstDescription = descriptions.at(0)!;
  const lastDescription = descriptions.at(-1)!;

  if (firstDescription.fromDepth < firstLayer.fromDepth) {
    layerDepths.push(createGapLayerDepth(firstDescription.fromDepth, firstLayer.fromDepth));
  }

  if (lastLayer.toDepth < lastDescription.toDepth) {
    layerDepths.push(createGapLayerDepth(lastLayer.toDepth, lastDescription.toDepth));
  }
};

const checkLayerForMultipleDescriptionDepthsFullyWithin = (descriptions: BaseLayer[], layerDepths: LayerDepth[]) => {
  for (let i = 0; i < layerDepths.length; i++) {
    const layer = layerDepths[i];
    if (layer.lithologyId === 0) {
      // Find descriptions fully within this layer
      const matchingDescriptions = descriptions.filter(
        d => d.fromDepth >= layer.fromDepth && d.toDepth <= layer.toDepth,
      );
      if (matchingDescriptions.length > 1) {
        // Remove the original layer
        layerDepths.splice(i, 1);
        // Insert new layers for each description
        const newLayers = matchingDescriptions.map(d => createGapLayerDepth(d.fromDepth, d.toDepth));
        layerDepths.splice(i, 0, ...newLayers);
        i += newLayers.length - 1;
      }
    }
  }
};

const checkLayerForDescriptionDepthOverlapping = (descriptions: BaseLayer[], layerDepths: LayerDepth[]) => {
  for (let i = 0; i < layerDepths.length; i++) {
    const layer = layerDepths[i];
    if (layer.lithologyId === 0) {
      // Find descriptions that overlap this layer, but are not exact matches of fromDepth and toDepth with any other layers
      const overlappingDescriptions = descriptions.filter(
        d =>
          !layers.some(l => d.fromDepth === l.fromDepth && d.toDepth === l.toDepth) &&
          d.fromDepth < layer.toDepth &&
          d.toDepth > layer.fromDepth,
      );
      if (overlappingDescriptions.length > 0) {
        // For each overlapping description, split the gap as needed
        const splits: LayerDepth[] = [];
        let start = layer.fromDepth;
        for (const desc of overlappingDescriptions) {
          if (desc.fromDepth > start) {
            splits.push(createGapLayerDepth(start, desc.fromDepth));
          }
          splits.push(createGapLayerDepth(Math.max(start, desc.fromDepth), Math.min(layer.toDepth, desc.toDepth)));
          start = Math.min(layer.toDepth, desc.toDepth);
        }
        if (start < layer.toDepth) {
          splits.push(createGapLayerDepth(start, layer.toDepth));
        }
        // Remove the original gap and insert the splits
        layerDepths.splice(i, 1, ...splits);
        i += splits.length - 1;
      }
    }
  }
};

const checkDescriptionDepthLayers = (descriptions: BaseLayer[], layerDepths: LayerDepth[]) => {
  if (descriptions.length === 0) return;

  // If there are no current layers, add all descriptions as gap layers
  if (layerDepths.length === 0) {
    for (const description of descriptions) {
      layerDepths.push(createGapLayerDepth(description.fromDepth, description.toDepth));
    }
    return;
  }

  // Add gap layers if descriptions extend beyond current layers
  checkDescriptionDepthExtendingCurrentLayers(descriptions, layerDepths);

  // Split gap layers if multiple descriptions fit inside a layer
  checkLayerForMultipleDescriptionDepthsFullyWithin(descriptions, layerDepths);

  // Split gap layers if a description overlaps the layer
  checkLayerForDescriptionDepthOverlapping(descriptions, layerDepths);
};

const checkLayerDepths = (depths: LayerDepth[]) => {
  const checkedLayerDepths: LayerDepth[] = [];
  for (let i = 0; i < depths.length; i++) {
    const previous = depths[i - 1];
    const current = depths[i];
    const next = depths[i + 1];

    const hasFromDepthOverlap = (previous ? current.fromDepth < previous.toDepth : false) || current.hasFromDepthError;
    const hasToDepthOverlap = (next ? current.toDepth > next.fromDepth : false) || current.hasToDepthError;

    checkedLayerDepths.push({
      ...current,
      hasFromDepthError: hasFromDepthOverlap,
      hasToDepthError: hasToDepthOverlap,
    });

    // Add gap layer if there's a gap between current and next. This can happen if the lithologies and
    // lithologicalDescriptions are empty but the faciesDescriptions contains layers with gaps in between.
    if (i < depths.length - 1) {
      if (current.toDepth < next.fromDepth) {
        checkedLayerDepths.push({
          fromDepth: current.toDepth,
          toDepth: next.fromDepth,
          lithologyId: 0,
          hasFromDepthError: true,
          hasToDepthError: true,
        });
      }
    }
  }
  return checkedLayerDepths;
};

export const getLayerDepths = (
  lithologies: Lithology[],
  lithologicalDescriptions: LithologicalDescription[],
  faciesDescriptions: FaciesDescription[],
) => {
  const lithologiesWithoutGaps = lithologies.filter(l => !l.isGap).sort((a, b) => a.fromDepth - b.fromDepth);
  const layerDepths: LayerDepth[] = [];
  for (let i = 0; i < lithologiesWithoutGaps.length; i++) {
    const current = lithologiesWithoutGaps[i];
    // Add gap layer for gap between previous and current lithology
    if (i > 0) {
      const prev = lithologiesWithoutGaps[i - 1];
      if (current.fromDepth > prev.toDepth) {
        layerDepths.push({
          fromDepth: prev.toDepth,
          toDepth: current.fromDepth,
          lithologyId: 0,
          hasFromDepthError: true,
          hasToDepthError: true,
        });
      }
    }
    layerDepths.push({
      fromDepth: current.fromDepth,
      toDepth: current.toDepth,
      lithologyId: current.id,
      hasFromDepthError: false,
      hasToDepthError: false,
    });
  }
  layerDepths.sort((a, b) => a.fromDepth - b.fromDepth);

  checkDescriptionDepthLayers(
    lithologicalDescriptions.filter(l => !l.isGap),
    layerDepths,
  );
  layerDepths.sort((a, b) => a.fromDepth - b.fromDepth);

  checkDescriptionDepthLayers(
    faciesDescriptions.filter(l => !l.isGap),
    layerDepths,
  );
  layerDepths.sort((a, b) => a.fromDepth - b.fromDepth);

  return checkLayerDepths(layerDepths);
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
    const firstLayerFromDepth = layers[0].item.fromDepth;
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
  if (prev && !prev.item.isGap && current.item.fromDepth > prev.item.toDepth) {
    const gapDepths = depths
      .filter(d => d.fromDepth >= prev.item.toDepth && d.toDepth <= current.item.fromDepth)
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
      const lastLayerToDepth = lastLayer.item.toDepth;
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

const mergeAdjacentGaps = (layers: BaseLayerChangeTracker[]): BaseLayerChangeTracker[] => {
  const mergedLayers: BaseLayerChangeTracker[] = [];
  for (const current of layers) {
    const prev = mergedLayers.at(-1);
    if (prev?.item.isGap && current.item.isGap && mergedLayers.at(-1)?.item.toDepth === current.item.fromDepth) {
      prev.item.toDepth = current.item.toDepth;
    } else {
      mergedLayers.push(current);
    }
  }
  return mergedLayers;
};

export const getLayersWithGaps = (
  layers: BaseLayerChangeTracker[],
  depths: LayerDepth[],
  stratigraphyId: number,
  mergeGaps?: boolean,
): BaseLayerChangeTracker[] => {
  const sortedLayers = [...layers].filter(l => !l.item.isGap).sort((a, b) => a.item.fromDepth - b.item.fromDepth);
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

  if (mergeGaps) {
    return mergeAdjacentGaps(resultLayers);
  } else {
    return resultLayers;
  }
};

export interface BaseLayerChangeTracker {
  item: BaseLayer;
  hasChanges: boolean;
}
