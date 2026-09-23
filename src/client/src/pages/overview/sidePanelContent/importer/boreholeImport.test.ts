import { beforeEach, describe, expect, it, vi } from "vitest";
import { ArchiveImportProgress, importBoreholeArchive } from "./boreholeImport.ts";

const uploadResumable = vi.hoisted(() => vi.fn());
const importBoreholesJson = vi.hoisted(() => vi.fn());
const discardPendingProfile = vi.hoisted(() => vi.fn());
const openBoreholeArchive = vi.hoisted(() => vi.fn());
const uploadTarget = vi.hoisted(() => ({ endpoint: "/api/v2/profile/upload/tus", resultHeader: "Profile-Id" }));

vi.mock("../../../../api/resumableUpload.ts", () => ({ uploadResumable, profileUploadTarget: uploadTarget }));
vi.mock("../../../../api/borehole.ts", () => ({ importBoreholesJson }));
vi.mock("../../../../api/profile.ts", () => ({ discardPendingProfile }));
vi.mock("../../../../api/zipArchive.ts", () => ({
  openBoreholeArchive,
  ArchiveJsonMissingError: class extends Error {},
}));

const archiveFile = new File(["zip"], "export.zip", { type: "application/zip" });

const sourceFor = (fileName: string) => ({
  open: () => ({ stream: new ReadableStream<Uint8Array>(), written: Promise.resolve() }),
  size: 10,
  fileName,
  contentType: "application/pdf",
});

const close = vi.fn();

const handlers = (signal: AbortSignal) => ({ onProgress: vi.fn(), onImported: vi.fn(), signal });

// A discard that fails is logged rather than raised, so the log is asserted here instead of being
// printed alongside the results.
const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

