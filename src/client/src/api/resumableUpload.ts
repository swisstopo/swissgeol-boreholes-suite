import { DetailedError, Upload } from "tus-js-client";
import { getAuthToken } from "../auth/authTokenStore.ts";
import { getAuthorizationHeader } from "./authentication.ts";
import { isUserErrorProblem, toUserError } from "./errorClasses.ts";
import { getChunkSize } from "./fileSize.ts";
import { TransferOptions } from "./transferProgress.ts";

/** Where a resumable upload is sent, and where its answer carries the id it stored. */
export interface ResumableUploadTarget {
  endpoint: string;
  resultHeader: string;
}

export const logFileUploadTarget: ResumableUploadTarget = {
  endpoint: "/api/v2/log/upload/tus",
  resultHeader: "Log-File-Id",
};

export const profileUploadTarget: ResumableUploadTarget = {
  endpoint: "/api/v2/profile/upload/tus",
  resultHeader: "Profile-Id",
};

/**
 * A file that is not held in memory, such as one entry of an archive the user picked.
 *
 * `open` hands back both ends of the transfer: the stream the upload reads, and a promise that
 * settles once whatever fills that stream is done. The caller of `uploadResumable` never sees the
 * second one, because letting the writer finish before the reader is closed is what keeps an
 * archive from being asked to write into a stream that has gone.
 */
export interface UploadSource {
  open: () => { stream: ReadableStream<Uint8Array>; written: Promise<unknown> };
  size: number;
  fileName: string;
  contentType: string;
}

const isUploadSource = (source: File | UploadSource): source is UploadSource => "open" in source;

/**
 * A source as the upload client works with it, whichever shape it arrived in.
 *
 * Nothing fills a file, so for one there is no writer to wait for, nothing to let go of, and no
 * size to pass on: it carries its own.
 */
interface OpenedSource {
  /** What the upload client reads the bytes from. */
  body: File | ReadableStreamDefaultReader<Uint8Array>;

  /** Settles once whatever fills the source is done, whether it finished or failed. */
  written: Promise<unknown>;

  /** Lets go of the source, so that whatever fills it is not left writing into it. */
  release: () => void;

  fileName: string;
  contentType: string;

  /** The size the upload client has to be told, because a stream cannot be asked for it. */
  uploadSize?: number;
}

const openSource = (source: File | UploadSource): OpenedSource => {
  if (!isUploadSource(source)) {
    return {
      body: source,
      written: Promise.resolve(),
      release: () => {},
      fileName: source.name,
      contentType: source.type || "application/octet-stream",
    };
  }

  const { stream, written } = source.open();
  const reader = stream.getReader();

  return {
    body: reader,
    written,
    release: () => {
      reader.cancel().catch(() => undefined);
    },
    fileName: source.fileName,
    contentType: source.contentType,
    uploadSize: source.size,
  };
};

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
 * @param source The file to upload, either held in memory or streamed from somewhere else.
 * @param target Where to send it, and which header carries the id of what was stored.
 * @param metadata What the file is for, read by the server from the upload metadata.
 * @param options Progress reporting and cancellation.
 * @returns The id of the row the server stored it as.
 * @throws {ApiError} If the server refused the upload for a reason the user can act on.
 * @throws {DOMException} Named `AbortError` if the signal is aborted.
 */
export function uploadResumable(
  source: File | UploadSource,
  target: ResumableUploadTarget,
  metadata: Record<string, string>,
  { onProgress, signal }: TransferOptions = {},
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const opened = openSource(source);

    // Whatever fills the source is waited for before this settles, so that an entry which never
    // made it is not reported as one that did. Its failure belongs to an upload that has already
    // been judged, so it is taken here rather than passed on.
    const writerDone = (): Promise<unknown> => opened.written.catch(() => undefined);

    // An upload that stops short leaves its source open, so that it could be resumed later.
    // Nothing here resumes one, and a stream nobody reads any more leaves its writer waiting for
    // good, so what is given up on is let go of first.
    const releaseWriter = (): Promise<unknown> => {
      opened.release();
      return writerDone();
    };

    const upload = new Upload(opened.body, {
      endpoint: target.endpoint,
      chunkSize: getChunkSize(),

      // A stream cannot be asked how long it is, so its size travels beside it. A file carries
      // its own, and the size left out for one reads the same as it not being passed at all.
      uploadSize: opened.uploadSize,

      // A chunk that fails is retried within the upload it belongs to. Nothing picks an upload
      // back up in a later session, so the fingerprints kept for that would only accumulate.
      storeFingerprintForResuming: false,
      metadata: { ...metadata, filename: opened.fileName, contentType: opened.contentType },

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
        void releaseWriter().then(() => reject(toApiError(error)));
      },
      onSuccess: ({ lastResponse }) => {
        stopListeningForAbort();

        // A missing header reads as NaN and an empty one as zero, neither of which is an id.
        const storedId = Number(lastResponse.getHeader(target.resultHeader));

        void writerDone().then(() => {
          if (!Number.isInteger(storedId) || storedId <= 0) {
            reject(new Error("The server did not report what it stored."));
            return;
          }

          resolve(storedId);
        });
      },
    });

    // Giving up has to tell the server as well, otherwise the chunks already sent sit on the
    // host until they expire. Failing to reach it changes nothing for the caller, who has
    // already given up, and the chunks left behind are swept once they expire.
    const abort = () => {
      upload.abort(true).catch(() => {});
      void releaseWriter().then(() => reject(abortError()));
    };
    const stopListeningForAbort = () => signal?.removeEventListener("abort", abort);
    signal?.addEventListener("abort", abort, { once: true });

    upload.start();
  });
}
