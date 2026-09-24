import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./errorClasses.ts";
import { setFileSizeLimits } from "./fileSize.ts";
import { logFileUploadTarget, profileUploadTarget, uploadResumable } from "./resumableUpload.ts";

interface StubbedUpload {
  body: unknown;
  options: Record<string, unknown>;
  start: () => void;
  abort: (terminate?: boolean) => Promise<void>;
}

/** The parts of a tus request the code under test touches. */
interface StubbedRequest {
  setHeader: (name: string, value: string) => void;
}

/** What a streamed source is handed over as, read back to see what the client could do with it. */
interface StubbedBody {
  read: () => Promise<ReadableStreamReadResult<Uint8Array>>;
  cancel?: () => Promise<void>;
}

const uploadInstances: StubbedUpload[] = [];

vi.mock("tus-js-client", () => ({
  Upload: class {
    body: unknown;
    options: Record<string, unknown>;
    start = vi.fn();
    abort = vi.fn(() => Promise.resolve());

    constructor(body: unknown, options: Record<string, unknown>) {
      this.body = body;
      this.options = options;
      uploadInstances.push(this as unknown as StubbedUpload);
    }
  },
}));

const authState = vi.hoisted(() => ({ token: null as { token_type: string; access_token: string } | null }));

vi.mock("../auth/authTokenStore.ts", () => ({ getAuthToken: () => authState.token }));

/** The options the code under test handed to the upload client. */
const optionsOf = <T>(): T => uploadInstances[0].options as T;

/** What the code under test handed the upload client to read the bytes from. */
const bodyOf = <T>(): T => uploadInstances[0].body as T;

/** The limits as the API reports them, which the application settings normally supply. */
const serverLimits = {
  maxFileSize: 210_000_000,
  largeMaxFileSize: 5_000_000_000,
  maxImportArchiveSize: 20_000_000_000,
  chunkSize: 6 * 1024 * 1024,
};

