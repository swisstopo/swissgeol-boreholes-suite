import { describe, expect, it } from "vitest";
import { ApiError, isGatewayTimeout } from "./errorClasses.ts";

describe("isGatewayTimeout", () => {
  it("is true for an ApiError with status 504", () => {
    expect(isGatewayTimeout(new ApiError("errorDataExtraction", 504))).toBe(true);
  });

  it.each([500, 502, 503, undefined])("is false for an ApiError with status %s", status => {
    expect(isGatewayTimeout(new ApiError("errorDataExtraction", status))).toBe(false);
  });

  it.each([new Error("timeout"), null, undefined])("is false for %s", error => {
    expect(isGatewayTimeout(error)).toBe(false);
  });
});
