import { v4 as uuidv4 } from "uuid";
import { BaseLayer, DepthLayer, FaciesDescription, LithologicalDescription, Lithology } from "../../stratigraphy.ts";

const hasDepths = <T extends BaseLayer>(item: T): boolean => item.fromDepth !== null && item.toDepth !== null;

// Sort and clamp overlaps among fully-depthed items. Items whose depth extraction failed (a null
// from/to) can't be ordered by depth, so they stay pinned at their original index to preserve the
// extraction sequence; only the fully-depthed items around them are sorted and clamped (incoming
// depths are assumed already sorted).
const cleanupOverlaps = <T extends BaseLayer>(items: T[]): T[] => {
  const copies = items.map(item => ({ ...item }));
  const depthed = copies.filter(hasDepths).sort((a, b) => a.fromDepth! - b.fromDepth! || a.toDepth! - b.toDepth!);
  for (let i = 0; i < depthed.length - 1; i++) {
    if (depthed[i].toDepth! > depthed[i + 1].fromDepth!) {
      depthed[i].toDepth = depthed[i + 1].fromDepth;
      depthed[i].isAutoCorrected = true;
    }
  }
  let next = 0;
  return copies.map(item => (hasDepths(item) ? depthed[next++] : item));
};

// Spans between two fully-depthed items (in extraction order) that have one or more failed-depth
// items sequenced between them. Such a span is occupied by those failed layers, so it must not be
// treated as a fillable gap or bridged into a contiguous depth row.
const collectOccupiedGaps = <T extends BaseLayer>(items: T[]): Array<[number, number]> => {
  const gaps: Array<[number, number]> = [];
  let above: T | undefined;
  let failedBetween = false;
  for (const item of items) {
    if (hasDepths(item)) {
      if (above && failedBetween && above.toDepth! < item.fromDepth!) {
        gaps.push([above.toDepth!, item.fromDepth!]);
      }
      above = item;
      failedBetween = false;
    } else {
      failedBetween = true;
    }
  }
  return gaps;
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
  occupiedGapKeys: Set<string>,
): Lithology[] => {
  const result: Lithology[] = [...lithologies];
  const sortedBoundaries = [...new Set(otherBoundaries)].sort((a, b) => a - b);

  // Produce one empty lithology per inter-boundary segment that falls inside `[from, to]`, skipping
  // any segment that is occupied by failed-depth layers (those become their own null rows instead).
  const fillRange = (from: number, to: number, isUnconsolidated?: boolean | null): Lithology[] => {
    const cuts = [from, ...sortedBoundaries.filter(b => b > from && b < to), to];
    const fillers: Lithology[] = [];
    for (let i = 0; i < cuts.length - 1; i++) {
      if (occupiedGapKeys.has(`${cuts[i]}-${cuts[i + 1]}`)) continue;
      fillers.push(createEmptyLithology(cuts[i], cuts[i + 1], stratigraphyId, isUnconsolidated));
    }
    return fillers;
  };

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

// Build depth layers from the union of all distinct boundary values, inserting a zero-thickness layer
// at each point where an item has fromDepth === toDepth. Spans occupied by failed-depth layers are
// not bridged into a contiguous row; those layers get their own null rows in insertNullDepthRows.
const buildDepthLayers = (
  lithologies: Lithology[],
  lithologicalDescriptions: LithologicalDescription[],
  faciesDescriptions: FaciesDescription[],
  occupiedGapKeys: Set<string>,
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
    if (i < boundaries.length - 1 && !occupiedGapKeys.has(`${boundaries[i]}-${boundaries[i + 1]}`)) {
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
  const definedLayers = depthLayers.filter(
    (l): l is DepthLayer & { fromDepth: number; toDepth: number } => l.fromDepth !== null && l.toDepth !== null,
  );
  for (const item of items) {
    if (item.fromDepth === null || item.toDepth === null) continue;
    const itemFrom = item.fromDepth;
    const itemTo = item.toDepth;
    if (itemFrom === itemTo) {
      item.depthIds = definedLayers.filter(l => l.fromDepth === itemFrom && l.toDepth === itemFrom).map(l => l.id);
    } else {
      item.depthIds = definedLayers
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

// The bottom-most depth row of the nearest sibling above `index` that already owns one, used as
// the splice anchor so a failed-depth row lands directly below its predecessor.
const lastDepthIdBefore = <T extends BaseLayer>(items: T[], index: number): string | null => {
  for (let i = index - 1; i >= 0; i--) {
    const last = items[i].depthIds?.at(-1);
    if (last != null) return last;
  }
  return null;
};

// Failed depth extraction: an item with a null from/to gets no boundary-based depth layer (those
// are built only from fully-depthed items). Give each such item its own placeholder depth row,
// spliced in directly after its preceding sibling so the original extraction order is preserved
// instead of all failed rows piling up at the bottom (incoming depths are assumed already sorted).
// The depth rows render as a contiguous chain (each row's toDepth is the next row's fromDepth), so a
// failed layer inherits the boundary it shares with its immediate neighbours: the previous row's
// toDepth above and the next row's fromDepth below. Against a depthed neighbour that boundary is the
// known edge; between two failed layers it is null. This keeps a run of failed layers connected to
// the surrounding depthed layers (the trailing layer's start depth still renders) instead of
// detaching into stray null rows. A partially-failed layer keeps its known side. The item's own
// depths stay in sync with the row so edits propagate, and flagErrors marks the null boundaries.
const insertNullDepthRows = <T extends BaseLayer>(items: T[], depthLayers: DepthLayer[]) => {
  items.forEach((item, index) => {
    if (hasDepths(item)) return;
    const precedingDepthId = lastDepthIdBefore(items, index);

    if (item.fromDepth === null && item.toDepth === null) {
      const prev = items[index - 1];
      const next = items[index + 1];
      item.fromDepth = prev ? prev.toDepth : null;
      item.toDepth = next ? next.fromDepth : null;
    }

    const placeholder: DepthLayer = { id: uuidv4(), fromDepth: item.fromDepth, toDepth: item.toDepth };
    item.depthIds = [placeholder.id];

    const anchorIndex = precedingDepthId ? depthLayers.findIndex(d => d.id === precedingDepthId) : -1;
    depthLayers.splice(anchorIndex + 1, 0, placeholder);
  });
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

export const prepareDataForSubmit = <T extends BaseLayer>(item: T): T => {
  const copy = { ...item } as T & { depthIds?: unknown; isAutoCorrected?: unknown };
  delete copy.depthIds;
  delete copy.isAutoCorrected;
  return copy;
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

// Every depth row needs a lithology: the lithology column is the primary one and renders a gap
// wherever no lithology owns the row. The failed-depth placeholder rows belong only to a
// description/facies, so synthesise an empty lithology for each row no lithology owns yet. The
// result follows depth-row order and each new lithology inherits the consolidation state of the
// row above it.
const deriveEmptyLithologies = (
  lithologies: Lithology[],
  depthLayers: DepthLayer[],
  stratigraphyId: number,
): Lithology[] => {
  const lithologyByDepthId = new Map<string, Lithology>();
  for (const lithology of lithologies) {
    for (const id of lithology.depthIds ?? []) lithologyByDepthId.set(id, lithology);
  }

  const result: Lithology[] = [];
  const placed = new Set<Lithology>();
  let previous: Lithology | undefined;
  for (const row of depthLayers) {
    const owner = lithologyByDepthId.get(row.id);
    if (owner) {
      if (!placed.has(owner)) {
        placed.add(owner);
        result.push(owner);
        previous = owner;
      }
      continue;
    }
    const empty: Lithology = {
      ...createEmptyLithology(row.fromDepth, row.toDepth, stratigraphyId, previous?.isUnconsolidated ?? null),
      depthIds: [row.id],
    };
    result.push(empty);
    previous = empty;
  }
  return result;
};

export const getInitialDepthLayers = (
  lithologies: Lithology[],
  lithologicalDescriptions: LithologicalDescription[],
  faciesDescriptions: FaciesDescription[],
  stratigraphyId: number,
) => {
  // Per-column overlap cleanup (sort by fromDepth then toDepth, clamp overlaps).
  const cleanLithologicalDescriptions = cleanupOverlaps(lithologicalDescriptions);
  const cleanFaciesDescriptions = cleanupOverlaps(faciesDescriptions);
  let cleanLithologies = cleanupOverlaps(lithologies);

  // Spans that failed-depth layers occupy between two fully-depthed siblings; these must not be
  // filled or bridged, so the failed layers can surface as their own null rows in that position.
  const occupiedGapKeys = new Set<string>(
    [
      ...collectOccupiedGaps(cleanLithologies),
      ...collectOccupiedGaps(cleanLithologicalDescriptions),
      ...collectOccupiedGaps(cleanFaciesDescriptions),
    ].map(([from, to]) => `${from}-${to}`),
  );

  // Fill gaps in the lithology column with empty, autocorrected lithologies; extend coverage to description range.
  const descriptionBoundaries: number[] = [
    ...cleanLithologicalDescriptions.flatMap(d => [d.fromDepth, d.toDepth]),
    ...cleanFaciesDescriptions.flatMap(d => [d.fromDepth, d.toDepth]),
  ].filter((b): b is number => b !== null);
  cleanLithologies = fillLithologyGaps(cleanLithologies, descriptionBoundaries, stratigraphyId, occupiedGapKeys);

  // Build depth layers from the union of all distinct boundaries.
  const depthLayers = buildDepthLayers(
    cleanLithologies,
    cleanLithologicalDescriptions,
    cleanFaciesDescriptions,
    occupiedGapKeys,
  );

  // Assign depthIds to every item.
  assignDepthIds(cleanLithologies, depthLayers);
  assignDepthIds(cleanLithologicalDescriptions, depthLayers);
  assignDepthIds(cleanFaciesDescriptions, depthLayers);

  // Add placeholder rows for items whose depth extraction failed (null from/to) so they
  // remain visible and editable instead of being silently dropped from the rendered table.
  insertNullDepthRows(cleanLithologies, depthLayers);
  insertNullDepthRows(cleanLithologicalDescriptions, depthLayers);
  insertNullDepthRows(cleanFaciesDescriptions, depthLayers);

  // Derive empty lithologies for the failed-depth placeholder rows so the lithology column
  // stays aligned with every depth row (including those that came only from a description/facies).
  cleanLithologies = deriveEmptyLithologies(cleanLithologies, depthLayers, stratigraphyId);

  // Flag errors: zero-thickness depth layers and depth layers belonging to a lithology that spans more than one.
  const flaggedDepthLayers = flagErrors(depthLayers, cleanLithologies);

  return {
    cleanDepths: flaggedDepthLayers,
    cleanLithologies,
    cleanLithologicalDescriptions,
    cleanFaciesDescriptions,
  };
};
