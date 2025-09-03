import React, { ReactNode, useEffect, useRef, useState } from "react";
import { ScaleContext } from "./scaleContext.tsx";

interface VerticalZoomPanProps {
  children: ReactNode;
}

export const VerticalZoomPanWrapper: React.FC<VerticalZoomPanProps> = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [scaleY, setScaleY] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);

  const minScaleY = 0.25;
  const maxScaleY = 5;

  // Mouse drag to pan vertically
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      lastY.current = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = e.clientY - lastY.current;
      setTranslateY(prev => prev + deltaY);
      lastY.current = e.clientY;
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  // Mouse wheel to zoom vertically
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Normalize delta
      let delta = e.deltaY;
      if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 15;
      else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= window.innerHeight;

      const zoomFactor = 1 - delta * 0.001;
      const nextScale = Math.max(minScaleY, Math.min(maxScaleY, scaleY * zoomFactor));

      // Zoom toward mouse position
      const rect = el.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const scaleRatio = nextScale / scaleY;
      const newTranslateY = mouseY - scaleRatio * (mouseY - translateY);

      setScaleY(nextScale);
      setTranslateY(newTranslateY);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scaleY, translateY]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        userSelect: "none",
        cursor: isDragging ? "grabbing" : "grab",
        position: "relative",
      }}>
      <div
        style={{
          transform: `translateY(${translateY}px) scaleY(${scaleY})`,
          transformOrigin: "top",
          width: "100%",
          height: "100%",
        }}>
        <ScaleContext.Provider value={{ scaleY, translateY }}>{children}</ScaleContext.Provider>
      </div>
    </div>
  );
};
