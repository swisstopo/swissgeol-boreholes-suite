import { v4 as uuidv4 } from "uuid";
import { BaseLayer, DepthLayer } from "../../../../../../api/stratigraphy.ts";
import { FaciesDescription } from "../../faciesDescription.ts";
import { LithologicalDescription } from "../../lithologicalDescription.ts";
import { Lithology } from "../../lithology.ts";

// TODO: What does this mean when building the depth layers?
// Sort by fromDepth, tie-breaking on toDepth, then clamp toDepth to the next item's fromDepth wherever they overlap.
// Operates on server-loaded layers — boundaries are always real numbers; nulls are treated as 0 defensively.
const cleanupOverlaps = <T extends BaseLayer>(items: T[]): T[] => {
  const sorted = items
    .map(item => ({ ...item }))
    .sort((a, b) => (a.fromDepth ?? 0) - (b.fromDepth ?? 0) || (a.toDepth ?? 0) - (b.toDepth ?? 0));
  for (let i = 0; i < sorted.length - 1; i++) {
    if ((sorted[i].toDepth ?? 0) > (sorted[i + 1].fromDepth ?? 0)) {
      sorted[i].toDepth = sorted[i + 1].fromDepth;
      sorted[i].isAutoCorrected = true;
    }
  }
  return sorted;
};

export const createEmptyLithology = (
  fromDepth: number | null,
  toDepth: number | null,
  stratigraphyId: number,
  inheritedUnconsolidated?: boolean | null,
  autoCorrected?: boolean | null,
): Lithology => ({
  id: 0,
  stratigraphyId,
  fromDepth,
  toDepth,
  isUnconsolidated: inheritedUnconsolidated ?? null,
  hasBedding: false,
  isAutoCorrected: autoCorrected ?? true,
});

// Fill gaps between lithologies and extend coverage to match description ranges with empty
// autocorrected lithologies. Existing lithologies are never resized; we only add new ones.
// Every emergent depth row (driven by description boundaries that fall inside the gap) gets
// its own placeholder lithology so the lithology column stays one-lithology-per-depth-row.
const fillLithologyGaps = (
  lithologies: Lithology[],
  otherBoundaries: number[],
  stratigraphyId: number,
): Lithology[] => {
  const result: Lithology[] = [...lithologies];
  const sortedBoundaries = [...new Set(otherBoundaries)].sort((a, b) => a - b);

  // Produce one empty lithology per inter-boundary segment that falls inside `[from, to]`.
  const fillRange = (from: number, to: number, isUnconsolidated?: boolean | null): Lithology[] => {
    const cuts = [from, ...sortedBoundaries.filter(b => b > from && b < to), to];
    const fillers: Lithology[] = [];
    for (let i = 0; i < cuts.length - 1; i++) {
      fillers.push(createEmptyLithology(cuts[i], cuts[i + 1], stratigraphyId, isUnconsolidated));
    }
    return fillers;
  };

  // TODO: Is this correct?
  // Operates on server-loaded lithologies — boundaries are real numbers; nulls treated as 0.
  if (sortedBoundaries.length > 0) {
    const minBoundary = sortedBoundaries[0];
    const maxBoundary = sortedBoundaries.at(-1)!;

    if (result.length === 0) {
      result.push(...fillRange(minBoundary, maxBoundary));
    } else {
      const firstFrom = result[0].fromDepth ?? 0;
      if (minBoundary < firstFrom) {
        result.unshift(...fillRange(minBoundary, firstFrom));
      }
      const last = result.at(-1)!;
      const lastTo = last.toDepth ?? 0;
      if (maxBoundary > lastTo) {
        result.push(...fillRange(lastTo, maxBoundary, last.isUnconsolidated));
      }
    }
  }

  // Fill any remaining gaps between existing lithologies, also split by description boundaries.
  for (let i = 0; i < result.length - 1; i++) {
    const currTo = result[i].toDepth ?? 0;
    const nextFrom = result[i + 1].fromDepth ?? 0;
    if (nextFrom > currTo) {
      const fillers = fillRange(currTo, nextFrom, result[i].isUnconsolidated);
      result.splice(i + 1, 0, ...fillers);
      i += fillers.length;
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
      // Server-loaded items here — null boundaries are skipped defensively (shouldn't occur).
      if (item.fromDepth === null || item.toDepth === null) continue;
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
  // TODO: What does this mean?
  // Called from `getInitialDepthLayers` against server data, which never has unset boundaries.
  // Skip any null-bounded layers/depths defensively to keep the comparisons total.
  const concreteLayers = depthLayers.filter(
    (l): l is DepthLayer & { fromDepth: number; toDepth: number } => l.fromDepth !== null && l.toDepth !== null,
  );
  for (const item of items) {
    if (item.fromDepth === null || item.toDepth === null) continue;
    const itemFrom = item.fromDepth;
    const itemTo = item.toDepth;
    if (itemFrom === itemTo) {
      item.depthIds = concreteLayers.filter(l => l.fromDepth === itemFrom && l.toDepth === itemFrom).map(l => l.id);
    } else {
      item.depthIds = concreteLayers
        .filter(l => {
          if (l.fromDepth < l.toDepth) {
            return l.fromDepth >= itemFrom && l.toDepth <= itemTo;
          }
          return l.fromDepth > itemFrom && l.fromDepth < itemTo;
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
  const bothSidesFlagged = new Set<string>();
  const fromDepthOnly = new Set<string>();
  const toDepthOnly = new Set<string>();

  for (const layer of depthLayers) {
    if (layer.fromDepth === null) fromDepthOnly.add(layer.id);
    if (layer.toDepth === null) toDepthOnly.add(layer.id);
    if (layer.fromDepth !== null && layer.toDepth !== null && layer.fromDepth >= layer.toDepth) {
      bothSidesFlagged.add(layer.id);
    }
  }

  // Layers belonging to a lithology that spans more than one layer
  for (const lithology of lithologies) {
    if ((lithology.depthIds?.length ?? 0) > 1) {
      for (const depthId of lithology.depthIds!) {
        bothSidesFlagged.add(depthId);
      }
    }
  }

  return depthLayers.map(layer => ({
    ...layer,
    hasFromDepthError: bothSidesFlagged.has(layer.id) || fromDepthOnly.has(layer.id),
    hasToDepthError: bothSidesFlagged.has(layer.id) || toDepthOnly.has(layer.id),
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
  // TODO: What does this mean?
  // Boundaries from server data are real numbers; drop any nulls defensively.
  const descriptionBoundaries: number[] = [
    ...cleanLithologicalDescriptions.flatMap(d => [d.fromDepth, d.toDepth]),
    ...cleanFaciesDescriptions.flatMap(d => [d.fromDepth, d.toDepth]),
  ].filter((b): b is number => b !== null);
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
