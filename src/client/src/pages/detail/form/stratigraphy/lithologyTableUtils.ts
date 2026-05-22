import { v4 as uuidv4 } from "uuid";
import { BaseLayer } from "../../../../api/stratigraphy.ts";
import { FaciesDescription } from "./faciesDescription.ts";
import { LithologicalDescription } from "./lithologicalDescription.ts";
import { Lithology } from "./lithology.ts";

export interface DepthLayer {
  id: string;
  fromDepth: number;
  toDepth: number;
  hasFromDepthError?: boolean;
  hasToDepthError?: boolean;
  isAutoCorrected?: boolean;
}

export const defaultRowHeight = 240;

// Sort by fromDepth, tie-breaking on toDepth, then clamp toDepth to the next item's fromDepth wherever they overlap.
const cleanupOverlaps = <T extends BaseLayer>(items: T[]): T[] => {
  const sorted = items.map(item => ({ ...item })).sort((a, b) => a.fromDepth - b.fromDepth || a.toDepth - b.toDepth);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].toDepth > sorted[i + 1].fromDepth) {
      sorted[i].toDepth = sorted[i + 1].fromDepth;
      sorted[i].isAutoCorrected = true;
    }
  }
  return sorted;
};

export const createEmptyLithology = (
  fromDepth: number,
  toDepth: number,
  stratigraphyId: number,
  inheritedUnconsolidated?: boolean | null,
): Lithology => ({
  id: 0,
  stratigraphyId,
  fromDepth,
  toDepth,
  isUnconsolidated: inheritedUnconsolidated ?? null,
  hasBedding: false,
  isAutoCorrected: true,
});

// Fill gaps between lithologies and extend coverage to match description ranges, with empty autocorrected lithologies.
const fillLithologyGaps = (
  lithologies: Lithology[],
  otherBoundaries: number[],
  stratigraphyId: number,
): Lithology[] => {
  const result: Lithology[] = [...lithologies];

  if (otherBoundaries.length > 0) {
    const minBoundary = Math.min(...otherBoundaries);
    const maxBoundary = Math.max(...otherBoundaries);

    if (result.length === 0) {
      result.push(createEmptyLithology(minBoundary, maxBoundary, stratigraphyId));
    } else {
      if (minBoundary < result[0].fromDepth) {
        result.unshift(createEmptyLithology(minBoundary, result[0].fromDepth, stratigraphyId));
      }
      const last = result.at(-1)!;
      if (maxBoundary > last.toDepth) {
        result.push(createEmptyLithology(last.toDepth, maxBoundary, stratigraphyId, last.isUnconsolidated));
      }
    }
  }

  for (let i = 0; i < result.length - 1; i++) {
    if (result[i + 1].fromDepth > result[i].toDepth) {
      result.splice(
        i + 1,
        0,
        createEmptyLithology(result[i].toDepth, result[i + 1].fromDepth, stratigraphyId, result[i].isUnconsolidated),
      );
    }
  }

  return result;
};

// Build depth layers from the union of all distinct boundary values, inserting a zero-thickness layer at each point where an item has fromDepth === toDepth.
const buildDepthLayers = (
  lithologies: Lithology[],
  lithologicalDescriptions: LithologicalDescription[],
  faciesDescriptions: FaciesDescription[],
): DepthLayer[] => {
  const boundarySet = new Set<number>();
  const zeroThicknessPoints = new Set<number>();
  for (const items of [lithologies, lithologicalDescriptions, faciesDescriptions]) {
    for (const item of items) {
      boundarySet.add(item.fromDepth);
      boundarySet.add(item.toDepth);
      if (item.fromDepth === item.toDepth) {
        zeroThicknessPoints.add(item.fromDepth);
      }
    }
  }
  const boundaries = [...boundarySet].sort((a, b) => a - b);
  const layers: DepthLayer[] = [];
  for (let i = 0; i < boundaries.length; i++) {
    if (zeroThicknessPoints.has(boundaries[i])) {
      layers.push({ id: uuidv4(), fromDepth: boundaries[i], toDepth: boundaries[i] });
    }
    if (i < boundaries.length - 1) {
      layers.push({ id: uuidv4(), fromDepth: boundaries[i], toDepth: boundaries[i + 1] });
    }
  }
  return layers;
};

