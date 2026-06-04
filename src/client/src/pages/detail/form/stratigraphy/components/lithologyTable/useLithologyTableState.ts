import { useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  BaseLayer,
  DepthLayer,
  DescriptionKind,
  FaciesDescription,
  LithologicalDescription,
  Lithology,
} from "../../stratigraphy.ts";
import {
  createEmptyLithology,
  flagErrors,
  getInitialDepthLayers,
  mergeAdjacentDepths,
  removeDepthIdReferences,
} from "./lithologyTableUtils.ts";

export type DepthDeleteAction = "extendLower" | "extendUpper" | "reduceEnd" | "increaseStart";
export type DepthInsertPosition = "before" | "after";

export interface LithologyTableStateOptions {
  mergeDepthsOnDescriptionResize?: boolean;
}

export interface LithologyTableState {
  depths: DepthLayer[];
  tmpLithologies: Lithology[];
  tmpLithologicalDescriptions: LithologicalDescription[];
  tmpFaciesDescriptions: FaciesDescription[];
  stratigraphyId: number;

  updateDepthBoundaries: (depthId: string, side: "from" | "to", newValue: number | null) => void;
  handleAddDepthLayer: () => void;
  handleInsertDepthRow: (adjacentDepthId: string, position: DepthInsertPosition) => void;
  handleDeleteDepthLayer: (depthId: string, action: DepthDeleteAction) => void;
  handleDeleteDescription: (kind: DescriptionKind, index: number) => void;
  updateTmpLithology: (updated: Lithology, hasChanges: boolean) => void;
  updateTmpLithologicalDescription: (updated: LithologicalDescription, hasChanges: boolean) => void;
  updateTmpFaciesDescription: (updated: FaciesDescription, hasChanges: boolean) => void;

  resizeDescription: (kind: DescriptionKind, index: number, newFromDepth: number, newToDepth: number) => void;

  hasErrors: boolean;
  hasUnsavedChanges: boolean;
  reset: () => void;
}

