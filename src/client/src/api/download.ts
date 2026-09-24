import { ApiError } from "./errorClasses.ts";
import { fetchApiV2Base } from "./fetchApiV2.ts";
import { isAbortError, TransferOptions, TransferProgressCallback } from "./transferProgress.ts";

declare global {
  interface Window {
    /**
     * The save dialog of Chrome and Edge. Firefox and Safari do not offer it, which is also why
     * TypeScript's DOM library leaves it out.
     */
    showSaveFilePicker?: (options: { suggestedName: string }) => Promise<FileSystemFileHandle>;
  }
}

const getFallbackFileName = (url: string): string => {
  const match = /export\/(\w+)\?/.exec(url);
  if (!match) return "export";
  return `export.${match[1]}`;
};

const getFileName = (response: Response, fallback: string): string =>
  response.headers.get("content-disposition")?.split("; ")[1]?.replace("filename=", "") ?? fallback;

/**
 * Transfer options plus the name to save under, for the callers that already know it and do not
 * want the one the response suggests.
 */
interface DownloadOptions extends TransferOptions {
  fileName?: string;
}

/**
 * Reads a response body while reporting how much of it has arrived.
 *
 * The large exports are streamed as chunked ZIP archives and carry no `Content-Length`,
 * so `total` stays undefined for them and only the transferred amount can be reported.
 * @param response The response to read.
 * @param onProgress Invoked as chunks arrive.
 * @returns The complete body.
 */
const readBlobWithProgress = async (response: Response, onProgress?: TransferProgressCallback): Promise<Blob> => {
  if (!onProgress || !response.body) return await response.blob();

  const contentLength = response.headers.get("content-length");
  const total = contentLength ? Number(contentLength) : undefined;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  onProgress({ loaded, total });
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress({ loaded, total });
  }

  return new Blob(chunks as BlobPart[], { type: response.headers.get("content-type") ?? undefined });
};

/**
 * Counts the bytes passing through, so a transfer written straight into a file still reports its progress.
 * @param onProgress Invoked as chunks pass.
 * @returns A stream that hands every chunk on unchanged.
 */
const countBytes = (onProgress?: TransferProgressCallback): TransformStream<Uint8Array, Uint8Array> => {
  let loaded = 0;
  return new TransformStream({
    transform: (chunk, controller) => {
      loaded += chunk.byteLength;
      onProgress?.({ loaded });
      controller.enqueue(chunk);
    },
  });
};

/**
 * Saves an archive into a file the user picks, writing every chunk as it arrives, so an export of many
 * gigabytes never has to fit into memory. Where the browser has no save dialog, or refuses to write to
 * the picked file, the archive is saved through the browser's own download instead, which holds it in
 * memory until it is complete.
 *
 * The dialog opens before the request is sent, because the browser only shows it while the click that
 * started the export still counts, and preparing an export can take longer than that. The name the
 * server gives the archive is therefore not known yet, so the caller suggests one.
 * @param suggestedName The file name the save dialog proposes.
 * @param request Sends the request for the archive.
 * @param saveThroughBrowser Saves the archive through the browser's own download.
 * @param onProgress Invoked as chunks are written.
 * @returns The response, or nothing if the user dismissed the save dialog.
 */
const saveArchive = async (
  suggestedName: string,
  request: () => Promise<Response>,
  saveThroughBrowser: () => Promise<Response>,
  onProgress?: TransferProgressCallback,
): Promise<Response | undefined> => {
  if (!window.showSaveFilePicker) return await saveThroughBrowser();

  let file: FileSystemWritableFileStream;
  try {
    const handle = await window.showSaveFilePicker({ suggestedName });
    file = await handle.createWritable();
  } catch (error) {
    // Dismissing the dialog is a decision not to save rather than a failure.
    if (isAbortError(error)) return undefined;
    // A policy can forbid writing to picked files while still allowing ordinary downloads.
    return await saveThroughBrowser();
  }

  try {
    const response = await request();
    if (!response.ok || response.body === null) {
      throw new ApiError("errorOccurredWhileFetchingFileFromCloudStorage", response.status);
    }
    onProgress?.({ loaded: 0 });
    await response.body.pipeThrough(countBytes(onProgress)).pipeTo(file);
    return response;
  } catch (error) {
    // Aborting rather than closing throws away what was written, so a failed or cancelled export never
    // leaves a truncated archive that looks complete.
    await file.abort(error);
    throw error;
  }
};

export async function download(url: string, { onProgress, signal, fileName }: DownloadOptions = {}): Promise<Response> {
  const response = await fetchApiV2Base(url, "GET", null, null, signal);
  if (!response.ok) {
    throw new ApiError("errorOccurredWhileFetchingFileFromCloudStorage", response.status);
  }
  const blob = await readBlobWithProgress(response, onProgress);
  downloadDataFromBlob(blob, fileName ?? getFileName(response, getFallbackFileName(url)));
  return response;
}

export async function downloadPost(
  url: string,
  body: object,
  { onProgress, signal }: TransferOptions = {},
): Promise<Response> {
  const response = await fetchApiV2Base(url, "POST", JSON.stringify(body), "application/json", signal);
  if (!response.ok) {
    throw new ApiError("errorOccurredWhileFetchingFileFromCloudStorage", response.status);
  }
  const blob = await readBlobWithProgress(response, onProgress);
  downloadDataFromBlob(blob, getFileName(response, getFallbackFileName(url)));
  return response;
}

/**
 * Downloads an archive that can run to many gigabytes. See {@link saveArchive} for where it is saved.
 * @param url The API path of the archive.
 * @param suggestedName The file name the save dialog proposes.
 * @param options Lets the caller follow the transfer and give up on it.
 * @returns The response, or nothing if the user dismissed the save dialog.
 */
export async function downloadArchive(
  url: string,
  suggestedName: string,
  { onProgress, signal }: TransferOptions = {},
): Promise<Response | undefined> {
  return await saveArchive(
    suggestedName,
    () => fetchApiV2Base(url, "GET", null, null, signal),
    () => download(url, { onProgress, signal }),
    onProgress,
  );
}

/**
 * Downloads an archive requested by POST that can run to many gigabytes. See {@link saveArchive} for
 * where it is saved.
 * @param url The API path of the archive.
 * @param body The request body, sent as JSON.
 * @param suggestedName The file name the save dialog proposes.
 * @param options Lets the caller follow the transfer and give up on it.
 * @returns The response, or nothing if the user dismissed the save dialog.
 */
export async function downloadArchivePost(
  url: string,
  body: object,
  suggestedName: string,
  { onProgress, signal }: TransferOptions = {},
): Promise<Response | undefined> {
  return await saveArchive(
    suggestedName,
    () => fetchApiV2Base(url, "POST", JSON.stringify(body), "application/json", signal),
    () => downloadPost(url, body, { onProgress, signal }),
    onProgress,
  );
}

export const downloadData = (dataString: string, fileName: string, type: string) => {
  const blob = new Blob([dataString], { type: type });
  downloadDataFromBlob(blob, fileName);
};

const downloadDataFromBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const downloadCodelistCsv = (): Promise<Response> => download(`codelist/csv`);
