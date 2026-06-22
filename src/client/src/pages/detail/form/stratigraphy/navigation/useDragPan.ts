import {
  Dispatch,
  PointerEventHandler,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { clamp } from "./clamp.ts";
import { NavState } from "./navState.ts";

interface UseDragPanOptions {
  navState: NavState;
  setNavState: Dispatch<SetStateAction<NavState>>;
  containerRef: RefObject<HTMLElement | null>;
}

interface UseDragPanResult {
  onPointerDown: PointerEventHandler<HTMLElement>;
  isDragging: boolean;
  // True when the visible window is smaller than the full content (i.e., there is something to pan to).
  isPannable: boolean;
}

// Scales the drag-speed  with the current zoom. At the un-zoomed baseline the multiplier
// stays at 1; the more the user zooms in (smaller lensSize relative to maxContent), the more
// data each pixel of drag covers — otherwise deep zoom-ins crawl because each cursor pixel only
// represents a sliver of depth. sqrt keeps the response soft enough that the content still tracks
// the cursor at extreme zoom; a linear scaling would make it shoot away from the pointer.
const getDragSpeedMultiplier = (lensSize: number, maxContent: number): number => {
  if (!Number.isFinite(lensSize) || lensSize <= 0 || !Number.isFinite(maxContent) || maxContent <= 0) {
    return 1;
  }
  return Math.sqrt(Math.max(1, maxContent / lensSize));
};

const isPannableNavState = (ns: NavState): boolean => ns.maxContent > ns.lensSize;

// Movement (px) the pointer must travel from pointerdown before the gesture is treated as a drag.
// Below this, the press is treated as a click and we don't preventDefault or capture,
// so child interactive elements still receive their click events.
const DRAG_THRESHOLD_PX = 4;

interface DragOrigin {
  pointerId: number;
  startPageY: number;
  startLensStart: number;
  // Becomes true once movement crosses DRAG_THRESHOLD_PX and we commit to a drag.
  captured: boolean;
}

const isOriginForPointer = (origin: DragOrigin | null, pointerId: number): origin is DragOrigin =>
  origin?.pointerId === pointerId;

// Lifts the lens-overview drag-pan behavior up to any scrollable container. Pointer-move
// updates lensStart inversely to deltaY (drag down -> lens moves up, matching the "grab the
// page" gesture), clamped into [0, maxContent - lensSize].
export const useDragPan = ({ navState, setNavState, containerRef }: UseDragPanOptions): UseDragPanResult => {
  const [isDragging, setIsDragging] = useState(false);
  const originRef = useRef<DragOrigin | null>(null);

  // Keep the latest navState available to pointermove without re-binding the listener every render.
  const navStateRef = useRef(navState);
  navStateRef.current = navState;

  const isPannable = isPannableNavState(navState);

  const onPointerDown = useCallback<PointerEventHandler<HTMLElement>>(event => {
    const ns = navStateRef.current;
    // Skip the gesture entirely when the full content already fits; nothing to pan to.
    if (!isPannableNavState(ns)) return;
    // Record the press but do NOT preventDefault or capture yet. We commit
    // to the drag only once movement crosses DRAG_THRESHOLD_PX in the pointermove handler below.
    originRef.current = {
      pointerId: event.pointerId,
      startPageY: event.pageY,
      startLensStart: ns.lensStart,
      captured: false,
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (event: PointerEvent) => {
      const origin = originRef.current;
      if (!isOriginForPointer(origin, event.pointerId)) return;
      const deltaPx = event.pageY - origin.startPageY;
      if (!origin.captured) {
        // Still within the click-vs-drag window; don't pan yet, and let the press resolve as a
        // click if the user releases here.
        if (Math.abs(deltaPx) < DRAG_THRESHOLD_PX) return;
        // Movement exceeded threshold: commit to a drag now.
        container.setPointerCapture(event.pointerId);
        origin.captured = true;
        setIsDragging(true);
      }
      const ns = navStateRef.current;
      if (!Number.isFinite(ns.pixelPerMeter) || ns.pixelPerMeter <= 0) return;
      const deltaMeters = (deltaPx / ns.pixelPerMeter) * getDragSpeedMultiplier(ns.lensSize, ns.maxContent);
      // Drag down (positive deltaY) feels like scrolling up, so subtract.
      const next = clamp(origin.startLensStart - deltaMeters, 0, Math.max(0, ns.maxContent - ns.lensSize));
      // `next` is origin-relative (computed from the captured startLensStart), not state-relative,
      // so the functional updater ignores `prev.lensStart` by design and just preserves the rest of prev.
      setNavState(prev => prev.setLensStart(next));
    };

    const handleEnd = (event: PointerEvent) => {
      const origin = originRef.current;
      if (!isOriginForPointer(origin, event.pointerId)) return;
      if (origin.captured) {
        container.releasePointerCapture(event.pointerId);
        setIsDragging(false);
      }
      originRef.current = null;
    };

    container.addEventListener("pointermove", handleMove);
    container.addEventListener("pointerup", handleEnd);
    container.addEventListener("pointercancel", handleEnd);
    return () => {
      container.removeEventListener("pointermove", handleMove);
      container.removeEventListener("pointerup", handleEnd);
      container.removeEventListener("pointercancel", handleEnd);
    };
  }, [containerRef, setNavState]);

  return { onPointerDown, isDragging, isPannable };
};