export const useLithologyTableState = (
  initialLithologies: Lithology[],
  initialLithologicalDescriptions: LithologicalDescription[],
  initialFaciesDescriptions: FaciesDescription[],
  stratigraphyId: number,
  options: LithologyTableStateOptions = {},
): LithologyTableState => {
  const { mergeDepthsOnDescriptionResize = false } = options;
  const [depths, setDepths] = useState<DepthLayer[]>([]);
  const [tmpLithologies, setTmpLithologies] = useState<Lithology[]>([]);
  const [tmpLithologicalDescriptions, setTmpLithologicalDescriptions] = useState<LithologicalDescription[]>([]);
  const [tmpFaciesDescriptions, setTmpFaciesDescriptions] = useState<FaciesDescription[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [seededInputHash, setSeededInputHash] = useState<string | null>(null);

  const baselineRef = useRef({
    lithologies: "[]",
    lithologicalDescriptions: "[]",
    faciesDescriptions: "[]",
  });

  const seedInputHash = useMemo(
    () =>
      JSON.stringify([initialLithologies, initialLithologicalDescriptions, initialFaciesDescriptions, stratigraphyId]),
    [initialLithologies, initialLithologicalDescriptions, initialFaciesDescriptions, stratigraphyId],
  );

  const seed = () => {
    const { cleanDepths, cleanLithologies, cleanLithologicalDescriptions, cleanFaciesDescriptions } =
      getInitialDepthLayers(
        initialLithologies,
        initialLithologicalDescriptions,
        initialFaciesDescriptions,
        stratigraphyId,
      );
    baselineRef.current = {
      lithologies: JSON.stringify(cleanLithologies),
      lithologicalDescriptions: JSON.stringify(cleanLithologicalDescriptions),
      faciesDescriptions: JSON.stringify(cleanFaciesDescriptions),
    };
    setDepths(cleanDepths);
    setTmpLithologies(cleanLithologies);
    setTmpLithologicalDescriptions(cleanLithologicalDescriptions);
    setTmpFaciesDescriptions(cleanFaciesDescriptions);
    setHasUnsavedChanges(cleanLithologies.some(l => l.isAutoCorrected));
  };

  if (seedInputHash !== seededInputHash) {
    setSeededInputHash(seedInputHash);
    seed();
  }

  const commitChanges = (
    newDepths: DepthLayer[],
    newLithologies: Lithology[],
    newLithologicalDescriptions: LithologicalDescription[],
    newFaciesDescriptions: FaciesDescription[],
  ) => {
    const newLithologiesJson = JSON.stringify(newLithologies);
    const newLithologicalDescriptionsJson = JSON.stringify(newLithologicalDescriptions);
    const newFaciesDescriptionsJson = JSON.stringify(newFaciesDescriptions);

    const depthsChanged = JSON.stringify(newDepths) !== JSON.stringify(depths);
    const lithologiesChanged = newLithologiesJson !== JSON.stringify(tmpLithologies);
    const lithologicalDescriptionsChanged =
      newLithologicalDescriptionsJson !== JSON.stringify(tmpLithologicalDescriptions);
    const faciesDescriptionsChanged = newFaciesDescriptionsJson !== JSON.stringify(tmpFaciesDescriptions);

    if (!depthsChanged && !lithologiesChanged && !lithologicalDescriptionsChanged && !faciesDescriptionsChanged) {
      return;
    }

    if (depthsChanged) setDepths(newDepths);
    if (lithologiesChanged) setTmpLithologies(newLithologies);
    if (lithologicalDescriptionsChanged) setTmpLithologicalDescriptions(newLithologicalDescriptions);
    if (faciesDescriptionsChanged) setTmpFaciesDescriptions(newFaciesDescriptions);

    const matchesBaseline =
      newLithologiesJson === baselineRef.current.lithologies &&
      newLithologicalDescriptionsJson === baselineRef.current.lithologicalDescriptions &&
      newFaciesDescriptionsJson === baselineRef.current.faciesDescriptions;
    setHasUnsavedChanges(!matchesBaseline);
  };

  const updateDepthBoundaries = (depthId: string, side: "from" | "to", newValue: number | null) => {
    const primaryIndex = depths.findIndex(d => d.id === depthId);
    if (primaryIndex < 0) return;
    const primary = depths[primaryIndex];
    const oldValue = side === "from" ? primary.fromDepth : primary.toDepth;
    if (oldValue === newValue) return;

    const sideUpdates = new Map<string, "from" | "to">();
    sideUpdates.set(depthId, side);

    // Bring the immediately adjacent depth layer along on the opposite side, since it shares the boundary.
    if (side === "to") {
      const next = depths[primaryIndex + 1];
      if (next && next.fromDepth === oldValue) sideUpdates.set(next.id, "from");
    } else {
      const prev = depths[primaryIndex - 1];
      if (prev && prev.toDepth === oldValue) sideUpdates.set(prev.id, "to");
    }

    // Update depth layers
    const newDepths = depths.map(d => {
      const updSide = sideUpdates.get(d.id);
      if (!updSide) return d;
      return updSide === "from" ? { ...d, fromDepth: newValue } : { ...d, toDepth: newValue };
    });

    // Update data layers
    const propagate = <T extends BaseLayer>(items: T[]): T[] =>
      items.map(item => {
        if (!item.depthIds || item.depthIds.length === 0) return item;
        let newFromDepth = item.fromDepth;
        let newToDepth = item.toDepth;
        let changed = false;
        for (const id of item.depthIds) {
          const updSide = sideUpdates.get(id);
          if (!updSide) continue;
          // Transitioning from `null` = the user just filled in a previously unset boundary.
          // The owning lithology/description has a numeric placeholder — overwrite directly.
          if (updSide === "from" && (oldValue === null || item.fromDepth === oldValue)) {
            newFromDepth = newValue;
            changed = true;
          } else if (updSide === "to" && (oldValue === null || item.toDepth === oldValue)) {
            newToDepth = newValue;
            changed = true;
          }
        }
        if (!changed) return item;
        return { ...item, fromDepth: newFromDepth, toDepth: newToDepth };
      });

    const newLithologies = propagate(tmpLithologies);
    const newLithologicalDescriptions = propagate(tmpLithologicalDescriptions);
    const newFaciesDescriptions = propagate(tmpFaciesDescriptions);

    commitChanges(
      flagErrors(newDepths, newLithologies),
      newLithologies,
      newLithologicalDescriptions,
      newFaciesDescriptions,
    );
  };

  const handleInsertDepthRow = (parentDepthId: string, position: DepthInsertPosition) => {
    const parentIndex = depths.findIndex(d => d.id === parentDepthId);
    if (parentIndex < 0) return;
    const parent = depths[parentIndex];
    const insertIndex = position === "before" ? parentIndex : parentIndex + 1;
    const sharedBoundary: number | null = position === "before" ? parent.fromDepth : parent.toDepth;
    const isAppendAtEnd = position === "after" && parentIndex === depths.length - 1;

    const aboveId = insertIndex > 0 ? depths[insertIndex - 1].id : null;
    const belowId = insertIndex < depths.length ? depths[insertIndex].id : null;

    const newDepthLayer: DepthLayer = {
      id: uuidv4(),
      fromDepth: sharedBoundary,
      toDepth: isAppendAtEnd ? null : sharedBoundary,
    };
    const aboveLithology = aboveId ? tmpLithologies.find(l => l.depthIds?.includes(aboveId)) : undefined;
    const newLithology: Lithology = {
      ...createEmptyLithology(
        newDepthLayer.fromDepth,
        newDepthLayer.toDepth,
        stratigraphyId,
        aboveLithology?.isUnconsolidated ?? true,
        false,
      ),
      depthIds: [newDepthLayer.id],
    };

    const newDepths = [...depths.slice(0, insertIndex), newDepthLayer, ...depths.slice(insertIndex)];
    const newLithologies = [...tmpLithologies, newLithology];

    const depthOrder = new Map<string, number>();
    newDepths.forEach((d, i) => depthOrder.set(d.id, i));
    const compareByDepthOrder = (a: string, b: string) =>
      (depthOrder.get(a) ?? Infinity) - (depthOrder.get(b) ?? Infinity);

    const extendIfSpanning = <T extends BaseLayer>(items: T[]): T[] =>
      items.map(item => {
        const ids = item.depthIds;
        if (!ids || !aboveId || !belowId) return item;
        if (!ids.includes(aboveId) || !ids.includes(belowId)) return item;
        const newIds = [...ids, newDepthLayer.id].sort(compareByDepthOrder);
        return { ...item, depthIds: newIds };
      });

    const newLithologicalDescriptions = extendIfSpanning(tmpLithologicalDescriptions);
    const newFaciesDescriptions = extendIfSpanning(tmpFaciesDescriptions);

    commitChanges(
      flagErrors(newDepths, newLithologies),
      newLithologies,
      newLithologicalDescriptions,
      newFaciesDescriptions,
    );
  };

  const handleAddDepthLayer = () => {
    const lastDepth = depths.at(-1);
    if (lastDepth) {
      handleInsertDepthRow(lastDepth.id, "after");
      return;
    }
    const newDepthLayer: DepthLayer = { id: uuidv4(), fromDepth: null, toDepth: null };
    const newLithology: Lithology = {
      ...createEmptyLithology(newDepthLayer.fromDepth, newDepthLayer.toDepth, stratigraphyId, true, false),
      depthIds: [newDepthLayer.id],
    };
    commitChanges(
      flagErrors([newDepthLayer], [newLithology]),
      [newLithology],
      tmpLithologicalDescriptions,
      tmpFaciesDescriptions,
    );
  };

  const handleDeleteDepthLayer = (depthId: string, action: DepthDeleteAction) => {
    if (depths.length === 1) {
      commitChanges([], [], [], []);
      return;
    }

    const index = depths.findIndex(d => d.id === depthId);
    if (index < 0) return;
    const depthLayerToDelete = depths[index];
    let depthLayerToUpdate: DepthLayer | null = null;
    if (action === "extendUpper") depthLayerToUpdate = depths[index - 1];
    else if (action === "extendLower") depthLayerToUpdate = depths[index + 1];

    const updatedDepthLayers = depths.flatMap((d, i) => {
      if (i === index) return [];
      if (action === "extendLower" && i === index + 1) return [{ ...d, fromDepth: depthLayerToDelete.fromDepth }];
      if (action === "extendUpper" && i === index - 1) return [{ ...d, toDepth: depthLayerToDelete.toDepth }];
      return [{ ...d }];
    });

    // Remove layers that completely match deleted depth layer
    const matchesDeletedDepths = <T extends BaseLayer>(item: T) =>
      item.depthIds?.includes(depthLayerToDelete.id) &&
      item.fromDepth === depthLayerToDelete.fromDepth &&
      item.toDepth === depthLayerToDelete.toDepth;

    const updateItem = <T extends BaseLayer>(item: T): T => {
      const newDepthIds = item.depthIds?.filter(id => id !== depthLayerToDelete.id);
      const refsUpdated = !!depthLayerToUpdate && !!item.depthIds?.includes(depthLayerToUpdate.id);
      const refsDeleted = !!item.depthIds?.includes(depthLayerToDelete.id);

      // Stretch items that referenced the surviving (updated) depth layer so their boundary
      // follows the layer's new edge into the deleted layer's range.
      if (refsUpdated && action === "extendUpper" && item.toDepth === depthLayerToUpdate!.toDepth) {
        return { ...item, toDepth: depthLayerToDelete.toDepth, depthIds: newDepthIds };
      }
      if (refsUpdated && action === "extendLower" && item.fromDepth === depthLayerToUpdate!.fromDepth) {
        return { ...item, fromDepth: depthLayerToDelete.fromDepth, depthIds: newDepthIds };
      }

      // Shift items that referenced the deleted depth layer whose boundary sat on the
      // disappearing edge — drag it onto the remaining edge.
      if (
        refsDeleted &&
        (action === "extendUpper" || action === "increaseStart") &&
        item.fromDepth === depthLayerToDelete.fromDepth
      ) {
        return { ...item, fromDepth: depthLayerToDelete.toDepth, depthIds: newDepthIds };
      }
      if (
        refsDeleted &&
        (action === "extendLower" || action === "reduceEnd") &&
        item.toDepth === depthLayerToDelete.toDepth
      ) {
        return { ...item, toDepth: depthLayerToDelete.fromDepth, depthIds: newDepthIds };
      }

      // Keep items unrelated to the deleted or updated depth layers unchanged
      if (newDepthIds?.length === item.depthIds?.length) return item;
      return { ...item, depthIds: newDepthIds };
    };

    const newLithologies = tmpLithologies.filter(l => !matchesDeletedDepths(l)).map(updateItem);
    const newLithologicalDescriptions = tmpLithologicalDescriptions
      .filter(d => !matchesDeletedDepths(d))
      .map(updateItem);
    const newFaciesDescriptions = tmpFaciesDescriptions.filter(d => !matchesDeletedDepths(d)).map(updateItem);

    commitChanges(
      flagErrors(updatedDepthLayers, newLithologies),
      newLithologies,
      newLithologicalDescriptions,
      newFaciesDescriptions,
    );
  };

  const handleDeleteDescription = (kind: DescriptionKind, index: number) => {
    const list = kind === "lithological" ? tmpLithologicalDescriptions : tmpFaciesDescriptions;
    if (index < 0 || index >= list.length) return;
    const deletedItem = list[index];
    const trimmed = [...list.slice(0, index), ...list.slice(index + 1)];
    const newLithologicalDescriptions = kind === "lithological" ? trimmed : tmpLithologicalDescriptions;
    const newFaciesDescriptions = kind === "facies" ? trimmed : tmpFaciesDescriptions;

    // Exact (fromDepth-toDepth) ranges still claimed by some remaining item.
    const ownedRanges = new Set<string>();
    for (const items of [tmpLithologies, newLithologicalDescriptions, newFaciesDescriptions] as BaseLayer[][]) {
      for (const item of items) {
        ownedRanges.add(`${item.fromDepth}-${item.toDepth}`);
      }
    }

    // Merge candidates: depth layers the deleted item referenced whose range is no longer owned (no remaining item has matching fromDepth+toDepth).
    const candidates = new Set<string>();
    for (const id of deletedItem.depthIds ?? []) {
      const depth = depths.find(d => d.id === id);
      if (depth && !ownedRanges.has(`${depth.fromDepth}-${depth.toDepth}`)) {
        candidates.add(id);
      }
    }

    const { depths: mergedDepths, mergedIds } = mergeAdjacentDepths(depths, candidates);

    const updatedLithologies = removeDepthIdReferences(tmpLithologies, mergedIds);
    const updatedLithologicalDescriptions = removeDepthIdReferences(newLithologicalDescriptions, mergedIds);
    const updatedFaciesDescriptions = removeDepthIdReferences(newFaciesDescriptions, mergedIds);

    commitChanges(
      flagErrors(mergedDepths, updatedLithologies),
      updatedLithologies,
      updatedLithologicalDescriptions,
      updatedFaciesDescriptions,
    );
  };

  const mergeModalUpdate = <T extends BaseLayer>(tmpItems: T[], updated: T): T[] => {
    const depthIdsKey = JSON.stringify(updated.depthIds ?? []);
    const idx = tmpItems.findIndex(
      item =>
        item.fromDepth === updated.fromDepth &&
        item.toDepth === updated.toDepth &&
        JSON.stringify(item.depthIds ?? []) === depthIdsKey,
    );
    if (idx >= 0) return tmpItems.map((item, i) => (i === idx ? updated : item));

    const depthOrder = new Map<string, number>();
    depths.forEach((d, i) => depthOrder.set(d.id, i));
    const firstDepthIdx = (item: T) =>
      Math.min(...(item.depthIds?.map(id => depthOrder.get(id) ?? Infinity) ?? [Infinity]));
    return [...tmpItems, updated].sort((a, b) => firstDepthIdx(a) - firstDepthIdx(b));
  };

  const updateTmpLithology = (updated: Lithology, hasChanges: boolean) => {
    if (!hasChanges) return;
    const newLithologies = mergeModalUpdate(tmpLithologies, updated);
    commitChanges(depths, newLithologies, tmpLithologicalDescriptions, tmpFaciesDescriptions);
  };

  const updateTmpLithologicalDescription = (updated: LithologicalDescription, hasChanges: boolean) => {
    if (!hasChanges) return;
    const newDescs = mergeModalUpdate(tmpLithologicalDescriptions, updated);
    commitChanges(depths, tmpLithologies, newDescs, tmpFaciesDescriptions);
  };

  const updateTmpFaciesDescription = (updated: FaciesDescription, hasChanges: boolean) => {
    if (!hasChanges) return;
    const newDescs = mergeModalUpdate(tmpFaciesDescriptions, updated);
    commitChanges(depths, tmpLithologies, tmpLithologicalDescriptions, newDescs);
  };

  const resizeDescription = (kind: DescriptionKind, index: number, newFromDepth: number, newToDepth: number) => {
    const list = kind === "lithological" ? tmpLithologicalDescriptions : tmpFaciesDescriptions;
    if (index < 0 || index >= list.length) return;
    if (newFromDepth >= newToDepth) return;
    const current = list[index];
    if (current.fromDepth === newFromDepth && current.toDepth === newToDepth) return;

    // Determine which depth rows fall fully inside the new range (mirrors assignDepthIds).
    const candidateDepths = depths.filter(d => {
      if (d.fromDepth === null || d.toDepth === null) return false;
      if (d.fromDepth === d.toDepth) return d.fromDepth > newFromDepth && d.fromDepth < newToDepth;
      return d.fromDepth >= newFromDepth && d.toDepth <= newToDepth;
    });

    // Reject if any candidate depth row is owned by ANOTHER item in the same description column. (Same-column conflict only — descriptions are allowed to overlap lithologies.)
    const otherItems = list.filter((_, i) => i !== index);
    const conflict = candidateDepths.some(d => otherItems.some(o => o.depthIds?.includes(d.id)));
    if (conflict) return;

    const updated = {
      ...current,
      fromDepth: newFromDepth,
      toDepth: newToDepth,
      depthIds: candidateDepths.map(d => d.id),
    };
    const newList = list.map((item, i) => (i === index ? updated : item));
    let newLithologicalDescriptions = kind === "lithological" ? newList : tmpLithologicalDescriptions;
    let newFaciesDescriptions = kind === "facies" ? newList : tmpFaciesDescriptions;
    let newDepths = depths;
    let newLithologies = tmpLithologies;

    if (mergeDepthsOnDescriptionResize && candidateDepths.length > 1) {
      const survivorId = candidateDepths[0].id;
      const candidatesToMerge = new Set(candidateDepths.slice(1).map(d => d.id));
      const merged = mergeAdjacentDepths(depths, candidatesToMerge);
      newDepths = merged.depths;
      const mergedIds = merged.mergedIds;
      const survivorDepth = newDepths.find(d => d.id === survivorId);
      const isMerged = (id: string) => mergedIds.has(id);
      const isNotMerged = (id: string) => !mergedIds.has(id);

      // Drop placeholder lithologies whose only depthId was merged away; extend the survivor's toDepth.
      newLithologies = tmpLithologies
        .filter(l => {
          const ids = l.depthIds;
          if (!ids || ids.length === 0) return true;
          // Keep if at least one depthId is not merged (covers the survivor and unrelated rows).
          return ids.some(isNotMerged);
        })
        .map(l => {
          if (!l.depthIds?.includes(survivorId)) return l;
          return {
            ...l,
            toDepth: survivorDepth?.toDepth ?? l.toDepth,
            depthIds: [survivorId],
          };
        });

      // Resized description now points only to the survivor row; other items in either column
      // get any merged depthIds stripped so refs stay valid.
      const cleanItems = <T extends BaseLayer>(items: T[], isResizedColumn: boolean): T[] =>
        items.map((item, i) => {
          if (isResizedColumn && i === index) {
            return { ...item, depthIds: [survivorId] };
          }
          if (!item.depthIds?.some(isMerged)) return item;
          return { ...item, depthIds: item.depthIds.filter(isNotMerged) };
        });

      newLithologicalDescriptions = cleanItems(newLithologicalDescriptions, kind === "lithological");
      newFaciesDescriptions = cleanItems(newFaciesDescriptions, kind === "facies");
    }

    commitChanges(
      flagErrors(newDepths, newLithologies),
      newLithologies,
      newLithologicalDescriptions,
      newFaciesDescriptions,
    );
  };

  const hasErrors = depths.some(d => d.hasFromDepthError || d.hasToDepthError);

  return {
    depths,
    tmpLithologies,
    tmpLithologicalDescriptions,
    tmpFaciesDescriptions,
    stratigraphyId,
    updateDepthBoundaries,
    handleAddDepthLayer,
    handleInsertDepthRow,
    handleDeleteDepthLayer,
    handleDeleteDescription,
    updateTmpLithology,
    updateTmpLithologicalDescription,
    updateTmpFaciesDescription,
    resizeDescription,
    hasErrors,
    hasUnsavedChanges,
    reset: seed,
  };
};