// A non-zero-thickness item owns every non-zero-thickness layer that sits fully inside it,
// plus any zero-thickness layer strictly inside (a zt at the item's own boundary is the item's
// start/end, not a foreign cut, so it doesn't count). A zero-thickness item owns exactly the
// zero-thickness layer at its point.
const assignDepthIds = <T extends BaseLayer>(items: T[], depthLayers: DepthLayer[]) => {
  for (const item of items) {
    if (item.fromDepth === item.toDepth) {
      item.depthIds = depthLayers
        .filter(l => l.fromDepth === item.fromDepth && l.toDepth === item.fromDepth)
        .map(l => l.id);
    } else {
      item.depthIds = depthLayers
        .filter(l => {
          if (l.fromDepth < l.toDepth) {
            return l.fromDepth >= item.fromDepth && l.toDepth <= item.toDepth;
          }
          return l.fromDepth > item.fromDepth && l.fromDepth < item.toDepth;
        })
        .map(l => l.id);
    }
  }
};

// Top-to-bottom pass: for each candidate layer that touches the bottom of the previous
// kept layer, extend that previous layer downward to swallow the candidate. The previous
// layer keeps its id; the candidate's id is reported back in `mergedIds`. A candidate
// with no touching layer above it (first in the list, or sitting after a gap) is left
// where it is.
export const mergeAdjacentDepths = (
  depths: DepthLayer[],
  candidates: Set<string>,
): { depths: DepthLayer[]; mergedIds: Set<string> } => {
  const result: DepthLayer[] = [];
  const mergedIds = new Set<string>();
  for (const depth of depths) {
    const prev = result.at(-1);
    if (candidates.has(depth.id) && prev?.toDepth === depth.fromDepth) {
      result[result.length - 1] = { ...prev, toDepth: depth.toDepth };
      mergedIds.add(depth.id);
    } else {
      result.push({ ...depth });
    }
  }
  return { depths: result, mergedIds };
};

export const removeDepthIdReferences = <T extends BaseLayer>(items: T[], removedIds: Set<string>): T[] => {
  if (removedIds.size === 0) return items;
  return items.map(item => {
    if (!item.depthIds?.some(id => removedIds.has(id))) return item;
    return { ...item, depthIds: item.depthIds.filter(id => !removedIds.has(id)) };
  });
};

export const flagErrors = (depthLayers: DepthLayer[], lithologies: Lithology[]): DepthLayer[] => {
  const flagged = new Set<string>();

  // Zero-thickness layers
  for (const layer of depthLayers) {
    if (layer.fromDepth === layer.toDepth) {
      flagged.add(layer.id);
    }
  }

  // Layers belonging to a lithology that spans more than one layer
  for (const lithology of lithologies) {
    if ((lithology.depthIds?.length ?? 0) > 1) {
      for (const depthId of lithology.depthIds!) {
        flagged.add(depthId);
      }
    }
  }

  return depthLayers.map(layer => ({
    ...layer,
    hasFromDepthError: flagged.has(layer.id),
    hasToDepthError: flagged.has(layer.id),
  }));
};

export const getInitialDepthLayers = (
  lithologies: Lithology[],
  lithologicalDescriptions: LithologicalDescription[],
  faciesDescriptions: FaciesDescription[],
  stratigraphyId: number,
) => {
  // 1. Per-column overlap cleanup (sort by fromDepth then toDepth, clamp overlaps).
  const cleanLithologicalDescriptions = cleanupOverlaps(lithologicalDescriptions);
  const cleanFaciesDescriptions = cleanupOverlaps(faciesDescriptions);
  let cleanLithologies = cleanupOverlaps(lithologies);

  // 2. Fill gaps in the lithology column with empty, autocorrected lithologies; extend coverage to description range.
  const descriptionBoundaries = [
    ...cleanLithologicalDescriptions.flatMap(d => [d.fromDepth, d.toDepth]),
    ...cleanFaciesDescriptions.flatMap(d => [d.fromDepth, d.toDepth]),
  ];
  cleanLithologies = fillLithologyGaps(cleanLithologies, descriptionBoundaries, stratigraphyId);

  // 3. Build depth layers from the union of all distinct boundaries.
  const depthLayers = buildDepthLayers(cleanLithologies, cleanLithologicalDescriptions, cleanFaciesDescriptions);

  // 4. Assign depthIds to every item.
  assignDepthIds(cleanLithologies, depthLayers);
  assignDepthIds(cleanLithologicalDescriptions, depthLayers);
  assignDepthIds(cleanFaciesDescriptions, depthLayers);

  // 5. Flag errors: zero-thickness depth layers and depth layers belonging to a lithology that spans more than one.
  const flaggedDepthLayers = flagErrors(depthLayers, cleanLithologies);

  return {
    cleanDepths: flaggedDepthLayers,
    cleanLithologies,
    cleanLithologicalDescriptions,
    cleanFaciesDescriptions,
  };
};
