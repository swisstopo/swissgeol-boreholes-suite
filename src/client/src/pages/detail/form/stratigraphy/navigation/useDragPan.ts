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
}

interface DragOrigin {
  pointerId: number;
  startPageY: number;
  startLensStart: number;
}

// Lifts the lens-overview drag-pan behavior up to any scrollable container. Pointer-move
// updates lensStart inversely to deltaY (drag down -> lens moves up, matching the "grab the
// page" gesture), clamped into [0, maxContent - lensSize].
export const useDragPan = ({ navState, setNavState, containerRef }: UseDragPanOptions): UseDragPanResult => {
  const [isDragging, setIsDragging] = useState(false);
  const originRef = useRef<DragOrigin | null>(null);

  // Keep the latest navState available to pointermove without re-binding the listener every render.
  const navStateRef = useRef(navState);
  navStateRef.current = navState;

  const onPointerDown = useCallback<PointerEventHandler<HTMLElement>>(event => {
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    originRef.current = {
      pointerId: event.pointerId,
      startPageY: event.pageY,
      startLensStart: navStateRef.current.lensStart,
    };
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (event: PointerEvent) => {
      const origin = originRef.current;
      if (!origin || event.pointerId !== origin.pointerId) return;
      const ns = navStateRef.current;
      if (!Number.isFinite(ns.pixelPerMeter) || ns.pixelPerMeter <= 0) return;
      const deltaPx = event.pageY - origin.startPageY;
      const deltaMeters = deltaPx / ns.pixelPerMeter;
      // Drag down (positive deltaY) feels like scrolling up, so subtract.
      const next = clamp(origin.startLensStart - deltaMeters, 0, Math.max(0, ns.maxContent - ns.lensSize));
      // `next` is origin-relative (computed from the captured startLensStart), not state-relative,
      // so the functional updater ignores `prev.lensStart` by design and just preserves the rest of prev.
      setNavState(prev => prev.setLensStart(next));
    };

    const handleEnd = (event: PointerEvent) => {
      const origin = originRef.current;
      if (!origin || event.pointerId !== origin.pointerId) return;
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

  return { onPointerDown, isDragging };
};
