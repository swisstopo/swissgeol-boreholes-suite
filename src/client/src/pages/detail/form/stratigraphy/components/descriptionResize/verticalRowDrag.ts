import { rowIndexAtClientY } from "../lithologyTable/rowWindowing.ts";
import { defaultRowHeight } from "../stratigraphyTableConstants.ts";

/**
 * Index of the depth row the cursor is within. Computed from the row height rather than from the
 * row elements, because the table renders only the rows near the viewport. The rows' position is
 * read fresh on every call, so this keeps working while the page scrolls.
 */
export const depthRowIndexAtClientY = (rowsElement: HTMLElement, clientY: number, rowCount: number): number =>
  rowIndexAtClientY(clientY, rowsElement.getBoundingClientRect().top, defaultRowHeight, rowCount);

interface RowRangeSelection {
  firstIdx: number;
  lastIdx: number;
}

/**
 * Resolve the contiguous run of depth rows between a fixed `anchorIdx` and the row the cursor is
 * within (`pointerIdx`). The run extends from the anchor toward the cursor and stops at the first
 * row for which `isBlocked` returns true; `minIdx`/`maxIdx` restrict how far the cursor end may travel.
 */
export const resolveRowRange = (
  pointerIdx: number,
  anchorIdx: number,
  isBlocked: (idx: number) => boolean,
  minIdx: number,
  maxIdx: number,
): RowRangeSelection => {
  const clampedPointerIdx = Math.max(minIdx, Math.min(maxIdx, pointerIdx));
  let firstIdx = anchorIdx;
  let lastIdx = anchorIdx;
  if (clampedPointerIdx > anchorIdx) {
    for (let i = anchorIdx + 1; i <= clampedPointerIdx; i++) {
      if (isBlocked(i)) break;
      lastIdx = i;
    }
  } else if (clampedPointerIdx < anchorIdx) {
    for (let i = anchorIdx - 1; i >= clampedPointerIdx; i--) {
      if (isBlocked(i)) break;
      firstIdx = i;
    }
  }
  return { firstIdx, lastIdx };
};

/**
 * Swallow the synthetic click the browser fires right after a drag's mouseup — it would
 * otherwise bubble to the underlying cell and trigger its onClick. The capture-phase listener
 * catches it before any element handler; the setTimeout cleans up if no click fires.
 */
export const swallowNextClick = () => {
  const handler = (event: globalThis.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    globalThis.removeEventListener("click", handler, true);
  };
  globalThis.addEventListener("click", handler, true);
  setTimeout(() => globalThis.removeEventListener("click", handler, true), 0);
};

interface VerticalRowDragOptions {
  startClientY: number;
  cursor: string; // CSS cursor forced for the whole drag (e.g. "ns-resize" for resize, "crosshair" for range-select).
  onMove: (clientY: number) => void; // Called on every mousemove and on scroll, with the current pointer Y.
  onEnd: (result: { committed: boolean; lastClientY: number }) => void; // Called exactly once when the drag ends: mouseup => committed, Escape => not committed.
}

/**
 * Installs window-level drag listeners SYNCHRONOUSLY — mousemove / mouseup, plus Escape-keydown
 * and scroll both in capture phase — and sets the `ns-resize` cursor. (Installing synchronously
 * rather than from a `useEffect` avoids missing a quick drag, since effects run only after
 * paint. Capture phase ensures we see Escape/scroll before an ancestor can stop them.)
 *
 * Returns a teardown that force-removes the listeners without invoking `onEnd` (e.g. on unmount).
 */
export const beginVerticalRowDrag = ({ startClientY, cursor, onMove, onEnd }: VerticalRowDragOptions): (() => void) => {
  // Force `cursor` everywhere for the whole drag. Setting `document.body.style.cursor` alone isn't
  // enough: the cells dragged over set their own `cursor: pointer` on hover, which wins. A global
  // `!important` rule overrides those until the drag ends.
  const cursorStyle = document.createElement("style");
  cursorStyle.textContent = `*{cursor:${cursor}!important}`;
  document.head.appendChild(cursorStyle);
  let lastClientY = startClientY;
  let finished = false;

  const teardown = () => {
    globalThis.removeEventListener("mousemove", handleMove);
    globalThis.removeEventListener("mouseup", handleUp);
    globalThis.removeEventListener("keydown", handleKey, true);
    document.removeEventListener("scroll", handleScroll, { capture: true });
    cursorStyle.remove();
  };

  const end = (committed: boolean) => {
    if (finished) return;
    finished = true;
    teardown();
    onEnd({ committed, lastClientY });
  };

  function handleMove(event: globalThis.MouseEvent) {
    lastClientY = event.clientY;
    onMove(event.clientY);
  }
  function handleScroll() {
    onMove(lastClientY);
  }
  function handleUp() {
    end(true);
  }
  function handleKey(event: KeyboardEvent) {
    if (event.key === "Escape") end(false);
  }

  globalThis.addEventListener("mousemove", handleMove);
  globalThis.addEventListener("mouseup", handleUp);
  globalThis.addEventListener("keydown", handleKey, true);
  document.addEventListener("scroll", handleScroll, { capture: true, passive: true });

  return teardown;
};
