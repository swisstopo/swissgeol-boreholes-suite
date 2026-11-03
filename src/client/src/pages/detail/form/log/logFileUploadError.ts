import { ApiError } from "../../../../api/errorClasses.ts";
import { formatFileSize, getLargeMaxFileSize } from "../../../../api/fileSize.ts";

/**
 * The status the upload endpoint answers a file larger than it accepts with. A proxy in front of it
 * answers a request over its own body limit the same way, so the status alone does not say that
 * the file is too large.
 */
const payloadTooLargeStatus = 413;

/**
 * Turns a failed log file upload into an error the save alert can show.
 *
 * A run is saved with several files, so a message that does not name the file leaves the user
 * guessing which one to look at. A refusal the server already put in words is passed on as it is,
 * so every key the upload endpoint sends has to carry the file name itself.
 * @param error What the upload rejected with. A cancellation is not a failure and is not passed in.
 * @param file The file being uploaded.
 * @returns The error to throw.
 */
export const toLogFileUploadError = (error: unknown, file: File): ApiError => {
  if (error instanceof ApiError && error.messageKey) return error;

  const status = error instanceof ApiError ? error.status : undefined;
  const message = error instanceof Error ? error.message : String(error);
  const maxFileSize = getLargeMaxFileSize();

  if (status === payloadTooLargeStatus && file.size > maxFileSize) {
    return new ApiError(message, status, "logFileTooLarge", {
      fileName: file.name,
      size: formatFileSize(maxFileSize),
    });
  }

  return new ApiError(message, status, "logFileUploadFailed", { fileName: file.name });
};
