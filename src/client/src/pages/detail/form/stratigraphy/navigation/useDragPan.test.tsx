// @vitest-environment jsdom
import { Dispatch, SetStateAction, useCallback, useRef, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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

// jsdom doesn't implement Element.setPointerCapture; stub it so the hook can call it without throwing.
const stubPointerCapture = () => {
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
};

// jsdom's PointerEvent ignores `pointerId` and `pageY` in the init dict, so we set them
// after construction via defineProperty before dispatching.
const dispatchPointer = (target: Element, type: string, pointerId: number, pageY: number) => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "pointerId", { value: pointerId });
  Object.defineProperty(event, "pageY", { value: pageY });
  fireEvent(target, event);
};

describe("useDragPan", () => {
  afterEach(() => cleanup());

  it("starts not dragging", () => {
    stubPointerCapture();
    render(<TestHarness initial={baseNavState()} />);
    expect(screen.getByTestId("container").getAttribute("data-dragging")).toBe("false");
  });

  it("sets isDragging on pointerDown and clears it on pointerUp", () => {
    stubPointerCapture();
    render(<TestHarness initial={baseNavState()} />);
    const container = screen.getByTestId("container");
    dispatchPointer(container, "pointerdown", 1, 100);
    expect(container.getAttribute("data-dragging")).toBe("true");
    dispatchPointer(container, "pointerup", 1, 100);
    expect(container.getAttribute("data-dragging")).toBe("false");
  });

  it("updates lensStart proportional to pointer-move deltaY and pixelPerMeter", () => {
    stubPointerCapture();
    const changes: NavState[] = [];
    render(<TestHarness initial={baseNavState()} onChange={s => changes.push(s)} />);
    const container = screen.getByTestId("container");
    // pixelPerMeter = (500 - 0) / 50 = 10
    dispatchPointer(container, "pointerdown", 1, 200);
    dispatchPointer(container, "pointermove", 1, 150);
    // Dragged 50 px upward; lensStart should move down by 50/10 = 5 meters
    const latest = changes.at(-1);
    expect(latest?.lensStart).toBeCloseTo(5);
  });

  it("clamps lensStart at 0 when dragging beyond the top", () => {
    stubPointerCapture();
    const changes: NavState[] = [];
    render(<TestHarness initial={baseNavState()} onChange={s => changes.push(s)} />);
    const container = screen.getByTestId("container");
    dispatchPointer(container, "pointerdown", 1, 0);
    dispatchPointer(container, "pointermove", 1, 10000);
    const latest = changes.at(-1);
    expect(latest?.lensStart).toBe(0);
  });

  it("clamps lensStart at maxContent minus lensSize when dragging beyond the bottom", () => {
    stubPointerCapture();
    const changes: NavState[] = [];
    render(<TestHarness initial={baseNavState()} onChange={s => changes.push(s)} />);
    const container = screen.getByTestId("container");
    dispatchPointer(container, "pointerdown", 1, 10000);
    dispatchPointer(container, "pointermove", 1, 0);
    const latest = changes.at(-1);
    // maxContent (100) - lensSize (50) = 50
    expect(latest?.lensStart).toBe(50);
  });

  it("clears isDragging on pointerCancel", () => {
    stubPointerCapture();
    render(<TestHarness initial={baseNavState()} />);
    const container = screen.getByTestId("container");
    dispatchPointer(container, "pointerdown", 1, 100);
    expect(container.getAttribute("data-dragging")).toBe("true");
    dispatchPointer(container, "pointercancel", 1, 100);
    expect(container.getAttribute("data-dragging")).toBe("false");
  });
});
