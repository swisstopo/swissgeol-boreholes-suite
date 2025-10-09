import { BaseLayer } from "../../../../api/stratigraphy.ts";
import { Lithology } from "./lithology.ts";

export const getMinMaxDepth = (
  lithologies: BaseLayer[],
  lithologicalDescriptions: BaseLayer[],
  faciesDescriptions: BaseLayer[],
): { minDepth: number; maxDepth: number } => {
  let minDepth: number | undefined;
  let maxDepth: number | undefined;

  const all = [lithologies, lithologicalDescriptions, faciesDescriptions];
  for (const arr of all) {
    for (const item of arr) {
      if (minDepth === undefined || item.fromDepth < minDepth) minDepth = item.fromDepth;
      if (maxDepth === undefined || item.toDepth > maxDepth) maxDepth = item.toDepth;
    }
  }

  return {
    minDepth: minDepth ?? 0,
    maxDepth: maxDepth ?? 0,
  };
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

const checkForFullRangeGap = (layers: BaseLayerChangeTracker[], minDepth: number, maxDepth: number) => {
  if (layers.length === 0 && minDepth < maxDepth) {
    return createGapLayer(minDepth, maxDepth, 0);
  }
  return undefined;
};

const checkForStartGap = (layers: BaseLayerChangeTracker[], minDepth: number) => {
  if (layers.length > 0) {
    const firstLayer = layers[0];
    if (minDepth < firstLayer.item.fromDepth) {
      return createGapLayer(
        minDepth,
        firstLayer.item.fromDepth,
        firstLayer.item.stratigraphyId,
        isLithology(firstLayer.item) ? true : undefined,
      );
    }
  }
  return undefined;
};

const checkForGapBetween = (current: BaseLayerChangeTracker, prev?: BaseLayerChangeTracker) => {
  if (prev && current.item.fromDepth > prev.item.toDepth) {
    return createGapLayer(
      prev.item.toDepth,
      current.item.fromDepth,
      current.item.stratigraphyId,
      isLithology(prev.item) ? (prev.item.isUnconsolidated ?? true) : undefined,
    );
  }
  return undefined;
};

const checkForEndGap = (layers: BaseLayerChangeTracker[], maxDepth: number) => {
  if (layers.length > 0) {
    const lastLayer = layers.at(-1)?.item;
    if (lastLayer && lastLayer.toDepth < maxDepth) {
      return createGapLayer(
        lastLayer.toDepth,
        maxDepth,
        lastLayer.stratigraphyId,
        isLithology(lastLayer) ? (lastLayer.isUnconsolidated ?? true) : undefined,
      );
    }
  }
  return undefined;
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
  minDepth: number,
  maxDepth: number,
): BaseLayerChangeTracker[] => {
  const sortedLayers = [...layers].sort((a, b) => a.item.fromDepth - b.item.fromDepth);
  const resultLayers: BaseLayerChangeTracker[] = [];

  // If layers is empty but minDepth and maxDepth are provided, return a single gap covering the full range
  const fullRangeGap = checkForFullRangeGap(sortedLayers, minDepth, maxDepth);
  if (fullRangeGap) return [fullRangeGap];

  // Add gap at start if minDepth is less than the first layer's fromDepth
  const startGap = checkForStartGap(sortedLayers, minDepth);
  if (startGap) resultLayers.push(startGap);

  // Map through layers and add gap where necessary
  for (let index = 0; index < sortedLayers.length; index++) {
    const current = sortedLayers[index];
    const prev = index > 0 ? sortedLayers[index - 1] : undefined;
    const gapBetween = checkForGapBetween(current, prev);
    if (gapBetween) resultLayers.push(gapBetween);

    resultLayers.push({
      item: { ...current.item, isGap: current.item.isGap ?? false },
      hasChanges: current.hasChanges ?? false,
    });
  }

  // Add gap at end if maxDepth is greater than the last layer's toDepth
  const endGap = checkForEndGap(sortedLayers, maxDepth);
  if (endGap) resultLayers.push(endGap);

  return mergeAdjacentGaps(resultLayers);
};

export interface BaseLayerChangeTracker {
  item: BaseLayer;
  hasChanges: boolean;
}
