// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVisibleRowRange } from "./useVisibleRowRange.ts";

const rowHeight = 100;
const rowCount = 50;
const overscanRows = 2;

// jsdom has no ResizeObserver. This one lets a test report a size change of an observed element.
const resizeCallbacks = new Map<Element, Set<() => void>>();
class FakeResizeObserver {
  private readonly callback: () => void;
  private readonly observed = new Set<Element>();

  constructor(callback: () => void) {
    this.callback = callback;
  }

  observe(element: Element) {
    this.observed.add(element);
    const callbacks = resizeCallbacks.get(element) ?? new Set();
    callbacks.add(this.callback);
    resizeCallbacks.set(element, callbacks);
  }

  unobserve(element: Element) {
    this.observed.delete(element);
    resizeCallbacks.get(element)?.delete(this.callback);
  }

  disconnect() {
    for (const element of this.observed) resizeCallbacks.get(element)?.delete(this.callback);
    this.observed.clear();
  }
}

const reportResize = (element: Element) => {
  for (const callback of resizeCallbacks.get(element) ?? []) callback();
};

describe("useVisibleRowRange", () => {
  let scrollParent: HTMLDivElement;
  let rows: HTMLDivElement;
  let rowsTop: number;
  let viewportHeight: number;
  let isHidden: boolean;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    vi.stubGlobal("ResizeObserver", FakeResizeObserver);
    scrollParent = document.createElement("div");
    scrollParent.style.overflowY = "auto";
    rows = document.createElement("div");
    scrollParent.appendChild(rows);
    document.body.appendChild(scrollParent);
    rowsTop = 0;
    viewportHeight = 500;
    isHidden = false;
    // A `display: none` element measures as an empty rect at the origin.
    vi.spyOn(scrollParent, "getBoundingClientRect").mockImplementation(() =>
      isHidden ? new DOMRect() : new DOMRect(0, 0, 100, viewportHeight),
    );
    vi.spyOn(rows, "getBoundingClientRect").mockImplementation(() =>
      isHidden ? new DOMRect() : new DOMRect(0, rowsTop, 100, rowHeight * rowCount),
    );
  });

  afterEach(() => {
    scrollParent.remove();
    resizeCallbacks.clear();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("covers the rows in the scrolling ancestor's viewport plus the overscan", () => {
    const rowsRef = { current: rows };

    const { result } = renderHook(() => useVisibleRowRange(rowsRef, rowCount, rowHeight, overscanRows));

    expect(result.current).toEqual({ first: 0, last: 6 });
  });

  it("follows scrolling", () => {
    const rowsRef = { current: rows };
    const { result } = renderHook(() => useVisibleRowRange(rowsRef, rowCount, rowHeight, overscanRows));

    rowsTop = -1000;
    act(() => {
      scrollParent.dispatchEvent(new Event("scroll"));
      vi.advanceTimersToNextFrame();
    });

    expect(result.current).toEqual({ first: 8, last: 16 });
  });

  // A hidden table measures as zero size. Showing it again (or resizing a side panel) fires neither
  // a scroll nor a window resize, so only the size change can trigger the new measurement.
  it("re-measures when a hidden table is shown again", () => {
    isHidden = true;
    const rowsRef = { current: rows };
    const { result } = renderHook(() => useVisibleRowRange(rowsRef, rowCount, rowHeight, overscanRows));
    expect(result.current).toEqual({ first: 0, last: 1 });

    isHidden = false;
    rowsTop = -1000;
    act(() => {
      reportResize(rows);
      vi.advanceTimersToNextFrame();
    });

    expect(result.current).toEqual({ first: 8, last: 16 });
  });

  it("re-measures when the scrolling ancestor is resized", () => {
    const rowsRef = { current: rows };
    const { result } = renderHook(() => useVisibleRowRange(rowsRef, rowCount, rowHeight, overscanRows));

    viewportHeight = 700; // Stays below jsdom's window height, which also clips the viewport.
    act(() => {
      reportResize(scrollParent);
      vi.advanceTimersToNextFrame();
    });

    expect(result.current).toEqual({ first: 0, last: 8 });
  });

  it("stops observing sizes when unmounted", () => {
    const rowsRef = { current: rows };
    const { unmount } = renderHook(() => useVisibleRowRange(rowsRef, rowCount, rowHeight, overscanRows));

    unmount();

    expect(resizeCallbacks.get(rows)?.size ?? 0).toBe(0);
    expect(resizeCallbacks.get(scrollParent)?.size ?? 0).toBe(0);
  });

  it("never points past the last row after rows are removed", () => {
    const rowsRef = { current: rows };
    const { result, rerender } = renderHook(
      ({ count }) => useVisibleRowRange(rowsRef, count, rowHeight, overscanRows),
      {
        initialProps: { count: rowCount },
      },
    );

    rerender({ count: 3 });

    expect(result.current).toEqual({ first: 0, last: 2 });
  });
});
