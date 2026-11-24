import { RefObject, useLayoutEffect, useState } from "react";
import { getVisibleRowRange, RowRange } from "./rowWindowing.ts";

const findScrollParent = (element: HTMLElement): HTMLElement | null => {
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    if (/(auto|scroll|overlay)/.test(getComputedStyle(parent).overflowY)) return parent;
  }
  return null;
};

/**
 * Tracks which of the equally tall rows inside `rowsRef` are within the viewport of their nearest
 * scrolling ancestor (or the window), widened by `overscanRows`. Re-measures on any scroll and on
 * window resize, at most once per animation frame.
 */
export const useVisibleRowRange = (
  rowsRef: RefObject<HTMLElement | null>,
  rowCount: number,
  rowHeight: number,
  overscanRows: number,
): RowRange => {
  // Before the first measurement, render only the top rows instead of all of them.
  const [range, setRange] = useState<RowRange>(() => ({ first: 0, last: Math.min(rowCount, overscanRows) - 1 }));

  useLayoutEffect(() => {
    const rowsElement = rowsRef.current;
    if (!rowsElement) return;
    const scrollParent = findScrollParent(rowsElement);
    let frame = 0;

    const measure = () => {
      frame = 0;
      const viewport = scrollParent?.getBoundingClientRect();
      const next = getVisibleRowRange({
        rowsTop: rowsElement.getBoundingClientRect().top,
        viewportTop: Math.max(viewport?.top ?? 0, 0),
        viewportBottom: Math.min(viewport?.bottom ?? globalThis.innerHeight, globalThis.innerHeight),
        rowHeight,
        rowCount,
        overscanRows,
      });
      setRange(prev => (prev.first === next.first && prev.last === next.last ? prev : next));
    };
    const scheduleMeasure = () => {
      if (frame === 0) frame = requestAnimationFrame(measure);
    };

    measure();
    // Capture phase, because scroll events do not bubble and any ancestor may be the one scrolling.
    document.addEventListener("scroll", scheduleMeasure, { capture: true, passive: true });
    globalThis.addEventListener("resize", scheduleMeasure);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("scroll", scheduleMeasure, { capture: true });
      globalThis.removeEventListener("resize", scheduleMeasure);
    };
  }, [rowsRef, rowCount, rowHeight, overscanRows]);

  // Rows can be removed before the effect re-measures; never point past the last row.
  return { first: Math.min(range.first, rowCount - 1), last: Math.min(range.last, rowCount - 1) };
};
