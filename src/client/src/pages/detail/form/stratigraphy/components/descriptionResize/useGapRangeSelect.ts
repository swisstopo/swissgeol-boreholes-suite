import { MouseEvent, RefObject, useEffect, useRef, useState } from "react";
import {
  BaseLayer,
  DepthLayer,
  DescriptionKind,
  FaciesDescription,
  LithologicalDescription,
} from "../../stratigraphy.ts";

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

/**
 * Owns the in-progress drag-to-select state for empty description cells (gaps). Pressing the
 * mouse on a gap and dragging over adjacent gaps collects a contiguous run of empty rows; on
 * mouseup the run is committed (typically opening a modal to fill the combined description).
 *
 * The window-level mousemove / mouseup / keydown / scroll listeners are attached
 * **synchronously inside the mousedown handler** (not via an effect): a `useEffect` runs only
 * after paint, so an effect-installed mouseup listener can miss a quick drag entirely. Once
 * mounted the listeners:
 *   - snap the pointer to depth-row boundaries via DOM hit-testing (works with any scroll
 *     container),
 *   - clamp the run so it never crosses a row owned by another item in the same column (the
 *     anchor is always an empty gap, so the clamped run stays contiguous gaps),
 *   - commit on mouseup, discard on Escape,
 *   - swallow the synthetic click the browser may fire right after a drag, so the underlying
 *     cell doesn't fire a second action.
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

  // Latest props read at mousedown time — `startGapSelect` snapshots them into the drag
  // closure, so the listeners never depend on a stale render.
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;
  const depthsRef = useRef(depths);
  depthsRef.current = depths;
  const lithologicalRef = useRef(tmpLithologicalDescriptions);
  lithologicalRef.current = tmpLithologicalDescriptions;
  const faciesRef = useRef(tmpFaciesDescriptions);
  faciesRef.current = tmpFaciesDescriptions;

  // Teardown for an in-progress drag, so an unmount mid-drag still removes the listeners.
  const teardownRef = useRef<(() => void) | null>(null);
  useEffect(() => () => teardownRef.current?.(), []);

  const startGapSelect = (event: MouseEvent<HTMLElement>, kind: DescriptionKind, startDepthIdx: number) => {
    if (event.button !== 0) return;
    const depthsSnapshot = depthsRef.current;
    if (startDepthIdx < 0 || startDepthIdx >= depthsSnapshot.length) return;
    event.stopPropagation();
    event.preventDefault();

    // Tear down any previous drag still in flight (defensive — normally already cleaned up).
    teardownRef.current?.();

    const anchorIdx = startDepthIdx;
    const startClientY = event.clientY;
    let lastClientY = startClientY;
    let moved = false;
    const dragThresholdPx = 4;

    setActiveSelection({ kind, anchorIdx });
    setPreviewDepthIds(new Set([depthsSnapshot[anchorIdx].id]));
    document.body.style.cursor = "ns-resize";

    // Cache the depth-row DOM elements. We read their `getBoundingClientRect()` on every event
    // to figure out which row the cursor is over — this tracks scroll without pixel math. Scope
    // the lookup to the owning table so we don't hit a same-named cell in a sibling table.
    const root: ParentNode = containerRef.current ?? document;
    const depthEls: (HTMLElement | null)[] = depthsSnapshot.map(d =>
      root.querySelector<HTMLElement>(`[data-cy="depth-${d.fromDepth}-${d.toDepth}"]`),
    );

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

    const findIdxAtClientY = (clientY: number): number => {
      for (let i = 0; i < depthEls.length; i++) {
        const el = depthEls[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (clientY < rect.top) return Math.max(0, i - 1);
        if (clientY <= rect.bottom) return i;
      }
      return depthsSnapshot.length - 1;
    };

    // Contiguous run of gaps between the anchor and the pointer, clamped at the first
    // column-owned row encountered while walking away from the anchor.
    const computeSelectedIdxs = (clientY: number): number[] => {
      const pointer = findIdxAtClientY(clientY);
      let lo = anchorIdx;
      let hi = anchorIdx;
      if (pointer > anchorIdx) {
        for (let i = anchorIdx + 1; i <= pointer; i++) {
          if (isOwned(i)) break;
          hi = i;
        }
      } else if (pointer < anchorIdx) {
        for (let i = anchorIdx - 1; i >= pointer; i--) {
          if (isOwned(i)) break;
          lo = i;
        }
      }
      const idxs: number[] = [];
      for (let i = lo; i <= hi; i++) idxs.push(i);
      return idxs;
    };

    const updatePreview = (clientY: number) => {
      const idxs = computeSelectedIdxs(clientY);
      const next = new Set(idxs.map(i => depthsSnapshot[i].id));
      setPreviewDepthIds(prev => {
        if (prev.size === next.size && [...prev].every(id => next.has(id))) return prev;
        return next;
      });
    };

    const onMouseMove = (e: globalThis.MouseEvent) => {
      lastClientY = e.clientY;
      if (Math.abs(e.clientY - startClientY) > dragThresholdPx) moved = true;
      updatePreview(e.clientY);
    };

    // Scroll events don't bubble — attach in capture phase so we catch the table's scroll
    // container, the window, or any ancestor scrolled mid-drag.
    const onScroll = () => updatePreview(lastClientY);

    const teardown = () => {
      globalThis.removeEventListener("mousemove", onMouseMove);
      globalThis.removeEventListener("mouseup", onMouseUp);
      // Keydown is registered in capture phase (see below) — remove it the same way.
      globalThis.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("scroll", onScroll, { capture: true });
      document.body.style.cursor = "";
      teardownRef.current = null;
    };

    const finish = (commit: boolean) => {
      const idxs = commit ? computeSelectedIdxs(lastClientY) : [];
      const selectedDepthIds = idxs.map(i => depthsSnapshot[i].id);
      teardown();
      setActiveSelection(null);
      setPreviewDepthIds(new Set());

      // A pure click (no real drag) is left to the gap cell's own onClick handler, so
      // click-to-add behaves exactly as before. A genuine drag commits here — even when the
      // filled-cell clamp shrank it back to a single row, the modal still opens for that row.
      if (!commit || !moved || selectedDepthIds.length === 0) return;

      onCommitRef.current(kind, selectedDepthIds);

      // Swallow the synthetic click the browser may fire right after mouseup so the underlying
      // gap cell doesn't also fire its onClick (which would open a second, single-row modal).
      const swallowNextClick = (clickEvent: globalThis.MouseEvent) => {
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
        globalThis.removeEventListener("click", swallowNextClick, true);
      };
      globalThis.addEventListener("click", swallowNextClick, true);
      setTimeout(() => globalThis.removeEventListener("click", swallowNextClick, true), 0);
    };

    const onMouseUp = () => finish(true);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish(false);
    };

    globalThis.addEventListener("mousemove", onMouseMove);
    globalThis.addEventListener("mouseup", onMouseUp);
    // Capture phase so we always see Escape first — an ancestor keydown handler that stops
    // propagation (e.g. to close a dialog) would otherwise swallow it before it reached window.
    globalThis.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    teardownRef.current = teardown;
  };

  return { activeSelection, previewDepthIds, startGapSelect };
};
