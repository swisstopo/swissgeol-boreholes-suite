import { MouseEvent, RefObject, useEffect, useRef, useState } from "react";
import { useLatestRef } from "../../../../../../hooks/useLatestRef.ts";
import {
  BaseLayer,
  DepthLayer,
  DescriptionKind,
  FaciesDescription,
  LithologicalDescription,
} from "../../stratigraphy.ts";
import {
  beginVerticalRowDrag,
  findDepthIdxAtClientY,
  queryDepthRowElements,
  swallowNextClick,
} from "./verticalRowDrag.ts";

interface GapSelection {
  kind: DescriptionKind;
  anchorIdx: number;
}

interface UseGapRangeSelectArgs {
  depths: DepthLayer[];
  tmpLithologicalDescriptions: LithologicalDescription[];
  tmpFaciesDescriptions: FaciesDescription[];
  onCommit: (kind: DescriptionKind, selectedDepthIds: string[]) => void;
  containerRef: RefObject<HTMLElement | null>;
}

interface UseGapRangeSelectReturn {
  activeSelection: GapSelection | null;
  previewDepthIds: ReadonlySet<string>;
  startGapSelect: (event: MouseEvent<HTMLElement>, kind: DescriptionKind, startDepthIdx: number) => void;
}

// A pure click (no movement) is left to the gap cell's onClick; only a drag past this threshold
// commits here — even one the filled-cell clamp shrinks back to a single row.
const dragThresholdPx = 4;

const sameSet = (a: ReadonlySet<string>, b: ReadonlySet<string>) => a.size === b.size && [...a].every(id => b.has(id));

/**
 * Owns the in-progress drag-to-select state for empty description cells (gaps). Pressing on a
 * gap and dragging over adjacent gaps collects a contiguous run of empty rows; on mouseup the
 * run is committed (opening a modal to fill the combined description). `startGapSelect` installs
 * the drag listeners synchronously via `beginVerticalRowDrag` and clamps the run so it never
 * crosses a row owned by another item in the same column (the anchor is always an empty gap, so
 * the clamped run stays contiguous gaps). Discards on Escape.
 */
export const useGapRangeSelect = ({
  depths,
  tmpLithologicalDescriptions,
  tmpFaciesDescriptions,
  onCommit,
  containerRef,
}: UseGapRangeSelectArgs): UseGapRangeSelectReturn => {
  const [activeSelection, setActiveSelection] = useState<GapSelection | null>(null);
  const [previewDepthIds, setPreviewDepthIds] = useState<ReadonlySet<string>>(new Set());

  // Latest props read at mousedown time — snapshotted into the drag closure so the listeners
  // never depend on a stale render.
  const onCommitRef = useLatestRef(onCommit);
  const depthsRef = useLatestRef(depths);
  const lithologicalRef = useLatestRef(tmpLithologicalDescriptions);
  const faciesRef = useLatestRef(tmpFaciesDescriptions);

  // Teardown for an in-progress drag, so an unmount mid-drag still removes the listeners.
  const teardownRef = useRef<(() => void) | null>(null);
  useEffect(() => () => teardownRef.current?.(), []);

  const startGapSelect = (event: MouseEvent<HTMLElement>, kind: DescriptionKind, startDepthIdx: number) => {
    if (event.button !== 0) return;
    const depthsSnapshot = depthsRef.current;
    if (startDepthIdx < 0 || startDepthIdx >= depthsSnapshot.length) return;
    event.stopPropagation();
    event.preventDefault();

    teardownRef.current?.(); // Defensive — normally already cleaned up.

    const anchorIdx = startDepthIdx;
    setActiveSelection({ kind, anchorIdx });
    setPreviewDepthIds(new Set([depthsSnapshot[anchorIdx].id]));

    const root: ParentNode = containerRef.current ?? document;
    const depthEls = queryDepthRowElements(root, depthsSnapshot);

    // Depth rows already owned by an item in this column — the selection must stop before them.
    const columnItems: BaseLayer[] = kind === "lithological" ? lithologicalRef.current : faciesRef.current;
    const ownedDepthIds = new Set<string>();
    for (const item of columnItems) {
      for (const id of item.depthIds ?? []) ownedDepthIds.add(id);
    }
    const isOwned = (idx: number) => {
      const id = depthsSnapshot[idx]?.id;
      return id ? ownedDepthIds.has(id) : false;
    };

    // Contiguous run of gaps between the anchor and the pointer, clamped at the first
    // column-owned row encountered while walking away from the anchor.
    const computeSelectedIdxs = (clientY: number): number[] => {
      const pointer = findDepthIdxAtClientY(depthEls, clientY, depthsSnapshot.length - 1);
      let firstSelectedIdx = anchorIdx;
      let lastSelectedIdx = anchorIdx;
      if (pointer > anchorIdx) {
        for (let i = anchorIdx + 1; i <= pointer; i++) {
          if (isOwned(i)) break;
          lastSelectedIdx = i;
        }
      } else if (pointer < anchorIdx) {
        for (let i = anchorIdx - 1; i >= pointer; i--) {
          if (isOwned(i)) break;
          firstSelectedIdx = i;
        }
      }
      const idxs: number[] = [];
      for (let i = firstSelectedIdx; i <= lastSelectedIdx; i++) idxs.push(i);
      return idxs;
    };

    teardownRef.current = beginVerticalRowDrag({
      startClientY: event.clientY,
      movedThresholdPx: dragThresholdPx,
      onMove: clientY => {
        const next = new Set(computeSelectedIdxs(clientY).map(i => depthsSnapshot[i].id));
        setPreviewDepthIds(prev => (sameSet(prev, next) ? prev : next));
      },
      onEnd: ({ committed, lastClientY, moved }) => {
        teardownRef.current = null;
        setActiveSelection(null);
        setPreviewDepthIds(new Set());
        if (!committed || !moved) return;
        const selectedDepthIds = computeSelectedIdxs(lastClientY).map(i => depthsSnapshot[i].id);
        if (selectedDepthIds.length === 0) return;
        onCommitRef.current(kind, selectedDepthIds);
        swallowNextClick();
      },
    });
  };

  return { activeSelection, previewDepthIds, startGapSelect };
};
