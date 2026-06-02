import { MouseEvent, RefObject, useEffect, useMemo, useRef, useState } from "react";
import { BaseLayer, DepthLayer } from "../../../../../../api/stratigraphy.ts";
import { FaciesDescription } from "../../faciesDescription.ts";
import { LithologicalDescription } from "../../lithologicalDescription.ts";

export type ResizeKind = "lithological" | "facies";
export type ResizeSide = "top" | "bottom";

interface ResizeDrag {
  kind: ResizeKind;
  itemIdx: number;
  side: ResizeSide;
  startClientY: number;
  initialFromDepth: number;
  initialToDepth: number;
  firstDepthIdx: number;
  lastDepthIdx: number;
}

interface PreviewRange {
  fromDepth: number;
  toDepth: number;
}

interface UseDescriptionResizeArgs {
  depths: DepthLayer[];
  tmpLithologicalDescriptions: LithologicalDescription[];
  tmpFaciesDescriptions: FaciesDescription[];
  resizeDescription: (kind: ResizeKind, itemIdx: number, fromDepth: number, toDepth: number) => void;
  containerRef: RefObject<HTMLElement | null>;
}

interface UseDescriptionResizeReturn {
  activeDrag: ResizeDrag | null;
  previewRange: PreviewRange | null;
  startResizeDrag: (
    event: MouseEvent<HTMLElement>,
    kind: ResizeKind,
    itemIdx: number,
    layer: BaseLayer,
    side: ResizeSide,
  ) => void;
}

/**
 * Owns the in-progress drag-to-resize state for description action cells. Mounting a drag
 * (via `startResizeDrag`) installs window-level mousemove / mouseup / keydown / scroll
 * listeners that:
 *   - snap the preview to depth-row boundaries via DOM hit-testing (works with any scroll
 *     container),
 *   - clamp so the resize never crosses a row owned by another description in the same
 *     column,
 *   - commit on mouseup, discard on Escape,
 *   - swallow the synthetic click the browser fires right after mouseup, so the underlying
 *     cell doesn't reopen its description modal.
 */
