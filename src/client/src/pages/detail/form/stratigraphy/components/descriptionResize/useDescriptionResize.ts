import {MouseEvent, RefObject, useEffect, useRef, useState} from "react";
import {useLatestRef} from "../../../../../../hooks/useLatestRef.ts";
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

export type ResizeSide = "top" | "bottom";

interface ResizeDrag {
  kind: DescriptionKind;
  itemIdx: number;
  side: ResizeSide;
  initialFromDepth: number | null;
  initialToDepth: number | null;
  firstDepthIdx: number;
  lastDepthIdx: number;
}

interface PreviewRange {
  fromDepth: number | null;
  toDepth: number | null;
  depthIds: string[];
}

interface UseDescriptionResizeArgs {
  depths: DepthLayer[];
  tmpLithologicalDescriptions: LithologicalDescription[];
  tmpFaciesDescriptions: FaciesDescription[];
  resizeDescription: (
    kind: DescriptionKind,
    itemIdx: number,
    fromDepth: number | null,
    toDepth: number | null,
    targetDepthIds: string[],
  ) => void;
  containerRef: RefObject<HTMLElement | null>;
}

interface UseDescriptionResizeReturn {
  activeDrag: ResizeDrag | null;
  previewRange: PreviewRange | null;
  startResizeDrag: (
    event: MouseEvent<HTMLElement>,
    kind: DescriptionKind,
    itemIdx: number,
    layer: BaseLayer,
    side: ResizeSide,
  ) => void;
}

/**
 * Owns the in-progress drag-to-resize state for description action cells. `startResizeDrag`
 * installs the drag listeners synchronously via `beginVerticalRowDrag` and:
 *   - snaps the preview to depth-row boundaries via DOM hit-testing,
 *   - clamps so the resize never crosses a row owned by another description in the same column,
 *   - commits on mouseup, discards on Escape,
 *   - swallows the synthetic post-drag click so the underlying cell doesn't reopen its modal.
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

  // `resizeDescription` is invoked later (on mouseup), so read it through a ref to call the
  // latest version at commit time. Depths and column items, by contrast, are read synchronously
  // at mousedown and frozen for the gesture, so they don't need refs (see startResizeDrag).
  const resizeDescriptionRef = useLatestRef(resizeDescription);

  // Teardown for an in-progress drag, so an unmount mid-drag still removes the listeners.
  const teardownRef = useRef<(() => void) | null>(null);
  useEffect(() => () => teardownRef.current?.(), []);

  const startResizeDrag = (
    event: MouseEvent<HTMLElement>,
    kind: DescriptionKind,
    itemIdx: number,
    layer: BaseLayer,
    side: ResizeSide,
  ) => {
    event.preventDefault(); //  Without the browser's native drag/text-selection kicks in and the resize/selection doesn't track reliably
    const ids = layer.depthIds ?? [];
    if (ids.length === 0) return;
    const firstDepthIdx = depths.findIndex(d => d.id === ids[0]);
    const lastDepthIdx = depths.findIndex(d => d.id === ids.at(-1));
    if (firstDepthIdx < 0 || lastDepthIdx < 0) return;

    teardownRef.current?.(); // Defensive — normally already cleaned up.

    const drag: ResizeDrag = {
      kind,
      itemIdx,
      side,
      initialFromDepth: layer.fromDepth,
      initialToDepth: layer.toDepth,
      firstDepthIdx,
      lastDepthIdx,
    };
    setActiveDrag(drag);
    setPreviewRange({ fromDepth: layer.fromDepth, toDepth: layer.toDepth, depthIds: ids });

    const root: ParentNode = containerRef.current ?? document;
    const depthEls = queryDepthRowElements(root, depths);

    // Same-column items — used by the clamping logic during mousemove.
    const columnItems: BaseLayer[] = kind === "lithological" ? tmpLithologicalDescriptions : tmpFaciesDescriptions;
    const ownedBySibling = (depthIdx: number) => {
      const depthId = depths[depthIdx]?.id;
      if (!depthId) return false;
      return columnItems.some((item, i) => i !== itemIdx && item.depthIds?.includes(depthId));
    };

    // Clamp the new bottom edge: start from the cursor's row but stop at the first sibling-owned
    // row we'd cross. The drag can never reduce the description below its original range.
    const clampBottom = (targetIdx: number): number => {
      let newLastIdx = Math.max(firstDepthIdx, Math.min(depths.length - 1, targetIdx));
      if (newLastIdx > lastDepthIdx) {
        for (let i = lastDepthIdx + 1; i <= newLastIdx; i++) {
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
      let newFirstIdx = Math.max(0, Math.min(lastDepthIdx, targetIdx));
      if (newFirstIdx < firstDepthIdx) {
        for (let i = firstDepthIdx - 1; i >= newFirstIdx; i--) {
          if (ownedBySibling(i)) {
            newFirstIdx = i + 1;
            break;
          }
        }
      }
      return newFirstIdx;
    };

    const spanIds = (first: number, last: number) => depths.slice(first, last + 1).map(d => d.id);

    const computePreview = (clientY: number): PreviewRange => {
      const targetIdx = findDepthIdxAtClientY(depthEls, clientY, depths.length - 1);
      if (side === "bottom") {
        const lastIdx = clampBottom(targetIdx);
        // Snap to the target row's end depth — null when it's the not-yet-defined bottom layer, which
        // extends the description open-ended (the commit and save guard handle the null downstream).
        // depthIds carries the exact span so consecutive open rows are told apart by the target row.
        return {
          fromDepth: drag.initialFromDepth,
          toDepth: depths[lastIdx].toDepth,
          depthIds: spanIds(firstDepthIdx, lastIdx),
        };
      }
      const firstIdx = clampTop(targetIdx);
      // Snap to the target row's start depth — null when it's the not-yet-defined top layer, which
      // extends the description open-ended upward (the commit and save guard handle the null).
      return {
        fromDepth: depths[firstIdx].fromDepth,
        toDepth: drag.initialToDepth,
        depthIds: spanIds(firstIdx, lastDepthIdx),
      };
    };

    teardownRef.current = beginVerticalRowDrag({
      startClientY: event.clientY,
      onMove: clientY => {
        const next = computePreview(clientY);
        // Span length is the reliable change signal: the moving edge grows/shrinks a fixed-anchor run,
        // so a different target always changes the count even when the (open) bound value stays null.
        setPreviewRange(prev => (prev && prev.depthIds.length === next.depthIds.length ? prev : next));
      },
      onEnd: ({ committed, lastClientY }) => {
        teardownRef.current = null;
        setActiveDrag(null);
        setPreviewRange(null);
        if (committed) {
          const c = computePreview(lastClientY);
          if (c.depthIds.length !== ids.length) {
            resizeDescriptionRef.current(drag.kind, drag.itemIdx, c.fromDepth, c.toDepth, c.depthIds);
          }
          swallowNextClick();
        }
      },
    });
  };

  return { activeDrag, previewRange, startResizeDrag };
};
