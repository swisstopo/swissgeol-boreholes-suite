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

export type ResizeSide = "top" | "bottom";

interface ResizeDrag {
  kind: DescriptionKind;
  itemIdx: number;
  side: ResizeSide;
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
  resizeDescription: (kind: DescriptionKind, itemIdx: number, fromDepth: number, toDepth: number) => void;
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

  // Latest props read at mousedown time — snapshotted into the drag closure so the listeners
  // never depend on a stale render.
  const resizeDescriptionRef = useLatestRef(resizeDescription);
  const depthsRef = useLatestRef(depths);
  const lithologicalRef = useLatestRef(tmpLithologicalDescriptions);
  const faciesRef = useLatestRef(tmpFaciesDescriptions);

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
    event.stopPropagation();
    event.preventDefault();
    const depthsSnapshot = depthsRef.current;
    const ids = layer.depthIds ?? [];
    if (ids.length === 0) return;
    if (layer.fromDepth === null || layer.toDepth === null) return;
    const firstDepthIdx = depthsSnapshot.findIndex(d => d.id === ids[0]);
    const lastDepthIdx = depthsSnapshot.findIndex(d => d.id === ids.at(-1));
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
    setPreviewRange({ fromDepth: layer.fromDepth, toDepth: layer.toDepth });

    const root: ParentNode = containerRef.current ?? document;
    const depthEls = queryDepthRowElements(root, depthsSnapshot);

    // Same-column items — used by the clamping logic during mousemove.
    const columnItems: BaseLayer[] = kind === "lithological" ? lithologicalRef.current : faciesRef.current;
    const ownedBySibling = (depthIdx: number) => {
      const depthId = depthsSnapshot[depthIdx]?.id;
      if (!depthId) return false;
      return columnItems.some((item, i) => i !== itemIdx && item.depthIds?.includes(depthId));
    };

    // Clamp the new bottom edge: start from the cursor's row but stop at the first sibling-owned
    // row we'd cross. The drag can never reduce the description below its original range.
    const clampBottom = (targetIdx: number): number => {
      let newLastIdx = Math.max(firstDepthIdx, Math.min(depthsSnapshot.length - 1, targetIdx));
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

    const computePreview = (clientY: number): PreviewRange => {
      const targetIdx = findDepthIdxAtClientY(depthEls, clientY, depthsSnapshot.length - 1);
      if (side === "bottom") {
        const lastIdx = clampBottom(targetIdx);
        return { fromDepth: drag.initialFromDepth, toDepth: depthsSnapshot[lastIdx].toDepth ?? drag.initialToDepth };
      }
      const firstIdx = clampTop(targetIdx);
      return { fromDepth: depthsSnapshot[firstIdx].fromDepth ?? drag.initialFromDepth, toDepth: drag.initialToDepth };
    };

    teardownRef.current = beginVerticalRowDrag({
      startClientY: event.clientY,
      onMove: clientY => {
        const next = computePreview(clientY);
        setPreviewRange(prev => (prev?.fromDepth === next.fromDepth && prev?.toDepth === next.toDepth ? prev : next));
      },
      onEnd: ({ committed, lastClientY }) => {
        teardownRef.current = null;
        setActiveDrag(null);
        setPreviewRange(null);
        if (committed) {
          const c = computePreview(lastClientY);
          if (c.fromDepth !== drag.initialFromDepth || c.toDepth !== drag.initialToDepth) {
            resizeDescriptionRef.current(drag.kind, drag.itemIdx, c.fromDepth, c.toDepth);
          }
          swallowNextClick();
        }
      },
    });
  };

  return { activeDrag, previewRange, startResizeDrag };
};
