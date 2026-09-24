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

/** The names a packing tool writes for itself, whatever folder of the archive they turn up in. */
const bookkeepingNames = new Set([".ds_store", "thumbs.db"]);

/**
 * Whether an entry is the packing tool's own bookkeeping rather than a part of the export.
 *
 * The Finder stores the extended attributes of a file in an `__MACOSX` folder, under a companion
 * named `._` and then the file's own name. Anything that came through a browser carries such
 * attributes, so an export packed up again on a Mac holds a second entry for every file it holds.
 * Read as entries of the export, they sit at the archive root beside the folder it was packed
 * into, which leaves the entries sharing no folder to be read past, and `._export.json` reads as a
 * description of the import.
 * @param fileName The name the entry is stored under.
 * @returns Whether it is to be passed over.
 */
const isPackagingEntry = (fileName: string): boolean => {
  const segments = fileName.split("/");
  const baseName = segments[segments.length - 1];

  return segments[0] === "__MACOSX" || baseName.startsWith("._") || bookkeepingNames.has(baseName.toLowerCase());
};

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

/**
 * The entry holding the description of what to import.
 *
 * An export writes it beside the attachments, so one that sits in a folder of its own is an
 * attachment that happens to be a JSON. Such an entry is only fallen back on when the archive
 * holds nothing at its root, where a description would be.
 * @param files The file entries of the archive.
 * @param nameOf The name each entry is referred to by, its shared folder already read past.
 * @returns The entry to read the import from, or nothing if the archive holds no JSON at all.
 */
const jsonEntryOf = (files: FileEntry[], nameOf: (entry: FileEntry) => string): FileEntry | undefined => {
  const jsonEntries = files.filter(entry => isJsonEntry(nameOf(entry)));
  return jsonEntries.find(entry => !nameOf(entry).includes("/")) ?? jsonEntries[0];
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
  const files = (await reader.getEntries()).filter(isFile).filter(entry => !isPackagingEntry(entry.filename));

  const prefix = sharedFolderPrefix(files);
  const nameOf = (entry: FileEntry): string => entry.filename.slice(prefix.length);

  const jsonEntry = jsonEntryOf(files, nameOf);
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
