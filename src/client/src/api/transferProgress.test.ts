import { describe, expect, it } from "vitest";
import { formatBytes, isAbortError } from "./transferProgress.ts";

describe("formatBytes", () => {
  it("stays in megabytes below one megabyte", () => {
    expect(formatBytes(0)).toBe("0.0 MB");
    expect(formatBytes(999)).toBe("0.0 MB");
    expect(formatBytes(512_000)).toBe("0.5 MB");
    expect(formatBytes(999_950)).toBe("1.0 MB");
  });

  it("keeps one decimal so the number moves while transferring", () => {
    expect(formatBytes(1_000_000)).toBe("1.0 MB");
    expect(formatBytes(1_460_000)).toBe("1.5 MB");
    expect(formatBytes(247_800_000)).toBe("247.8 MB");
  });

  it("stays in megabytes for sizes that would otherwise reach gigabytes", () => {
    expect(formatBytes(1_000_000_000)).toBe("1'000.0 MB");
    expect(formatBytes(2_300_000_000)).toBe("2'300.0 MB");
    expect(formatBytes(1_000_000_000_000)).toBe("1'000'000.0 MB");
  });

  it("treats negative and non finite input as nothing transferred", () => {
    expect(formatBytes(-1)).toBe("0.0 MB");
    expect(formatBytes(Number.NaN)).toBe("0.0 MB");
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
