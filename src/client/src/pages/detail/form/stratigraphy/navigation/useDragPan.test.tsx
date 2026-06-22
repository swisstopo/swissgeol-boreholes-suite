// @vitest-environment jsdom
import { Dispatch, SetStateAction, useCallback, useRef, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NavState } from "./navState.ts";
import { useDragPan } from "./useDragPan.ts";

const baseNavState = () =>
  new NavState({ height: 500, rawLensSize: 50, contentHeights: { c: 100 }, headerHeights: { h: 0 } });

interface TestHarnessProps {
  initial: NavState;
  onChange?: (next: NavState) => void;
}

const TestHarness = ({ initial, onChange }: TestHarnessProps) => {
  const [state, setState] = useState<NavState>(initial);
  const containerRef = useRef<HTMLDivElement>(null);

  const setNavState: Dispatch<SetStateAction<NavState>> = useCallback(
    updater => {
      setState(prev => {
        const next = updater instanceof Function ? updater(prev) : updater;
        onChange?.(next);
        return next;
      });
    },
    [onChange],
  );

  const { onPointerDown, isDragging } = useDragPan({ navState: state, setNavState, containerRef });

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      data-testid="container"
      data-dragging={isDragging ? "true" : "false"}
    />
  );
};

// jsdom doesn't implement Element.setPointerCapture/releasePointerCapture; assign no-op fns so the
// hook can call them without throwing. Each test gets a fresh vi.fn via beforeEach.

// jsdom's PointerEvent ignores `pointerId` and `pageY` in the init dict, so we set them
// after construction via defineProperty before dispatching.
const dispatchPointer = (target: Element, type: string, pointerId: number, pageY: number) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "pointerId", { value: pointerId });
  Object.defineProperty(event, "pageY", { value: pageY });
  fireEvent(target, event);
};

// baseNavState: height=500, maxHeader=0, lensSize=50, maxContent=100 -> pixelPerMeter = 10.

describe("useDragPan", () => {
  beforeEach(() => {
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  });
  afterEach(() => cleanup());

  it("starts not dragging", () => {
    render(<TestHarness initial={baseNavState()} />);
    expect(screen.getByTestId("container").getAttribute("data-dragging")).toBe("false");
  });

  it("sets isDragging once movement crosses the drag threshold and clears it on pointerUp", () => {
    render(<TestHarness initial={baseNavState()} />);
    const container = screen.getByTestId("container");
    dispatchPointer(container, "pointerdown", 1, 100);
    // pointerdown alone is a potential click, not a confirmed drag.
    expect(container.getAttribute("data-dragging")).toBe("false");
    // First move crosses the 4px threshold; only now should we commit to a drag.
    dispatchPointer(container, "pointermove", 1, 110);
    expect(container.getAttribute("data-dragging")).toBe("true");
    dispatchPointer(container, "pointerup", 1, 110);
    expect(container.getAttribute("data-dragging")).toBe("false");
  });

  it("treats a short press with no significant movement as a click (does not start a drag)", () => {
    // Regression guard: preventDefault on pointerdown suppresses the synthesized click event, so
    // we must NOT preventDefault until the user has actually crossed the drag threshold. This
    // test asserts the side effects (no capture, no isDragging, no lensStart update) for a press
    // that releases below the threshold.
    const setPointerCapture = vi.fn();
    Element.prototype.setPointerCapture = setPointerCapture;
    const changes: NavState[] = [];
    render(<TestHarness initial={baseNavState()} onChange={s => changes.push(s)} />);
    const container = screen.getByTestId("container");
    dispatchPointer(container, "pointerdown", 1, 100);
    // Tiny twitch (1 px) — well below the 4 px threshold.
    dispatchPointer(container, "pointermove", 1, 101);
    dispatchPointer(container, "pointerup", 1, 101);
    expect(container.getAttribute("data-dragging")).toBe("false");
    expect(setPointerCapture).not.toHaveBeenCalled();
    expect(changes).toHaveLength(0);
  });

  it("updates lensStart proportional to pointer-move deltaY and pixelPerMeter", () => {
    const changes: NavState[] = [];
    render(<TestHarness initial={baseNavState()} onChange={s => changes.push(s)} />);
    const container = screen.getByTestId("container");
    dispatchPointer(container, "pointerdown", 1, 200);
    dispatchPointer(container, "pointermove", 1, 195);
    // Dragged 5 px upward; speed multiplier is sqrt(maxContent/lensSize) = sqrt(2),
    // so lensStart moves down by (5/10)*sqrt(2) meters.
    expect(changes.length).toBeGreaterThan(0);
    expect(changes.at(-1)?.lensStart).toBeCloseTo(0.5 * Math.sqrt(2));
  });

  it("clamps lensStart at 0 when dragging beyond the top", () => {
    const changes: NavState[] = [];
    render(<TestHarness initial={baseNavState()} onChange={s => changes.push(s)} />);
    const container = screen.getByTestId("container");
    dispatchPointer(container, "pointerdown", 1, 0);
    dispatchPointer(container, "pointermove", 1, 10000);
    expect(changes.length).toBeGreaterThan(0);
    expect(changes.at(-1)?.lensStart).toBe(0);
  });

  it("clamps lensStart at maxContent minus lensSize when dragging beyond the bottom", () => {
    const changes: NavState[] = [];
    render(<TestHarness initial={baseNavState()} onChange={s => changes.push(s)} />);
    const container = screen.getByTestId("container");
    dispatchPointer(container, "pointerdown", 1, 10000);
    dispatchPointer(container, "pointermove", 1, 0);
    // maxContent (100) - lensSize (50) = 50
    expect(changes.length).toBeGreaterThan(0);
    expect(changes.at(-1)?.lensStart).toBe(50);
  });

  it("is a no-op when the full content already fits in the lens (nothing to pan to)", () => {
    const changes: NavState[] = [];
    // maxContent = lensSize (raw=50, contentHeights also 50): nothing to pan to.
    const fitting = new NavState({ height: 500, rawLensSize: 50, contentHeights: { c: 50 }, headerHeights: { h: 0 } });
    render(<TestHarness initial={fitting} onChange={s => changes.push(s)} />);
    const container = screen.getByTestId("container");
    dispatchPointer(container, "pointerdown", 1, 100);
    expect(container.getAttribute("data-dragging")).toBe("false");
    dispatchPointer(container, "pointermove", 1, 50);
    expect(changes.length).toBe(0);
  });

  it("clears isDragging on pointerCancel after a drag has started", () => {
    render(<TestHarness initial={baseNavState()} />);
    const container = screen.getByTestId("container");
    dispatchPointer(container, "pointerdown", 1, 100);
    // Cross the drag threshold so isDragging actually becomes true.
    dispatchPointer(container, "pointermove", 1, 110);
    expect(container.getAttribute("data-dragging")).toBe("true");
    dispatchPointer(container, "pointercancel", 1, 110);
    expect(container.getAttribute("data-dragging")).toBe("false");
  });
});