describe("uploadResumable", () => {
  beforeEach(() => {
    uploadInstances.length = 0;
    authState.token = null;
    setFileSizeLimits(serverLimits);
  });

  it("cuts the file into the chunks the server asked for", () => {
    setFileSizeLimits({ ...serverLimits, chunkSize: 1024 });
    void uploadResumable(new File(["x"], "gamma.las"), logFileUploadTarget, { logRunId: "1" });

    expect(optionsOf<{ chunkSize: number }>().chunkSize).toBe(1024);
  });

  it("reports how much has been sent", async () => {
    const onProgress = vi.fn();
    void uploadResumable(new File(["x"], "gamma.las"), logFileUploadTarget, { logRunId: "1" }, { onProgress });

    optionsOf<{ onProgress: (sent: number, total: number) => void }>().onProgress(512, 2048);

    expect(onProgress).toHaveBeenCalledWith({ loaded: 512, total: 2048 });
  });

  it("sends what the file is for", () => {
    void uploadResumable(new File(["x"], "gamma.las", { type: "text/plain" }), logFileUploadTarget, {
      logRunId: "1",
      logFileId: "7",
    });

    expect(optionsOf<{ metadata: Record<string, string> }>().metadata).toStrictEqual({
      logRunId: "1",
      logFileId: "7",
      filename: "gamma.las",
      contentType: "text/plain",
    });
  });

  it("reads the token again for every request", () => {
    authState.token = { token_type: "Bearer", access_token: "first" };
    void uploadResumable(new File(["x"], "gamma.las"), logFileUploadTarget, { logRunId: "1" });

    const setHeader = vi.fn();
    const { onBeforeRequest } = optionsOf<{ onBeforeRequest: (request: StubbedRequest) => void }>();

    onBeforeRequest({ setHeader });
    expect(setHeader).toHaveBeenCalledWith("Authorization", "Bearer first");

    // A file large enough to outlive the token it started with has to pick up the refreshed one.
    authState.token = { token_type: "Bearer", access_token: "second" };
    onBeforeRequest({ setHeader });

    expect(setHeader).toHaveBeenLastCalledWith("Authorization", "Bearer second");
  });

  it("sends no authorization when there is no token", () => {
    void uploadResumable(new File(["x"], "gamma.las"), logFileUploadTarget, { logRunId: "1" });

    const setHeader = vi.fn();
    optionsOf<{ onBeforeRequest: (request: StubbedRequest) => void }>().onBeforeRequest({ setHeader });

    expect(setHeader).not.toHaveBeenCalled();
  });

  it("resolves with the id the server reports", async () => {
    const pending = uploadResumable(new File(["x"], "gamma.las"), logFileUploadTarget, { logRunId: "1" });

    optionsOf<{
      onSuccess: (payload: { lastResponse: { getHeader: (name: string) => string | undefined } }) => void;
    }>().onSuccess({ lastResponse: { getHeader: () => "77" } });

    await expect(pending).resolves.toBe(77);
  });

  it("fails when the server reports no id", async () => {
    const pending = uploadResumable(new File(["x"], "gamma.las"), logFileUploadTarget, { logRunId: "1" });

    optionsOf<{
      onSuccess: (payload: { lastResponse: { getHeader: (name: string) => string | undefined } }) => void;
    }>().onSuccess({ lastResponse: { getHeader: () => undefined } });

    await expect(pending).rejects.toThrow("The server did not report what it stored.");
  });

  it("rejects with an abort error when the caller gives up", async () => {
    const controller = new AbortController();
    const pending = uploadResumable(
      new File(["x"], "gamma.las"),
      logFileUploadTarget,
      { logRunId: "1" },
      { signal: controller.signal },
    );

    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });

    // Terminating tells the server to drop the chunks it already holds.
    expect(uploadInstances[0].abort).toHaveBeenCalledWith(true);
  });

  it("rejects immediately when the signal is already aborted", async () => {
    const pending = uploadResumable(
      new File(["x"], "gamma.las"),
      logFileUploadTarget,
      { logRunId: "1" },
      { signal: AbortSignal.abort() },
    );

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(uploadInstances).toHaveLength(0);
  });

  it("surfaces the reason the server gave for refusing the file", async () => {
    const pending = uploadResumable(new File(["x"], "gamma.las"), logFileUploadTarget, { logRunId: "1" });

    optionsOf<{ onError: (error: Error) => void }>().onError(
      Object.assign(new Error("tus: unexpected response"), {
        originalResponse: {
          getStatus: () => 400,
          getBody: () =>
            JSON.stringify({
              type: "userError",
              detail: "A file named 'gamma.las' already exists in this log run.",
              messageKey: "logFileNameAlreadyExists",
              fileName: "gamma.las",
            }),
        },
      }),
    );

    await expect(pending).rejects.toBeInstanceOf(ApiError);
    await expect(pending).rejects.toMatchObject({
      message: "A file named 'gamma.las' already exists in this log run.",
      status: 400,
      messageKey: "logFileNameAlreadyExists",
      details: { fileName: "gamma.las" },
    });
  });

  it("passes a transport failure on unchanged", async () => {
    const pending = uploadResumable(new File(["x"], "gamma.las"), logFileUploadTarget, { logRunId: "1" });
    const failure = new Error("tus: failed to upload chunk");

    optionsOf<{ onError: (error: Error) => void }>().onError(failure);

    await expect(pending).rejects.toBe(failure);
  });

  it("sends a stream source with the size it was given", () => {
    const source = {
      open: () => ({ stream: new ReadableStream<Uint8Array>(), written: Promise.resolve() }),
      size: 4096,
      fileName: "report.pdf",
      contentType: "application/pdf",
    };

    void uploadResumable(source, profileUploadTarget, { boreholeId: "1", profileId: "7" });

    const options = optionsOf<{ uploadSize: number; endpoint: string; metadata: Record<string, string> }>();
    expect(options.uploadSize).toBe(4096);
    expect(options.endpoint).toBe("/api/v2/profile/upload/tus");
    expect(options.metadata).toStrictEqual({
      boreholeId: "1",
      profileId: "7",
      filename: "report.pdf",
      contentType: "application/pdf",
    });
  });

  it("hands the upload client a stream it cannot cancel", async () => {
    const source = {
      open: () => ({
        stream: new ReadableStream<Uint8Array>({
          start: controller => {
            controller.enqueue(new Uint8Array([1, 2, 3]));
            controller.close();
          },
        }),
        written: Promise.resolve(),
      }),
      size: 3,
      fileName: "report.pdf",
      contentType: "application/pdf",
    };

    void uploadResumable(source, profileUploadTarget, { boreholeId: "1" });

    // The client closes its source by cancelling what it was given, and it does so the moment an
    // upload succeeds, which would cut the writer off before it has been waited for.
    const body = bodyOf<StubbedBody>();
    expect(body.cancel).toBeUndefined();
    await expect(body.read()).resolves.toStrictEqual({ value: new Uint8Array([1, 2, 3]), done: false });
  });

  it("reads the id out of the header its target names", async () => {
    const upload = uploadResumable(new File(["x"], "gamma.las"), logFileUploadTarget, { logRunId: "1" });

    optionsOf<{ onSuccess: (result: { lastResponse: { getHeader: (name: string) => string } }) => void }>().onSuccess({
      lastResponse: { getHeader: name => (name === "Log-File-Id" ? "42" : "") },
    });

    await expect(upload).resolves.toBe(42);
  });

  it("waits for the writer before it resolves, so a failed entry is not reported as a success", async () => {
    let settleWriter: (() => void) | undefined;
    const source = {
      open: () => ({
        stream: new ReadableStream<Uint8Array>(),
        written: new Promise<void>(resolve => {
          settleWriter = resolve;
        }),
      }),
      size: 10,
      fileName: "report.pdf",
      contentType: "application/pdf",
    };

    const upload = uploadResumable(source, profileUploadTarget, { boreholeId: "1" });
    optionsOf<{ onSuccess: (result: { lastResponse: { getHeader: () => string } }) => void }>().onSuccess({
      lastResponse: { getHeader: () => "7" },
    });

    let settled = false;
    void upload.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);

    settleWriter?.();
    await expect(upload).resolves.toBe(7);
  });

  it("takes the failure of a source that gave up on its own, so no rejection is left unclaimed", async () => {
    const reported: unknown[] = [];
    const collect = (reason: unknown) => reported.push(reason);
    process.on("unhandledRejection", collect);

    // An entry that cannot be read back: the archive moved, or its bytes do not check out. The
    // upload client knows nothing of it and reports nothing of its own until its retries are spent.
    const sourceFailure = new Error("The archive entry could not be read.");
    const source = {
      open: () => ({ stream: new ReadableStream<Uint8Array>(), written: Promise.reject(sourceFailure) }),
      size: 10,
      fileName: "report.pdf",
      contentType: "application/pdf",
    };

    try {
      const upload = uploadResumable(source, profileUploadTarget, { boreholeId: "1" });

      // A rejection counts as unclaimed once the microtask queue has drained with no handler on it,
      // and node reports what it found at the end of that turn. Waiting out one turn of the event
      // loop is therefore the whole verdict, rather than a guess at how long to give it.
      await new Promise<void>(resolve => setTimeout(resolve, 0));
      expect(reported).not.toContain(sourceFailure);

      // The upload is still the client's to judge, and the caller is told what the client reported.
      const transportFailure = new Error("tus: failed to upload chunk");
      optionsOf<{ onError: (error: Error) => void }>().onError(transportFailure);

      await expect(upload).rejects.toBe(transportFailure);
    } finally {
      process.off("unhandledRejection", collect);
    }
  });

  it("lets go of the stream when the upload succeeds, so a source holding more is not left writing", async () => {
    // The client stops reading at the size the source announced and never reads on to the end, so
    // a source that holds more than that, such as an archive entry whose stored size understates
    // what it unpacks to, is still parked on the reader once the upload is done.
    let releaseWriter: () => void = () => {};
    const written = new Promise<void>(resolve => {
      releaseWriter = resolve;
    });
    const source = {
      open: () => ({
        stream: new ReadableStream<Uint8Array>({
          pull: controller => controller.enqueue(new Uint8Array([1, 2, 3, 4])),
          cancel: () => releaseWriter(),
        }),
        written,
      }),
      size: 2,
      fileName: "report.pdf",
      contentType: "application/pdf",
    };

    const upload = uploadResumable(source, profileUploadTarget, { boreholeId: "1" });
    optionsOf<{ onSuccess: (result: { lastResponse: { getHeader: () => string } }) => void }>().onSuccess({
      lastResponse: { getHeader: () => "7" },
    });

    await expect(upload).resolves.toBe(7);
  });

  it("lets go of the stream when the upload fails, so its writer is not left waiting", async () => {
    // A writer that is done only once the reader lets go, which is what a source blocked on
    // backpressure does. Nothing settles it unless the upload cancels the reader.
    let releaseWriter: () => void = () => {};
    const written = new Promise<void>(resolve => {
      releaseWriter = resolve;
    });
    const source = {
      open: () => ({ stream: new ReadableStream<Uint8Array>({ cancel: () => releaseWriter() }), written }),
      size: 10,
      fileName: "report.pdf",
      contentType: "application/pdf",
    };

    const upload = uploadResumable(source, profileUploadTarget, { boreholeId: "1" });
    const failure = new Error("tus: failed to upload chunk");
    optionsOf<{ onError: (error: Error) => void }>().onError(failure);

    await expect(upload).rejects.toBe(failure);
  });

  it("lets go of the stream when the caller gives up, so its writer is not left waiting", async () => {
    let releaseWriter: () => void = () => {};
    const written = new Promise<void>(resolve => {
      releaseWriter = resolve;
    });
    const source = {
      open: () => ({ stream: new ReadableStream<Uint8Array>({ cancel: () => releaseWriter() }), written }),
      size: 10,
      fileName: "report.pdf",
      contentType: "application/pdf",
    };

    const controller = new AbortController();
    const upload = uploadResumable(source, profileUploadTarget, { boreholeId: "1" }, { signal: controller.signal });

    controller.abort();

    await expect(upload).rejects.toMatchObject({ name: "AbortError" });
  });
});
