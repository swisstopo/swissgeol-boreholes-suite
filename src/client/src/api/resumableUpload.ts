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
 * `open` hands back both ends of the transfer: the stream the upload reads, and `written`, which
 * follows whatever fills it. The caller of `uploadResumable` never sees the second one, because
 * the upload waits for it before settling, so that an entry which never made it is not reported as
 * one that did. Whether it fulfils or rejects makes no difference; a failed writer belongs to an
 * upload that has already failed.
 *
 * An implementation has to hold to one thing: **`written` settles once the stream is cancelled**,
 * and not only once the bytes have all been written. An upload that fails or that the user gives
 * up on cancels the stream and then waits, so a writer parked on anything the cancellation does
 * not release leaves that upload waiting for good. A finished upload is the one case where the
 * stream is not cancelled first: every byte has been read by then, so there is nothing left for
 * the writer to be parked on.
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
  body: File | Pick<ReadableStreamDefaultReader<Uint8Array>, "read">;

  /**
   * Settles once whatever fills the source is done, whether it finished or failed.
   *
   * A failure is already taken, so this can be waited on as it is and never rejects.
   */
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
    // The upload client is handed something it can only read from, not the reader itself. It
    // closes its source the moment an upload succeeds, and it closes it by cancelling whatever it
    // was given, which would cut the writer off before it has been waited for. Cancelling is the
    // helper's alone, on every path.
    body: { read: () => reader.read() },

    // The failure is taken the moment the source is opened rather than where it is waited for.
    // A source can fail of its own accord, on an archive the user moved away or an entry that
    // does not read back as it was stored, while the upload client reports nothing until its
    // retries are spent. Between the two there would otherwise be a rejection nobody had claimed.
    written: written.catch(() => undefined),
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
    // been judged, and was taken when the source was opened.
    const writerDone = (): Promise<unknown> => opened.written;

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
