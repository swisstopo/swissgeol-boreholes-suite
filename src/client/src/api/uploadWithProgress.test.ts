import { afterEach, describe, expect, it, vi } from "vitest";
import { clearAuthToken, setAuthToken } from "../auth/authTokenStore.ts";
import { TransferProgress } from "./transferProgress.ts";
import { uploadWithProgress } from "./uploadWithProgress.ts";

interface StubbedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: FormData | null;
  aborted: boolean;
  emitUploadProgress: (loaded: number, total: number, lengthComputable?: boolean) => void;
  respond: (status: number, body: string | null, headers?: string) => void;
  fail: () => void;
}

/**
 * Replaces XMLHttpRequest with a stub whose lifecycle the test drives, and returns the
 * request the code under test opened.
 */
const stubXhr = (): StubbedRequest => {
  const request = {
    headers: {} as Record<string, string>,
    aborted: false,
  } as StubbedRequest & Record<string, unknown>;

  class XhrStub {
    upload: { onprogress?: (event: ProgressEvent) => void } = {};
    onload?: () => void;
    onerror?: () => void;
    ontimeout?: () => void;
    onabort?: () => void;
    responseType = "";
    withCredentials = false;
    status = 0;
    statusText = "";
    response: unknown = null;
    private rawHeaders = "";

    open(method: string, url: string) {
      request.method = method;
      request.url = url;
    }

    setRequestHeader(name: string, value: string) {
      request.headers[name] = value;
    }

    getAllResponseHeaders() {
      return this.rawHeaders;
    }

    abort() {
      request.aborted = true;
      this.onabort?.();
    }

    send(body: FormData | null) {
      request.body = body;
      request.emitUploadProgress = (loaded, total, lengthComputable = true) =>
        this.upload.onprogress?.({ loaded, total, lengthComputable } as ProgressEvent);
      request.respond = (status, responseBody, headers = "content-type: application/json") => {
        this.status = status;
        this.statusText = status === 200 ? "OK" : "Error";
        this.response = responseBody;
        this.rawHeaders = headers;
        this.onload?.();
      };
      request.fail = () => this.onerror?.();
    }
  }

  vi.stubGlobal("XMLHttpRequest", XhrStub);
  return request;
};

const uploadPayload = () => {
  const formData = new FormData();
  formData.append("file", new Blob(["content"]), "RUN-01.dlis");
  return formData;
};

afterEach(() => {
  vi.unstubAllGlobals();
  clearAuthToken();
});

