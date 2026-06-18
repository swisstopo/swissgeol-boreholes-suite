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

// Multiplies the 1-to-1 mouse-to-meter mapping so that a small drag moves the viewport noticeably.
// Without it, dragging in pixels-per-meter space feels sluggish at typical zoom levels.
const DRAG_SPEED_MULTIPLIER = 2;

const isPannableNavState = (ns: NavState): boolean => ns.maxContent > ns.lensSize;

interface DragOrigin {
  pointerId: number;
  startPageY: number;
  startLensStart: number;
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
    // Suppress the browser's default text-selection-on-drag behavior, otherwise selection-drag
    // races our pan-drag and the gesture stutters mid-move.
    event.preventDefault();
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    originRef.current = {
      pointerId: event.pointerId,
      startPageY: event.pageY,
      startLensStart: ns.lensStart,
    };
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (event: PointerEvent) => {
      const origin = originRef.current;
      if (!isOriginForPointer(origin, event.pointerId)) return;
      const ns = navStateRef.current;
      if (!Number.isFinite(ns.pixelPerMeter) || ns.pixelPerMeter <= 0) return;
      const deltaPx = event.pageY - origin.startPageY;
      const deltaMeters = (deltaPx / ns.pixelPerMeter) * DRAG_SPEED_MULTIPLIER;
      // Drag down (positive deltaY) feels like scrolling up, so subtract.
      const next = clamp(origin.startLensStart - deltaMeters, 0, Math.max(0, ns.maxContent - ns.lensSize));
      // `next` is origin-relative (computed from the captured startLensStart), not state-relative,
      // so the functional updater ignores `prev.lensStart` by design and just preserves the rest of prev.
      setNavState(prev => prev.setLensStart(next));
    };

    const handleEnd = (event: PointerEvent) => {
      const origin = originRef.current;
      if (!isOriginForPointer(origin, event.pointerId)) return;
      originRef.current = null;
      setIsDragging(false);
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
