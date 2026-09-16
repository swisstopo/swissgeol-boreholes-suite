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

const byteUnits = ["B", "KB", "MB", "GB", "TB"];

/** Bytes are always whole, larger units keep one decimal so the number still moves while transferring. */
const decimalsForUnit = (unitIndex: number): number => (unitIndex === 0 ? 0 : 1);

const roundToUnit = (bytes: number, unitIndex: number): number =>
  Number((bytes / 1000 ** unitIndex).toFixed(decimalsForUnit(unitIndex)));

/**
 * Formats a byte count for display, using decimal units so the numbers match what
 * operating systems and cloud storage report. Rounded to a whole number for bytes,
 * and to one decimal for larger units.
 * @param bytes The number of bytes.
 * @returns The formatted size, e.g. `1.4 GB`.
 */
export const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const magnitudeUnitIndex = Math.min(Math.floor(Math.log10(bytes) / 3), byteUnits.length - 1);

  // Rounding can lift the value onto the next unit's threshold, e.g. 999.95 KB would read as
  // "1000.0 KB", so the unit is only settled once the rounded value is known.
  const roundsOntoNextUnit =
    roundToUnit(bytes, magnitudeUnitIndex) >= 1000 && magnitudeUnitIndex < byteUnits.length - 1;
  const unitIndex = roundsOntoNextUnit ? magnitudeUnitIndex + 1 : magnitudeUnitIndex;

  return `${roundToUnit(bytes, unitIndex).toFixed(decimalsForUnit(unitIndex))} ${byteUnits[unitIndex]}`;
};
