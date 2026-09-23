import { BlobReader, Entry, FileEntry, TextWriter, ZipReader } from "@zip.js/zip.js";
import { UploadSource } from "./resumableUpload.ts";

/** The archive holds no description of what to import, so there is nothing to import from it. */
export class ArchiveJsonMissingError extends Error {
  constructor() {
    super("The archive holds no JSON file.");
    this.name = "ArchiveJsonMissingError";
  }
}

/** An archive the user picked, read entry by entry rather than held in memory. */
export interface BoreholeArchive {
  json: string;
  entryFor: (fileName: string) => UploadSource | undefined;
  close: () => Promise<void>;
}

/** Only a file entry carries data; a directory entry is a name in the archive and nothing more. */
const isFile = (entry: Entry): entry is FileEntry => !entry.directory;

const isJsonEntry = (entry: FileEntry): boolean => entry.filename.toLowerCase().endsWith(".json");

const knownContentTypes: Record<string, string | undefined> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  tif: "image/tiff",
  tiff: "image/tiff",
  csv: "text/csv",
  txt: "text/plain",
};

const contentTypeFor = (fileName: string): string => {
  const extension = fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase();
  return knownContentTypes[extension] ?? "application/octet-stream";
};

/**
 * Hands out an entry as something an upload can read, without the entry being held in memory.
 *
 * `open` returns both ends of the transfer at once: zip.js writes the entry into the transform as
 * it reads it, and the upload pulls the bytes off the other end. Cancelling that end errors the
 * writable one and releases whatever is parked on it, so `written` settles on the paths that give
 * up on the entry just as it does on the one that reads it to the end.
 * @param entry The entry of the archive to upload.
 * @returns The entry as a source an upload can read.
 */
const sourceFor = (entry: FileEntry): UploadSource => ({
  size: entry.uncompressedSize,
  fileName: entry.filename,
  contentType: contentTypeFor(entry.filename),
  open: () => {
    const transform = new TransformStream<Uint8Array, Uint8Array>();
    return { stream: transform.readable, written: entry.getData(transform.writable) };
  },
});

/**
 * Opens an archive and reads the description of what to import out of it.
 *
 * The archive is read through a `BlobReader`, which takes slices off the file as they are needed,
 * so an archive far larger than memory can be opened. Only the JSON is read up front, because it
 * describes the import and is small; every attachment is left where it is until it is uploaded.
 * @param file The archive the user picked.
 * @returns The archive, which the caller closes once it has finished with it.
 * @throws {ArchiveJsonMissingError} If the archive holds no JSON file.
 */
export async function openBoreholeArchive(file: File): Promise<BoreholeArchive> {
  const reader = new ZipReader(new BlobReader(file));
  const files = (await reader.getEntries()).filter(isFile);

  const jsonEntry = files.find(isJsonEntry);
  if (jsonEntry === undefined) {
    await reader.close();
    throw new ArchiveJsonMissingError();
  }

  const json = await jsonEntry.getData<string>(new TextWriter());

  const attachments = new Map<string, UploadSource>();
  for (const entry of files) {
    if (entry !== jsonEntry) attachments.set(entry.filename, sourceFor(entry));
  }

  return {
    json,
    entryFor: fileName => attachments.get(fileName),
    close: () => reader.close(),
  };
}
