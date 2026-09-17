// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { runWhenIdle } from "./utils";

describe("runWhenIdle", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("schedules the callback through requestIdleCallback when available", () => {
    const requestIdleCallback = vi.fn().mockReturnValue(7);
    const cancelIdleCallback = vi.fn();
    vi.stubGlobal("requestIdleCallback", requestIdleCallback);
    vi.stubGlobal("cancelIdleCallback", cancelIdleCallback);
    const callback = vi.fn();

    const cancel = runWhenIdle(callback, 1000);

    expect(requestIdleCallback).toHaveBeenCalledWith(callback, { timeout: 1000 });
    cancel();
    expect(cancelIdleCallback).toHaveBeenCalledWith(7);
  });

  it("falls back to a timer when only requestIdleCallback is available", () => {
    vi.useFakeTimers();
    const requestIdleCallback = vi.fn();
    vi.stubGlobal("requestIdleCallback", requestIdleCallback);
    vi.stubGlobal("cancelIdleCallback", undefined);
    const callback = vi.fn();

    const cancel = runWhenIdle(callback, 1000);

    expect(requestIdleCallback).not.toHaveBeenCalled();
    expect(() => cancel()).not.toThrow();
    vi.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
  });

  it("falls back to a timer on browsers without requestIdleCallback", () => {
    vi.useFakeTimers();
    vi.stubGlobal("requestIdleCallback", undefined);
    const callback = vi.fn();

    expect(() => runWhenIdle(callback, 1000)).not.toThrow();

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledOnce();
  });

  it("cancels the fallback timer so the callback never runs", () => {
    vi.useFakeTimers();
    vi.stubGlobal("requestIdleCallback", undefined);
    const callback = vi.fn();

    runWhenIdle(callback, 1000)();

    vi.advanceTimersByTime(1000);
    expect(callback).not.toHaveBeenCalled();
  });
});
