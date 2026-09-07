import { getAuthToken } from "../auth/authTokenStore.ts";
import { getAuthorizationHeader } from "./authentication.ts";
import { TransferOptions } from "./transferProgress.ts";

/**
 * Parses the raw header block returned by `XMLHttpRequest.getAllResponseHeaders()`
 * into the `Headers` instance a `Response` expects.
 * @param rawHeaders The CRLF separated header block.
 * @returns The parsed headers.
 */
const parseResponseHeaders = (rawHeaders: string): Headers => {
  const headers = new Headers();
  for (const line of rawHeaders.trim().split(/[\r\n]+/)) {
    const separatorIndex = line.indexOf(": ");
    if (separatorIndex > 0) {
      headers.append(line.slice(0, separatorIndex), line.slice(separatorIndex + 2));
    }
  }
  return headers;
};

const abortError = () => new DOMException("The user aborted a request.", "AbortError");

/**
 * Uploads a payload, reports how much of it has reached the server, and can be given up on.
 *
 * `fetch()` cannot observe request progress, so this uses `XMLHttpRequest` and wraps its
 * outcome back into a `Response`. Callers therefore keep working with the same type the
 * rest of the API layer returns, and response handling stays in one place.
 * @param url The endpoint URL relative to the base API path.
 * @param method The HTTP method.
 * @param payload The file data to upload.
 * @param options Progress reporting and cancellation.
 * @returns The HTTP response.
 * @throws {TypeError} If the request fails before a response is received, matching `fetch()`.
 * @throws {DOMException} Named `AbortError` if the signal is aborted.
 */
export function uploadWithProgress(
  url: string,
  method: string,
  payload: FormData,
  { onProgress, signal }: TransferOptions = {},
): Promise<Response> {
  return new Promise<Response>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open(method, "/api/v2/" + url);

    const authentication = getAuthToken();
    if (authentication !== null) {
      xhr.setRequestHeader("Authorization", getAuthorizationHeader(authentication));
    }

    xhr.responseType = "blob";
    xhr.withCredentials = false;

    const stopListeningForAbort = () => signal?.removeEventListener("abort", abort);
    function abort() {
      xhr.abort();
    }
    signal?.addEventListener("abort", abort, { once: true });

    if (onProgress) {
      xhr.upload.onprogress = event => {
        onProgress({ loaded: event.loaded, total: event.lengthComputable ? event.total : undefined });
      };
    }

    xhr.onload = () => {
      stopListeningForAbort();

      // A completed request without a status never reached the server, e.g. it was blocked.
      if (xhr.status === 0) {
        reject(new TypeError("Failed to fetch"));
        return;
      }

      // The Response constructor rejects a body on these statuses.
      const bodilessStatuses = [204, 205, 304];
      const body = bodilessStatuses.includes(xhr.status) ? null : xhr.response;

      resolve(
        new Response(body, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseResponseHeaders(xhr.getAllResponseHeaders()),
        }),
      );
    };

    // A transport failure carries no status, so it is surfaced the same way fetch() surfaces it.
    const rejectWith = (error: Error) => () => {
      stopListeningForAbort();
      reject(error);
    };
    xhr.onerror = rejectWith(new TypeError("Failed to fetch"));
    xhr.ontimeout = rejectWith(new TypeError("Failed to fetch"));
    xhr.onabort = rejectWith(abortError());

    xhr.send(payload);
  });
}
