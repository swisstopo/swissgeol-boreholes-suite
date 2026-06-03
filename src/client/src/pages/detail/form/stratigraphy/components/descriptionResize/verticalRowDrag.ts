import { DepthLayer } from "../../stratigraphy.ts";

/** Cache the depth-row DOM elements within `root`, in depth order (some entries may be null). */
export const queryDepthRowElements = (root: ParentNode, depths: DepthLayer[]): (HTMLElement | null)[] =>
  depths.map(d => root.querySelector<HTMLElement>(`[data-cy="depth-${d.fromDepth}-${d.toDepth}"]`));

/**
 * Index of the depth row under `clientY` via bounding-rect hit-testing. Because the rects are
 * read fresh on every call, this keeps working correctly even while the page is scrolled.
 * Returns `fallbackIdx` when the cursor is below every row.
 */
export const findDepthIdxAtClientY = (
  depthEls: (HTMLElement | null)[],
  clientY: number,
  fallbackIdx: number,
): number => {
  for (let i = 0; i < depthEls.length; i++) {
    const el = depthEls[i];
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (clientY < rect.top) return Math.max(0, i - 1);
    if (clientY <= rect.bottom) return i;
  }
  return fallbackIdx;
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
  // Pixels the pointer must travel before the gesture counts as a drag (vs a click). Default 0.
  movedThresholdPx?: number;
  // Called on every mousemove and on scroll, with the current pointer Y.
  onMove: (clientY: number) => void;
  // Called exactly once when the drag ends: mouseup => committed, Escape => not committed.
  onEnd: (result: { committed: boolean; lastClientY: number; moved: boolean }) => void;
}

/**
 * Installs window-level drag listeners SYNCHRONOUSLY — mousemove / mouseup, plus Escape-keydown
 * and scroll both in capture phase — and sets the `ns-resize` cursor. (Installing synchronously
 * rather than from a `useEffect` avoids missing a quick drag, since effects run only after
 * paint. Capture phase ensures we see Escape/scroll before an ancestor can stop them.) Tracks
 * the last pointer Y and whether it moved past `movedThresholdPx`.
 *
 * Returns a teardown that force-removes the listeners without invoking `onEnd` (e.g. on unmount).
 */
export const beginVerticalRowDrag = ({
  startClientY,
  movedThresholdPx = 0,
  onMove,
  onEnd,
}: VerticalRowDragOptions): (() => void) => {
  document.body.style.cursor = "ns-resize";
  let lastClientY = startClientY;
  let moved = false;
  let finished = false;

  const teardown = () => {
    globalThis.removeEventListener("mousemove", handleMove);
    globalThis.removeEventListener("mouseup", handleUp);
    globalThis.removeEventListener("keydown", handleKey, true);
    document.removeEventListener("scroll", handleScroll, { capture: true });
    document.body.style.cursor = "";
  };

  const end = (committed: boolean) => {
    if (finished) return;
    finished = true;
    teardown();
    onEnd({ committed, lastClientY, moved });
  };

  function handleMove(event: globalThis.MouseEvent) {
    lastClientY = event.clientY;
    if (Math.abs(event.clientY - startClientY) > movedThresholdPx) moved = true;
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
