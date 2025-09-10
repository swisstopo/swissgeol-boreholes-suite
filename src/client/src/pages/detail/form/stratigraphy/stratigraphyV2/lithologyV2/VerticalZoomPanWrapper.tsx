import { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useScaleContext } from "./scaleContext";

const minScaleY = 0.25;
const maxScaleY = 5;
const maxTranslateY = 12;

interface VerticalZoomPanProps {
  children: ReactNode;
}

export const VerticalZoomPanWrapper: FC<VerticalZoomPanProps> = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { scaleY, setScaleY, translateY, setTranslateY } = useScaleContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const lastY = useRef(0);

  const onMouseDown = useCallback((e: MouseEvent) => {
    setIsDragging(true);
    lastY.current = e.clientY;
  }, []);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = e.clientY - lastY.current;
      setTranslateY(prev => Math.min(prev + deltaY, maxTranslateY));
      lastY.current = e.clientY;
    },
    [isDragging, setTranslateY],
  );

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      // Normalize delta
      let delta = e.deltaY;
      if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) delta *= 15;
      else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) delta *= window.innerHeight;

      const zoomFactor = 1 - delta * 0.001;
      const nextScale = Math.max(minScaleY, Math.min(maxScaleY, scaleY * zoomFactor));

      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      const scaleRatio = nextScale / scaleY;
      const newTranslateY = mouseY - scaleRatio * (mouseY - translateY);

      setScaleY(nextScale);
      setTranslateY(Math.min(newTranslateY, maxTranslateY));
    },
    [scaleY, setScaleY, setTranslateY, translateY],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseDown, onMouseMove, onMouseUp]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        userSelect: "none",
        // Todo : fix cursor on hoverable children
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
