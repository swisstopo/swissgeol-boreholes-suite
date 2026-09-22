/**
 * Progress of a single file transfer.
 * `total` is absent when the size is not known in advance, which is the case for
 * chunked responses such as the streamed ZIP exports.
 */
export interface TransferProgress {
  loaded: number;
  total?: number;
}

export type TransferProgressCallback = (progress: TransferProgress) => void;

/**
 * How often a transferred amount shown to the user is refreshed.
 */
export const progressRefreshIntervalMs = 1000;

/** Lets a caller follow a long running transfer and give up on it. */
export interface TransferOptions {
  onProgress?: TransferProgressCallback;
  signal?: AbortSignal;
}

/** Whether a rejection was caused by the caller giving up rather than by a failure. */
export const isAbortError = (error: unknown): boolean => error instanceof DOMException && error.name === "AbortError";

const bytesPerMegabyte = 1_000_000;

const megabyteFormat = new Intl.NumberFormat("de-CH", {
  useGrouping: true,
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/**
 * Formats a byte count for display, using decimal megabytes so the numbers match what
 * operating systems and cloud storage report. The unit stays at megabytes with a single
 * decimal for every size, so the number keeps visibly moving even during a large transfer.
 * @param bytes The number of bytes.
 * @returns The formatted size, e.g. `1'400.0 MB`.
 */
export const formatBytes = (bytes: number): string => {
  const megabytes = Number.isFinite(bytes) && bytes > 0 ? bytes / bytesPerMegabyte : 0;

  // de-CH groups with a typographic apostrophe, the application writes thousands with a plain one.
  return `${megabyteFormat.format(megabytes).replaceAll("’", "'")} MB`;
};
