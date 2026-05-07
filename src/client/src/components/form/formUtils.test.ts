// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { findFirstErrorRef } from "./formUtils";

describe("findFirstErrorRef", () => {
  it("returns undefined when there are no errors", () => {
    expect(findFirstErrorRef({})).toBeUndefined();
  });

  it("returns the ref of a top-level error", () => {
    const ref = { focus: vi.fn() };
    const errors = {
      fieldA: { type: "required", message: "required", ref },
    };

    expect(findFirstErrorRef(errors)).toBe(ref);
  });

  it("returns the ref of a deeply nested error (e.g. field array entry)", () => {
    const ref = { focus: vi.fn() };
    const errors = {
      boreholeCodelists: {
        "0": {
          codelistId: { type: "required", message: "required", ref },
        },
      },
    };

    expect(findFirstErrorRef(errors)).toBe(ref);
  });

  it("returns the first focusable ref in iteration order when multiple errors exist", () => {
    const firstRef = { focus: vi.fn() };
    const secondRef = { focus: vi.fn() };
    const errors = {
      first: { type: "required", message: "required", ref: firstRef },
      second: { type: "required", message: "required", ref: secondRef },
    };

    expect(findFirstErrorRef(errors)).toBe(firstRef);
  });

  it("skips errors without a ref and continues searching", () => {
    const ref = { focus: vi.fn() };
    const errors = {
      first: { type: "manual", message: "no ref attached" },
      second: { type: "required", message: "required", ref },
    };

    expect(findFirstErrorRef(errors)).toBe(ref);
  });
});
