import { BlobReader, BlobWriter, configure, ZipWriter } from "@zip.js/zip.js";
import { describe, expect, it } from "vitest";
import { ArchiveJsonMissingError, openBoreholeArchive } from "./zipArchive.ts";

// The node environment vitest runs in has no Worker, and a pool that never starts hangs the run.
configure({ useWebWorkers: false });

/** An entry too large to be written in one go, so its writer is still going after the first read. */
const streamedEntrySize = 5_000_000;

const bytes = (size: number): Uint8Array<ArrayBuffer> => {
  const value = new Uint8Array(new ArrayBuffer(size));
  for (let i = 0; i < size; i++) value[i] = i % 251;
  return value;
};

/**
 * Builds an archive the way an export does, storing the entries rather than compressing them.
 * @param entries The name and content of each entry, in the order they are written. An entry
 * without content is the folder itself, which is what a zipper adds for a folder it packs.
 * @returns The archive as the file picker would hand it over.
 */
async function archiveWith(entries: [string, Blob?][]): Promise<File> {
  const writer = new ZipWriter(new BlobWriter("application/zip"));
  for (const [name, content] of entries) {
    await writer.add(name, content === undefined ? undefined : new BlobReader(content), { level: 0 });
  }
  return new File([await writer.close()], "export.zip", { type: "application/zip" });
}

/**
 * Follows a promise for a while, so a test can tell a slow one from one that never settles.
 *
 * A rejection is as much an outcome as a value here: what is being watched is whether the promise
 * lets go of its waiter at all.
 * @param promise The promise to follow.
 * @param milliseconds How long to give it.
 * @returns Whether it settled within that time.
 */
async function outcomeOf(promise: Promise<unknown>, milliseconds: number): Promise<"settled" | "pending"> {
  let settled = false;
  const markSettled = () => {
    settled = true;
  };
  void promise.then(markSettled, markSettled);

  const deadline = Date.now() + milliseconds;
  while (!settled && Date.now() < deadline) {
    await new Promise<void>(resolve => setTimeout(resolve, 10));
  }

  return settled ? "settled" : "pending";
}

describe("openBoreholeArchive", () => {
  it("reads the json entry", async () => {
    const archive = await archiveWith([
      ["export.json", new Blob(['[{"id":1}]'])],
      ["uuid_report.pdf", new Blob([bytes(1024)])],
    ]);

    const opened = await openBoreholeArchive(archive);

    expect(opened.json).toBe('[{"id":1}]');
    await opened.close();
  });

  it("refuses an archive with no json entry", async () => {
    const archive = await archiveWith([["uuid_report.pdf", new Blob([bytes(16)])]]);

    await expect(openBoreholeArchive(archive)).rejects.toBeInstanceOf(ArchiveJsonMissingError);
  });

  it("hands out an entry as a source carrying its size and name", async () => {
    const archive = await archiveWith([
      ["export.json", new Blob(["[]"])],
      ["uuid_report.pdf", new Blob([bytes(2048)])],
    ]);

    const opened = await openBoreholeArchive(archive);
    const source = opened.entryFor("uuid_report.pdf");

    expect(source?.size).toBe(2048);
    expect(source?.fileName).toBe("uuid_report.pdf");
    expect(source?.contentType).toBe("application/pdf");
    await opened.close();
  });

  it("does not know an entry the archive does not hold", async () => {
    const archive = await archiveWith([["export.json", new Blob(["[]"])]]);

    const opened = await openBoreholeArchive(archive);

    expect(opened.entryFor("uuid_missing.pdf")).toBeUndefined();
    await opened.close();
  });

  it("reads an archive whose entries all sit under one folder", async () => {
    // What a zipper makes of an unpacked export: everything nested under the folder it sat in,
    // while the names the JSON refers to its attachments by stayed as the export wrote them.
    const archive = await archiveWith([
      ["MyExport/"],
      ["MyExport/export.json", new Blob(['[{"id":1}]'])],
      ["MyExport/uuid_report.pdf", new Blob([bytes(2048)])],
    ]);

    const opened = await openBoreholeArchive(archive);
    const source = opened.entryFor("uuid_report.pdf");

    expect(opened.json).toBe('[{"id":1}]');
    expect(source?.size).toBe(2048);
    expect(source?.fileName).toBe("uuid_report.pdf");
    await opened.close();
  });

  it("leaves a flat archive's names alone, since its entries share no folder", async () => {
    const archive = await archiveWith([
      ["export.json", new Blob(["[]"])],
      ["uuid_report.pdf", new Blob([bytes(2048)])],
      ["uuid_photo.png", new Blob([bytes(512)])],
    ]);

    const opened = await openBoreholeArchive(archive);

    expect(opened.entryFor("uuid_report.pdf")?.fileName).toBe("uuid_report.pdf");
    expect(opened.entryFor("uuid_photo.png")?.size).toBe(512);
    await opened.close();
  });

  it("does not guess which folder an entry belongs to when they sit in several", async () => {
    const archive = await archiveWith([
      ["one/export.json", new Blob(["[]"])],
      ["two/uuid_report.pdf", new Blob([bytes(2048)])],
    ]);

    const opened = await openBoreholeArchive(archive);

    // The entry is in the archive, under a name the JSON does not refer to it by. Only a guess at
    // which folder was meant would turn the one into the other.
    expect(opened.entryFor("uuid_report.pdf")).toBeUndefined();
    expect(opened.entryFor("two/uuid_report.pdf")?.size).toBe(2048);
    await opened.close();
  });

  it("streams an entry's bytes intact", async () => {
    const content = bytes(4096);
    const archive = await archiveWith([
      ["export.json", new Blob(["[]"])],
      ["uuid_report.pdf", new Blob([content])],
    ]);

    const opened = await openBoreholeArchive(archive);
    const { stream, written } = opened.entryFor("uuid_report.pdf")!.open();

    const received: number[] = [];
    const reader = stream.getReader();
    for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
      received.push(...chunk.value);
    }

    await written;
    await opened.close();

    expect(received).toStrictEqual(Array.from(content));
  });

  it("settles the writer when the upload gives up on the stream", async () => {
    const archive = await archiveWith([
      ["export.json", new Blob(["[]"])],
      ["uuid_report.pdf", new Blob([bytes(streamedEntrySize)])],
    ]);

    const opened = await openBoreholeArchive(archive);
    const { stream, written } = opened.entryFor("uuid_report.pdf")!.open();

    const reader = stream.getReader();
    const first = await reader.read();

    // Only a writer that is still going proves anything: one that has already written the entry to
    // the end settles on its own, whether or not the reader ever lets go.
    expect(first.done).toBe(false);
    expect(first.value?.byteLength).toBeLessThan(streamedEntrySize);
    expect(await outcomeOf(written, 100)).toBe("pending");

    // An upload that fails or that the user gives up on lets go of the stream and then waits for
    // the writer, exactly as `uploadResumable` does: it cancels without waiting on the cancel.
    void reader.cancel().catch(() => undefined);

    expect(await outcomeOf(written, 2000)).toBe("settled");
    await opened.close();
  });
});
