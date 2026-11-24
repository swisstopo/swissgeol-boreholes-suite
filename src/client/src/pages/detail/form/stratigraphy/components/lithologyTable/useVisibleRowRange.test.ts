// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVisibleRowRange } from "./useVisibleRowRange.ts";

const rowHeight = 100;
const rowCount = 50;
const overscanRows = 2;

describe("useVisibleRowRange", () => {
  let scrollParent: HTMLDivElement;
  let rows: HTMLDivElement;
  let rowsTop: number;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
    scrollParent = document.createElement("div");
    scrollParent.style.overflowY = "auto";
    rows = document.createElement("div");
    scrollParent.appendChild(rows);
    document.body.appendChild(scrollParent);
    rowsTop = 0;
    vi.spyOn(scrollParent, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 100, 500));
    vi.spyOn(rows, "getBoundingClientRect").mockImplementation(
      () => new DOMRect(0, rowsTop, 100, rowHeight * rowCount),
    );
  });

  afterEach(() => {
    scrollParent.remove();
    vi.useRealTimers();
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
