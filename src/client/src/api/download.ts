import { ApiError } from "./errorClasses.ts";
import { fetchApiV2Base } from "./fetchApiV2.ts";
import { TransferOptions, TransferProgressCallback } from "./transferProgress.ts";

const getFallbackFileName = (url: string): string => {
  const match = /export\/(\w+)\?/.exec(url);
  if (!match) return "export";
  return `export.${match[1]}`;
};

const getFileName = (response: Response, fallback: string): string =>
  response.headers.get("content-disposition")?.split("; ")[1]?.replace("filename=", "") ?? fallback;

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

export async function download(url: string, { onProgress, signal }: TransferOptions = {}): Promise<Response> {
  const response = await fetchApiV2Base(url, "GET", null, null, signal);
  if (!response.ok) {
    throw new ApiError("errorOccurredWhileFetchingFileFromCloudStorage", response.status);
  }
  const blob = await readBlobWithProgress(response, onProgress);
  downloadDataFromBlob(blob, getFileName(response, getFallbackFileName(url)));
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
