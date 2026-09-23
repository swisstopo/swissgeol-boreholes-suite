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

  /** Looks an attachment up under the name the JSON refers to it by. */
  entryFor: (fileName: string) => UploadSource | undefined;

  close: () => Promise<void>;
}

/** Only a file entry carries data; a directory entry is a name in the archive and nothing more. */
const isFile = (entry: Entry): entry is FileEntry => !entry.directory;

const isJsonEntry = (fileName: string): boolean => fileName.toLowerCase().endsWith(".json");

/**
 * The folder every entry of the archive sits under, which its names are read past.
 *
 * Packing an unpacked export back up with the Windows Explorer or the Finder nests the whole
 * export under one folder, while the names its JSON refers to the attachments by stay as the
 * export wrote them. A prefix every entry shares can be dropped without one name coming to meet
 * another, so such an archive reads as the flat one it was exported as. Entries spread over
 * several folders share no prefix and keep the names they carry, because which folder an
 * attachment was meant to be looked up under is not something to guess at.
 * @param files The file entries of the archive.
 * @returns The folder prefix they all share, or an empty string if they share none.
 */
const sharedFolderPrefix = (files: FileEntry[]): string => {
  if (files.length === 0) return "";

  const firstName = files[0].filename;
  const prefix = firstName.slice(0, firstName.indexOf("/") + 1);
  if (prefix === "") return "";

  return files.every(entry => entry.filename.startsWith(prefix)) ? prefix : "";
};

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
 * @param fileName The name the import refers to the entry by, which the upload is sent under.
 * @returns The entry as a source an upload can read.
 */
const sourceFor = (entry: FileEntry, fileName: string): UploadSource => ({
  size: entry.uncompressedSize,
  fileName,
  contentType: contentTypeFor(fileName),
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

  const prefix = sharedFolderPrefix(files);
  const nameOf = (entry: FileEntry): string => entry.filename.slice(prefix.length);

  const jsonEntry = files.find(entry => isJsonEntry(nameOf(entry)));
  if (jsonEntry === undefined) {
    await reader.close();
    throw new ArchiveJsonMissingError();
  }

  const json = await jsonEntry.getData<string>(new TextWriter());

  const attachments = new Map<string, UploadSource>();
  for (const entry of files) {
    if (entry === jsonEntry) continue;

    const fileName = nameOf(entry);
    attachments.set(fileName, sourceFor(entry, fileName));
  }

  return {
    json,
    entryFor: fileName => attachments.get(fileName),
    close: () => reader.close(),
  };
}
