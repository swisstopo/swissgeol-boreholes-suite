import { MouseEvent, RefObject, useEffect, useRef, useState } from "react";
import { useLatestRef } from "../../../../../../hooks/useLatestRef.ts";
import {
  BaseLayer,
  DepthLayer,
  DescriptionKind,
  FaciesDescription,
  LithologicalDescription,
} from "../../stratigraphy.ts";
import { beginVerticalRowDrag, queryDepthRowElements, resolveRowRange, swallowNextClick } from "./verticalRowDrag.ts";

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

  // `onCommit` is invoked later (on mouseup), so read it through a ref to call the latest
  // version at commit time. Depths and column items, by contrast, are read synchronously at
  // mousedown and frozen for the gesture, so they don't need refs (see startGapSelect).
  const onCommitRef = useLatestRef(onCommit);

  // Teardown for an in-progress drag, so an unmount mid-drag still removes the listeners.
  const teardownRef = useRef<(() => void) | null>(null);
  useEffect(() => () => teardownRef.current?.(), []);

  const startGapSelect = (event: MouseEvent<HTMLElement>, kind: DescriptionKind, startDepthIdx: number) => {
    if (event.button !== 0) return;
    if (startDepthIdx < 0 || startDepthIdx >= depths.length) return;

    teardownRef.current?.(); // Defensive — normally already cleaned up.

    const anchorIdx = startDepthIdx;
    setActiveSelection({ kind, anchorIdx });
    setPreviewDepthIds(new Set([depths[anchorIdx].id]));

    const root: ParentNode = containerRef.current ?? document;
    const depthEls = queryDepthRowElements(root, depths);

    // Depth rows already owned by an item in this column — the selection must stop before them.
    const columnItems: BaseLayer[] = kind === "lithological" ? tmpLithologicalDescriptions : tmpFaciesDescriptions;
    const ownedDepthIds = new Set<string>();
    for (const item of columnItems) {
      for (const id of item.depthIds ?? []) ownedDepthIds.add(id);
    }
    const isOwned = (idx: number) => {
      const id = depths[idx]?.id;
      return id ? ownedDepthIds.has(id) : false;
    };

    // Row the cursor currently points at. Persisted across mousemoves so the within-cell snap
    // tracks from it. The selection runs both ways from the anchor across the full column.
    let pointerIdx = anchorIdx;

    const computeSelectedIdxs = (clientY: number): number[] => {
      const range = resolveRowRange(depthEls, clientY, anchorIdx, pointerIdx, isOwned, 0, depths.length - 1);
      pointerIdx = range.pointerIdx;
      const idxs: number[] = [];
      for (let i = range.firstIdx; i <= range.lastIdx; i++) idxs.push(i);
      return idxs;
    };

    teardownRef.current = beginVerticalRowDrag({
      startClientY: event.clientY,
      cursor: "crosshair",
      onMove: clientY => {
        const next = new Set(computeSelectedIdxs(clientY).map(i => depths[i].id));
        setPreviewDepthIds(prev => (sameSet(prev, next) ? prev : next));
      },
      onEnd: ({ committed, lastClientY }) => {
        teardownRef.current = null;
        setActiveSelection(null);
        setPreviewDepthIds(new Set());
        if (!committed) return;
        const selectedDepthIds = computeSelectedIdxs(lastClientY).map(i => depths[i].id);
        if (selectedDepthIds.length === 0) return;
        onCommitRef.current(kind, selectedDepthIds);
        swallowNextClick();
      },
    });
  };

  return { activeSelection, previewDepthIds, startGapSelect };
};
