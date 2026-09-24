// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

const download = vi.hoisted(() => vi.fn());
const downloadArchive = vi.hoisted(() => vi.fn());
vi.mock("../../../../api/download.ts", () => ({ download, downloadArchive }));

const { exportPhotos } = await import("./photo.ts");

afterEach(() => {
  vi.clearAllMocks();
});

describe("photo export", () => {
  it("saves a selection of photos as an archive", async () => {
    await exportPhotos([1, 2]);

    expect(downloadArchive).toHaveBeenCalledWith("photo/export?photoIds=1&photoIds=2", "photos.zip");
    expect(download).not.toHaveBeenCalled();
  });

  it("saves a single photo as itself, since the server sends it without an archive", async () => {
    await exportPhotos([7]);

    expect(download).toHaveBeenCalledWith("photo/export?photoIds=7");
    expect(downloadArchive).not.toHaveBeenCalled();
  });
});
