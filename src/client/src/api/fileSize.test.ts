import { describe, expect, it, vi } from "vitest";
import {
  formatFileSize,
  getChunkSize,
  getLargeMaxFileSize,
  getMaxFileSize,
  getMaxImportArchiveSize,
  setFileSizeLimits,
} from "./fileSize.ts";

describe("fileSize", () => {
  it("says so when it is read before the settings have arrived", async () => {
    vi.resetModules();
    const unpopulated = await import("./fileSize.ts");

    expect(() => unpopulated.getMaxFileSize()).toThrow(
      "The upload limits have not been read from the application settings yet.",
    );
  });

  it("hands back the limits the API reported", () => {
    setFileSizeLimits({
      maxFileSize: 210_000_000,
      largeMaxFileSize: 5_000_000_000,
      maxImportArchiveSize: 20_000_000_000,
      chunkSize: 6 * 1024 * 1024,
    });

    expect(getMaxFileSize()).toBe(210_000_000);
    expect(getLargeMaxFileSize()).toBe(5_000_000_000);
    expect(getMaxImportArchiveSize()).toBe(20_000_000_000);
    expect(getChunkSize()).toBe(6 * 1024 * 1024);
  });

  it("follows the API when it reports different limits", () => {
    setFileSizeLimits({ maxFileSize: 1_000, largeMaxFileSize: 2_000, maxImportArchiveSize: 3_000, chunkSize: 4_000 });

    expect(getMaxFileSize()).toBe(1_000);
    expect(getLargeMaxFileSize()).toBe(2_000);
    expect(getMaxImportArchiveSize()).toBe(3_000);
    expect(getChunkSize()).toBe(4_000);
  });

  it("reports the archive limit the API serves", () => {
    setFileSizeLimits({
      maxFileSize: 210_000_000,
      largeMaxFileSize: 5_000_000_000,
      maxImportArchiveSize: 20_000_000_000,
      chunkSize: 6 * 1024 * 1024,
    });

    expect(getMaxImportArchiveSize()).toBe(20_000_000_000);
    expect(formatFileSize(getMaxImportArchiveSize())).toBe("20 GB");
  });

  it.each([
    [210_000_000, "210 MB"],
    [5_000_000_000, "5 GB"],
    [1_000_000_000, "1 GB"],
    [1_500_000, "1.5 MB"],
    [512_000, "512 KB"],
  ])("writes %i bytes as %s", (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});
