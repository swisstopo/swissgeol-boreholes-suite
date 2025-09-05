import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useScaleContext } from "./scaleContext.tsx";

interface VerticalZoomPanProps {
  children: ReactNode;
}

export const VerticalZoomPanWrapper: FC<VerticalZoomPanProps> = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { scaleY, setScaleY, translateY, setTranslateY } = useScaleContext();

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
      setTranslateY(prev => {
        const newValue = prev + deltaY;
        return Math.min(newValue, 12);
      });
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
  }, [isDragging, setTranslateY]);

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
      setTranslateY(Math.min(newTranslateY, 12));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scaleY, setScaleY, setTranslateY, translateY]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        userSelect: "none",
        cursor: isDragging ? "grabbing" : "grab",
        position: "relative",
      }}>
      <Box
        sx={{
          transform: `translateY(${translateY}px) scaleY(${scaleY})`,
          transformOrigin: "top",
          width: "100%",
          height: "100%",
        }}>
        {children}
      </Box>
    </Box>
  );
};