describe("importBoreholeArchive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    close.mockResolvedValue(undefined);
    discardPendingProfile.mockResolvedValue(undefined);
    openBoreholeArchive.mockResolvedValue({
      json: "[]",
      entryFor: (name: string) => sourceFor(name),
      close,
    });
  });

  it("uploads every attachment the import reported, under the borehole it belongs to", async () => {
    importBoreholesJson.mockResolvedValue({
      boreholeCount: 2,
      attachments: [
        { profileId: 1, boreholeId: 7, fileName: "a_report.pdf" },
        { profileId: 2, boreholeId: 8, fileName: "b_plan.pdf" },
      ],
    });
    uploadResumable.mockResolvedValue(1);
    const controller = new AbortController();

    const outcome = await importBoreholeArchive(archiveFile, 3, handlers(controller.signal));

    expect(uploadResumable).toHaveBeenCalledTimes(2);
    expect(uploadResumable).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ fileName: "a_report.pdf" }),
      uploadTarget,
      { boreholeId: "7", profileId: "1" },
      expect.objectContaining({ signal: controller.signal }),
    );
    expect(uploadResumable).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ fileName: "b_plan.pdf" }),
      uploadTarget,
      { boreholeId: "8", profileId: "2" },
      expect.objectContaining({ signal: controller.signal }),
    );
    expect(outcome).toStrictEqual({ boreholeCount: 2, uploadedCount: 2, pendingCount: 0 });
    expect(discardPendingProfile).not.toHaveBeenCalled();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("deletes the row of an attachment that fails, and of every one it did not reach", async () => {
    importBoreholesJson.mockResolvedValue({
      boreholeCount: 1,
      attachments: [
        { profileId: 1, boreholeId: 7, fileName: "a_report.pdf" },
        { profileId: 2, boreholeId: 8, fileName: "b_plan.pdf" },
      ],
    });
    uploadResumable.mockRejectedValueOnce(new Error("transport failed"));

    const outcome = await importBoreholeArchive(archiveFile, 3, handlers(new AbortController().signal));

    expect(uploadResumable).toHaveBeenCalledTimes(1);
    expect(discardPendingProfile).toHaveBeenCalledWith(1);
    expect(discardPendingProfile).toHaveBeenCalledWith(2);
    expect(outcome).toStrictEqual({ boreholeCount: 1, uploadedCount: 0, pendingCount: 2 });
  });

  it("keeps the boreholes it committed when the attachments are cancelled", async () => {
    const controller = new AbortController();
    importBoreholesJson.mockResolvedValue({
      boreholeCount: 4,
      attachments: [
        { profileId: 1, boreholeId: 7, fileName: "a_report.pdf" },
        { profileId: 2, boreholeId: 8, fileName: "b_plan.pdf" },
      ],
    });
    uploadResumable.mockImplementationOnce(async () => {
      controller.abort();
      throw new DOMException("The user aborted a request.", "AbortError");
    });

    const outcome = await importBoreholeArchive(archiveFile, 3, handlers(controller.signal));

    expect(outcome).toStrictEqual({ boreholeCount: 4, uploadedCount: 0, pendingCount: 2 });
    expect(discardPendingProfile).toHaveBeenCalledWith(2);
  });

  it("reports the boreholes before it starts on the attachments", async () => {
    importBoreholesJson.mockResolvedValue({
      boreholeCount: 1,
      attachments: [{ profileId: 1, boreholeId: 7, fileName: "a_report.pdf" }],
    });
    const given = handlers(new AbortController().signal);

    // Recorded rather than asserted inside the upload, whose rejection the import turns into a
    // discard: a failed expectation there would never reach the runner.
    const order: string[] = [];
    given.onImported.mockImplementation(() => order.push("imported"));
    uploadResumable.mockImplementation(async () => {
      order.push("uploaded");
      return 1;
    });

    await importBoreholeArchive(archiveFile, 3, given);

    expect(order).toStrictEqual(["imported", "uploaded"]);
  });

  it("discards the rows behind a discard that failed, and says which row was left behind", async () => {
    importBoreholesJson.mockResolvedValue({
      boreholeCount: 1,
      attachments: [
        { profileId: 1, boreholeId: 7, fileName: "a_report.pdf" },
        { profileId: 2, boreholeId: 8, fileName: "b_plan.pdf" },
        { profileId: 3, boreholeId: 9, fileName: "c_map.pdf" },
      ],
    });
    uploadResumable.mockRejectedValueOnce(new Error("transport failed"));
    discardPendingProfile.mockRejectedValueOnce(new Error("the connection is gone"));

    const outcome = await importBoreholeArchive(archiveFile, 3, handlers(new AbortController().signal));

    expect(discardPendingProfile.mock.calls.map(([profileId]) => profileId)).toStrictEqual([1, 2, 3]);
    expect(outcome).toStrictEqual({ boreholeCount: 1, uploadedCount: 0, pendingCount: 3 });
    expect(consoleError).toHaveBeenCalledWith("Could not discard the pending profile 1", expect.any(Error));
  });

  it("names the file on the wire and its place in the batch", async () => {
    importBoreholesJson.mockResolvedValue({
      boreholeCount: 1,
      attachments: [
        { profileId: 1, boreholeId: 7, fileName: "a_report.pdf" },
        { profileId: 2, boreholeId: 7, fileName: "b_plan.pdf" },
      ],
    });
    uploadResumable.mockImplementation(async (source, target, metadata, { onProgress }) => {
      onProgress({ loaded: 4, total: 10 });
      onProgress({ loaded: 10, total: 10 });
      return 1;
    });
    const given = handlers(new AbortController().signal);

    await importBoreholeArchive(archiveFile, 3, given);

    const reported: ArchiveImportProgress[] = given.onProgress.mock.calls.map(([progress]) => progress);
    expect(reported).toContainEqual({ fileName: "a_report.pdf", current: 1, count: 2, transferred: 4, total: 10 });
    expect(reported).toContainEqual({ fileName: "b_plan.pdf", current: 2, count: 2, transferred: 10, total: 10 });
  });

  it("discards the row of an attachment the archive does not hold, and uploads the rest", async () => {
    importBoreholesJson.mockResolvedValue({
      boreholeCount: 1,
      attachments: [
        { profileId: 1, boreholeId: 7, fileName: "missing.pdf" },
        { profileId: 2, boreholeId: 7, fileName: "b_plan.pdf" },
      ],
    });
    openBoreholeArchive.mockResolvedValue({
      json: "[]",
      entryFor: (name: string) => (name === "missing.pdf" ? undefined : sourceFor(name)),
      close,
    });
    uploadResumable.mockResolvedValue(1);

    const outcome = await importBoreholeArchive(archiveFile, 3, handlers(new AbortController().signal));

    expect(discardPendingProfile).toHaveBeenCalledTimes(1);
    expect(discardPendingProfile).toHaveBeenCalledWith(1);
    expect(uploadResumable).toHaveBeenCalledTimes(1);
    expect(outcome).toStrictEqual({ boreholeCount: 1, uploadedCount: 1, pendingCount: 1 });
  });

  it("discards the row of an attachment the result did not fully name, and uploads the rest", async () => {
    importBoreholesJson.mockResolvedValue({
      boreholeCount: 1,
      attachments: [{ profileId: 1 }, { profileId: 2, boreholeId: 7, fileName: "b_plan.pdf" }],
    });
    uploadResumable.mockResolvedValue(1);

    const outcome = await importBoreholeArchive(archiveFile, 3, handlers(new AbortController().signal));

    expect(discardPendingProfile).toHaveBeenCalledTimes(1);
    expect(discardPendingProfile).toHaveBeenCalledWith(1);
    expect(uploadResumable).toHaveBeenCalledTimes(1);
    expect(outcome).toStrictEqual({ boreholeCount: 1, uploadedCount: 1, pendingCount: 1 });
  });

  it("reports no boreholes when the result did not name a count", async () => {
    importBoreholesJson.mockResolvedValue({});

    const outcome = await importBoreholeArchive(archiveFile, 3, handlers(new AbortController().signal));

    expect(outcome).toStrictEqual({ boreholeCount: 0, uploadedCount: 0, pendingCount: 0 });
  });

  it("closes the archive when the import itself fails", async () => {
    importBoreholesJson.mockRejectedValue(new Error("the server refused the import"));

    await expect(importBoreholeArchive(archiveFile, 3, handlers(new AbortController().signal))).rejects.toThrow(
      "the server refused the import",
    );
    expect(close).toHaveBeenCalledTimes(1);
  });
});
