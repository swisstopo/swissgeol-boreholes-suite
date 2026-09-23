import { describe, expect, it } from "vitest";
import { maxFileSizeForTab, PanelTab } from "./dataextractionInterfaces.ts";
import { setFileSizeLimits } from "./fileSize.ts";

const maxFileSize = 210_000_000;
const largeMaxFileSize = 5_000_000_000;

setFileSizeLimits({ maxFileSize, largeMaxFileSize, maxImportArchiveSize: 1_000_000_000, chunkSize: 6 * 1024 * 1024 });

describe("maxFileSizeForTab", () => {
  it("holds a profile to the limit of the chunked upload", () => {
    expect(maxFileSizeForTab(PanelTab.profile)).toBe(largeMaxFileSize);
  });

  it("holds a photo to the limit of the single request upload", () => {
    expect(maxFileSizeForTab(PanelTab.photo)).toBe(maxFileSize);
  });
});
