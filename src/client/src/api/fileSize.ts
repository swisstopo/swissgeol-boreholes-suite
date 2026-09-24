/** The upload limits the API enforces, as it reports them in its settings. */
export interface FileSizeLimits {
  maxFileSize: number;
  largeMaxFileSize: number;
  maxImportArchiveSize: number;
  chunkSize: number;
}

let limits: FileSizeLimits | null = null;

/**
 * Keeps the limits the API reported, so that code which is not a component can read them too.
 * @param fileSizeLimits The limits as they arrived with the application settings.
 */
export function setFileSizeLimits(fileSizeLimits: FileSizeLimits): void {
  limits = fileSizeLimits;
}

/**
 * The limits, which are present for as long as anything can ask for them.
 */
function requireFileSizeLimits(): FileSizeLimits {
  if (limits === null) {
    throw new Error("The upload limits have not been read from the application settings yet.");
  }

  return limits;
}

/** The largest file the endpoints that take one in a single request accept, in bytes. */
export const getMaxFileSize = (): number => requireFileSizeLimits().maxFileSize;

/** The largest log file the chunked upload accepts, in bytes. */
export const getLargeMaxFileSize = (): number => requireFileSizeLimits().largeMaxFileSize;

/** The largest import archive the client accepts, in bytes. */
export const getMaxImportArchiveSize = (): number => requireFileSizeLimits().maxImportArchiveSize;

/** How much of a file the chunked upload sends per request, in bytes. */
export const getChunkSize = (): number => requireFileSizeLimits().chunkSize;

/**
 * Writes a size the way a limit is shown to the user, in the unit that leaves it a whole number.
 * @param bytes The size to write.
 * @returns The size with its unit.
 */
export function formatFileSize(bytes: number): string {
  const gigabytes = bytes / 1_000_000_000;
  if (gigabytes >= 1) return `${gigabytes} GB`;

  const megabytes = bytes / 1_000_000;
  return megabytes >= 1 ? `${megabytes} MB` : `${bytes / 1_000} KB`;
}
