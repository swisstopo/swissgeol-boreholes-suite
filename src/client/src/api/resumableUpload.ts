import { DetailedError, Upload } from "tus-js-client";
import { getAuthToken } from "../auth/authTokenStore.ts";
import { getAuthorizationHeader } from "./authentication.ts";
import { isUserErrorProblem, toUserError } from "./errorClasses.ts";
import { TransferOptions } from "./transferProgress.ts";

/**
 * How much of the file goes in one request, which is also how much goes into one part of the
 * upload the server assembles in the cloud storage. The storage refuses a part below 5 MiB
 * unless it is the last one, so this cannot go lower. It also has to clear the minute the
 * infrastructure allows a request: 5 MiB is about 25 seconds at 200 KB/s.
 */
const chunkSize = 5 * 1024 * 1024;

const uploadEndpoint = "/api/v2/log/upload/tus";

/** The response header carrying the id of the log file the server stored. */
const logFileIdHeader = "Log-File-Id";

const abortError = () => new DOMException("The user aborted a request.", "AbortError");

const isDetailedError = (error: Error): error is DetailedError => "originalResponse" in error;

/**
 * Reads the reason out of a failed chunk.
 *
 * A failure while the server stores the finished upload is answered with the same problem body
 * the other upload endpoints send, so it is turned into the same error the rest of the API layer
 * throws. Anything else is a transport failure and is passed on as it is.
 * @param error The failure reported by the upload client.
 * @returns The error to reject with.
 */
const toApiError = (error: Error): Error => {
  if (!isDetailedError(error)) return error;

  const response = error.originalResponse;
  if (response === null) return error;

  let body: unknown;
  try {
    body = JSON.parse(response.getBody());
  } catch {
    return error;
  }

  return isUserErrorProblem(body) ? toUserError(body, response.getStatus()) : error;
};

/**
 * Uploads a file in chunks, so no single request is long enough to be cut off.
 * @param file The file to upload.
 * @param metadata What the file is for, read by the server from the upload metadata.
 * @param options Progress reporting and cancellation.
 * @returns The id of the log file the server stored.
 * @throws {ApiError} If the server refused the upload for a reason the user can act on.
 * @throws {DOMException} Named `AbortError` if the signal is aborted.
 */
export function uploadResumable(
  file: File,
  metadata: Record<string, string>,
  { onProgress, signal }: TransferOptions = {},
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const upload = new Upload(file, {
      endpoint: uploadEndpoint,
      chunkSize,

      // A chunk that fails is retried within the upload it belongs to. Nothing picks an upload
      // back up in a later session, so the fingerprints kept for that would only accumulate.
      storeFingerprintForResuming: false,
      metadata: { ...metadata, filename: file.name, contentType: file.type || "application/octet-stream" },

      // The token is read per request rather than once, because a large file on a slow
      // connection takes longer to send than the token it started with stays valid, and a chunk
      // refused for an expired token is not retried.
      onBeforeRequest: request => {
        const authentication = getAuthToken();
        if (authentication !== null) {
          request.setHeader("Authorization", getAuthorizationHeader(authentication));
        }
      },
      onProgress: (loaded, total) => onProgress?.({ loaded, total }),
      onError: error => {
        stopListeningForAbort();
        reject(toApiError(error));
      },
      onSuccess: ({ lastResponse }) => {
        stopListeningForAbort();

        // A missing header reads as NaN and an empty one as zero, neither of which is an id.
        const logFileId = Number(lastResponse.getHeader(logFileIdHeader));
        if (!Number.isInteger(logFileId) || logFileId <= 0) {
          reject(new Error("The server did not report which log file it stored."));
          return;
        }

        resolve(logFileId);
      },
    });

    // Giving up has to tell the server as well, otherwise the chunks already sent sit on the
    // host until they expire. Failing to reach it changes nothing for the caller, who has
    // already given up, and the chunks left behind are swept once they expire.
    const abort = () => {
      upload.abort(true).catch(() => {});
      reject(abortError());
    };
    const stopListeningForAbort = () => signal?.removeEventListener("abort", abort);
    signal?.addEventListener("abort", abort, { once: true });

    upload.start();
  });
}
