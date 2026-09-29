// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDelayedFlag } from "./useDelayedFlag.ts";

const delay = 100;

describe("useDelayedFlag", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stays false while the delay has not elapsed", () => {
    const { result } = renderHook(() => useDelayedFlag(true, delay));

    expect(result.current).toBe(false);

    act(() => {
      vi.advanceTimersByTime(delay - 1);
    });

    expect(result.current).toBe(false);
  });

  it("turns true once the delay has elapsed", () => {
    const { result } = renderHook(() => useDelayedFlag(true, delay));

    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(result.current).toBe(true);
  });

  it("never turns true while inactive", () => {
    const { result } = renderHook(() => useDelayedFlag(false, delay));

    act(() => {
      vi.advanceTimersByTime(delay * 10);
    });

    expect(result.current).toBe(false);
  });

  it("resets when the operation finishes", () => {
    const { result, rerender } = renderHook(({ active }) => useDelayedFlag(active, delay), {
      initialProps: { active: true },
    });

    act(() => {
      vi.advanceTimersByTime(delay);
    });
    expect(result.current).toBe(true);

    rerender({ active: false });

    expect(result.current).toBe(false);
  });
});
