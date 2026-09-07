import { describe, expect, it } from "vitest";
import { formatBytes, isAbortError } from "./transferProgress.ts";

describe("formatBytes", () => {
  it("reports whole bytes below one kilobyte", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1)).toBe("1 B");
    expect(formatBytes(999)).toBe("999 B");
  });

  it("switches to the next decimal unit at every power of thousand", () => {
    expect(formatBytes(1_000)).toBe("1.0 KB");
    expect(formatBytes(1_000_000)).toBe("1.0 MB");
    expect(formatBytes(1_000_000_000)).toBe("1.0 GB");
    expect(formatBytes(1_000_000_000_000)).toBe("1.0 TB");
  });

  it("keeps one decimal so the number moves while transferring", () => {
    expect(formatBytes(1_460_000)).toBe("1.5 MB");
    expect(formatBytes(2_300_000_000)).toBe("2.3 GB");
    expect(formatBytes(247_800_000)).toBe("247.8 MB");
  });

  it("stays on the largest known unit beyond terabytes", () => {
    expect(formatBytes(5_000_000_000_000_000)).toBe("5000.0 TB");
  });

  it("treats negative and non finite input as nothing transferred", () => {
    expect(formatBytes(-1)).toBe("0 B");
    expect(formatBytes(Number.NaN)).toBe("0 B");
  });
});

describe("isAbortError", () => {
  it("recognises the rejection a cancelled transfer produces", () => {
    expect(isAbortError(new DOMException("The user aborted a request.", "AbortError"))).toBe(true);
  });

  it("does not mistake a transport or application failure for a cancellation", () => {
    expect(isAbortError(new TypeError("Failed to fetch"))).toBe(false);
    expect(isAbortError(new DOMException("boom", "NetworkError"))).toBe(false);
    expect(isAbortError("AbortError")).toBe(false);
    expect(isAbortError(undefined)).toBe(false);
  });
});