export const useDescriptionResize = ({
  depths,
  tmpLithologicalDescriptions,
  tmpFaciesDescriptions,
  resizeDescription,
  containerRef,
}: UseDescriptionResizeArgs): UseDescriptionResizeReturn => {
  const [activeDrag, setActiveDrag] = useState<ResizeDrag | null>(null);
  const [previewRange, setPreviewRange] = useState<PreviewRange | null>(null);

  // `resizeDescription` reference may change between renders; read through a ref so the
  // window-level mouseup handler always calls the latest one without re-wiring listeners.
  const resizeDescriptionRef = useRef(resizeDescription);
  resizeDescriptionRef.current = resizeDescription;

  // Same-column items for the active drag — used by the clamping logic during mousemove.
  const dragColumnItems = useMemo<BaseLayer[]>(() => {
    if (!activeDrag) return [];
    return activeDrag.kind === "lithological" ? tmpLithologicalDescriptions : tmpFaciesDescriptions;
  }, [activeDrag, tmpLithologicalDescriptions, tmpFaciesDescriptions]);

  useEffect(() => {
    if (!activeDrag) return;
    const drag = activeDrag;
    document.body.style.cursor = "ns-resize";
    let lastClientY = drag.startClientY;

    // Cache the depth-row DOM elements. We use their `getBoundingClientRect()` on every
    // event to figure out which row the cursor is over — this automatically tracks any
    // scroll (window or container) without us having to do pixel math. Scope the lookup to
    // the owning table so we don't accidentally hit a same-named cell in a sibling table
    // hidden via display:none (see comment on containerRef).
    const root: ParentNode = containerRef.current ?? document;
    const depthEls: (HTMLElement | null)[] = depths.map(d =>
      root.querySelector<HTMLElement>(`[data-cy="depth-${d.fromDepth}-${d.toDepth}"]`),
    );

    const ownedBySibling = (depthIdx: number) => {
      const depthId = depths[depthIdx]?.id;
      if (!depthId) return false;
      return dragColumnItems.some((item, i) => i !== drag.itemIdx && item.depthIds?.includes(depthId));
    };

    const findIdxAtClientY = (clientY: number): number => {
      for (let i = 0; i < depthEls.length; i++) {
        const el = depthEls[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (clientY < rect.top) return Math.max(0, i - 1);
        if (clientY <= rect.bottom) return i;
      }
      return depths.length - 1;
    };

    // Clamp the new bottom edge: start from the cursor's row but stop at the first
    // sibling-owned row we'd cross. The drag can never reduce the description below its
    // original range (Math.max with drag.firstDepthIdx).
    const clampBottom = (targetIdx: number): number => {
      let newLastIdx = Math.max(drag.firstDepthIdx, Math.min(depths.length - 1, targetIdx));
      if (newLastIdx > drag.lastDepthIdx) {
        for (let i = drag.lastDepthIdx + 1; i <= newLastIdx; i++) {
          if (ownedBySibling(i)) {
            newLastIdx = i - 1;
            break;
          }
        }
      }
      return newLastIdx;
    };

    // Mirror of clampBottom for the top edge.
    const clampTop = (targetIdx: number): number => {
      let newFirstIdx = Math.max(0, Math.min(drag.lastDepthIdx, targetIdx));
      if (newFirstIdx < drag.firstDepthIdx) {
        for (let i = drag.firstDepthIdx - 1; i >= newFirstIdx; i--) {
          if (ownedBySibling(i)) {
            newFirstIdx = i + 1;
            break;
          }
        }
      }
      return newFirstIdx;
    };

    const computePreview = (clientY: number): PreviewRange => {
      const targetIdx = findIdxAtClientY(clientY);
      if (drag.side === "bottom") {
        const lastIdx = clampBottom(targetIdx);
        return { fromDepth: drag.initialFromDepth, toDepth: depths[lastIdx].toDepth ?? drag.initialToDepth };
      }
      const firstIdx = clampTop(targetIdx);
      return { fromDepth: depths[firstIdx].fromDepth ?? drag.initialFromDepth, toDepth: drag.initialToDepth };
    };

    const updatePreview = (clientY: number) => {
      const next = computePreview(clientY);
      setPreviewRange(prev => (prev?.fromDepth === next.fromDepth && prev?.toDepth === next.toDepth ? prev : next));
    };

    const onMouseMove = (event: globalThis.MouseEvent) => {
      lastClientY = event.clientY;
      updatePreview(event.clientY);
    };

    // Scroll events don't bubble — attach in capture phase so we catch the table's scroll
    // container, the window, or any ancestor that the user might scroll mid-drag.
    const onScroll = () => updatePreview(lastClientY);

    const finish = (commit: boolean) => {
      if (commit) {
        const committed = computePreview(lastClientY);
        if (committed.fromDepth !== drag.initialFromDepth || committed.toDepth !== drag.initialToDepth) {
          resizeDescriptionRef.current(drag.kind, drag.itemIdx, committed.fromDepth, committed.toDepth);
        }
      }
      setActiveDrag(null);
      setPreviewRange(null);
      document.body.style.cursor = "";

      // Swallow the synthetic click the browser fires right after mouseup — it would
      // otherwise bubble to the underlying cell and reopen the description modal. The
      // capture-phase listener catches it before any element handler. The setTimeout
      // cleans up if no click fires (e.g. mouseup landed outside any cell).
      const swallowNextClick = (event: globalThis.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        globalThis.removeEventListener("click", swallowNextClick, true);
      };
      globalThis.addEventListener("click", swallowNextClick, true);
      setTimeout(() => globalThis.removeEventListener("click", swallowNextClick, true), 0);
    };

    const onMouseUp = () => finish(true);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish(false);
    };

    globalThis.addEventListener("mousemove", onMouseMove);
    globalThis.addEventListener("mouseup", onMouseUp);
    globalThis.addEventListener("keydown", onKeyDown);
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      globalThis.removeEventListener("mousemove", onMouseMove);
      globalThis.removeEventListener("mouseup", onMouseUp);
      globalThis.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("scroll", onScroll, { capture: true });
      document.body.style.cursor = "";
    };
  }, [activeDrag, depths, dragColumnItems, containerRef]);

  const startResizeDrag = (
    event: MouseEvent<HTMLElement>,
    kind: ResizeKind,
    itemIdx: number,
    layer: BaseLayer,
    side: ResizeSide,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    const ids = layer.depthIds ?? [];
    if (ids.length === 0) return;
    if (layer.fromDepth === null || layer.toDepth === null) return;
    const firstDepthIdx = depths.findIndex(d => d.id === ids[0]);
    const lastDepthIdx = depths.findIndex(d => d.id === ids.at(-1));
    if (firstDepthIdx < 0 || lastDepthIdx < 0) return;
    setActiveDrag({
      kind,
      itemIdx,
      side,
      startClientY: event.clientY,
      initialFromDepth: layer.fromDepth,
      initialToDepth: layer.toDepth,
      firstDepthIdx,
      lastDepthIdx,
    });
    setPreviewRange({ fromDepth: layer.fromDepth, toDepth: layer.toDepth });
  };

  return { activeDrag, previewRange, startResizeDrag };
};