describe("uploadWithProgress", () => {
  it("targets the v2 API and sends the payload unchanged", async () => {
    const request = stubXhr();
    const payload = uploadPayload();

    const responsePromise = uploadWithProgress("log/upload?logRunId=1", "POST", payload);
    request.respond(200, "{}");
    await responsePromise;

    expect(request.method).toBe("POST");
    expect(request.url).toBe("/api/v2/log/upload?logRunId=1");
    expect(request.body).toBe(payload);
  });

  it("omits the Content-Type header so the browser sets the multipart boundary", async () => {
    const request = stubXhr();

    const responsePromise = uploadWithProgress("log/upload", "POST", uploadPayload());
    request.respond(200, "{}");
    await responsePromise;

    expect(Object.keys(request.headers)).not.toContain("Content-Type");
  });

  it("sends the bearer token when the user is authenticated", async () => {
    const request = stubXhr();
    setAuthToken({ token_type: "Bearer", access_token: "abc" });

    const responsePromise = uploadWithProgress("log/upload", "POST", uploadPayload());
    request.respond(200, "{}");
    await responsePromise;

    expect(request.headers.Authorization).toBe("Bearer abc");
  });

  it("sends no Authorization header in anonymous mode", async () => {
    const request = stubXhr();

    const responsePromise = uploadWithProgress("log/upload", "POST", uploadPayload());
    request.respond(200, "{}");
    await responsePromise;

    expect(request.headers.Authorization).toBeUndefined();
  });

  it("reports every upload progress event", async () => {
    const request = stubXhr();
    const reported: TransferProgress[] = [];

    const responsePromise = uploadWithProgress("log/upload", "POST", uploadPayload(), {
      onProgress: p => reported.push(p),
    });
    request.emitUploadProgress(30, 100);
    request.emitUploadProgress(100, 100);
    request.respond(200, "{}");
    await responsePromise;

    expect(reported).toEqual([
      { loaded: 30, total: 100 },
      { loaded: 100, total: 100 },
    ]);
  });

  it("omits the total when the payload size is not computable", async () => {
    const request = stubXhr();
    const reported: TransferProgress[] = [];

    const responsePromise = uploadWithProgress("log/upload", "POST", uploadPayload(), {
      onProgress: p => reported.push(p),
    });
    request.emitUploadProgress(30, 0, false);
    request.respond(200, "{}");
    await responsePromise;

    expect(reported).toEqual([{ loaded: 30, total: undefined }]);
  });

  it("returns a Response carrying the status, headers and body", async () => {
    const request = stubXhr();

    const responsePromise = uploadWithProgress("log/upload", "POST", uploadPayload());
    request.respond(200, '{"id":42}');
    const response = await responsePromise;

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    await expect(response.json()).resolves.toEqual({ id: 42 });
  });

  it("returns a failing Response instead of throwing, so error handling stays with the caller", async () => {
    const request = stubXhr();

    const responsePromise = uploadWithProgress("log/upload", "POST", uploadPayload());
    request.respond(400, '{"type":"userError"}');
    const response = await responsePromise;

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });

  it("drops the body on a status that forbids one", async () => {
    const request = stubXhr();

    const responsePromise = uploadWithProgress("log/upload", "POST", uploadPayload());
    request.respond(204, "unexpected body");
    const response = await responsePromise;

    expect(response.status).toBe(204);
    await expect(response.text()).resolves.toBe("");
  });

  it("rejects like fetch when the request never reaches the server", async () => {
    const request = stubXhr();

    const responsePromise = uploadWithProgress("log/upload", "POST", uploadPayload());
    request.fail();

    await expect(responsePromise).rejects.toThrow(TypeError);
  });

  it("rejects when the request completes without a status", async () => {
    const request = stubXhr();

    const responsePromise = uploadWithProgress("log/upload", "POST", uploadPayload());
    request.respond(0, null, "");

    await expect(responsePromise).rejects.toThrow(TypeError);
  });
});

describe("uploadWithProgress cancellation", () => {
  const isAbortRejection = (error: unknown) => error instanceof DOMException && error.name === "AbortError";

  it("stops the request when the signal is aborted", async () => {
    const request = stubXhr();
    const controller = new AbortController();

    const responsePromise = uploadWithProgress("log/upload", "POST", uploadPayload(), {
      signal: controller.signal,
    });
    controller.abort();

    await expect(responsePromise).rejects.toSatisfy(isAbortRejection);
    expect(request.aborted).toBe(true);
  });

  it("never opens a request when the signal is already aborted", async () => {
    const request = stubXhr();
    const controller = new AbortController();
    controller.abort();

    const responsePromise = uploadWithProgress("log/upload", "POST", uploadPayload(), {
      signal: controller.signal,
    });

    await expect(responsePromise).rejects.toSatisfy(isAbortRejection);
    expect(request.method).toBeUndefined();
  });

  it("completes normally when the signal is never aborted", async () => {
    const request = stubXhr();
    const controller = new AbortController();

    const responsePromise = uploadWithProgress("log/upload", "POST", uploadPayload(), {
      signal: controller.signal,
    });
    request.respond(200, "{}");

    await expect(responsePromise).resolves.toBeInstanceOf(Response);
    expect(request.aborted).toBe(false);
  });
});
