import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./errorClasses.ts";
import { uploadResumable } from "./resumableUpload.ts";

interface StubbedUpload {
  options: Record<string, unknown>;
  start: () => void;
  abort: (terminate?: boolean) => Promise<void>;
}

/** The parts of a tus request the code under test touches. */
interface StubbedRequest {
  setHeader: (name: string, value: string) => void;
}

const uploadInstances: StubbedUpload[] = [];

vi.mock("tus-js-client", () => ({
  Upload: class {
    options: Record<string, unknown>;
    start = vi.fn();
    abort = vi.fn(() => Promise.resolve());

    constructor(_file: File, options: Record<string, unknown>) {
      this.options = options;
      uploadInstances.push(this as unknown as StubbedUpload);
    }
  },
}));

const authState = vi.hoisted(() => ({ token: null as { token_type: string; access_token: string } | null }));

vi.mock("../auth/authTokenStore.ts", () => ({ getAuthToken: () => authState.token }));

/** The options the code under test handed to the upload client. */
const optionsOf = <T>(): T => uploadInstances[0].options as T;

describe("uploadResumable", () => {
  beforeEach(() => {
    uploadInstances.length = 0;
    authState.token = null;
  });

  it("reports how much has been sent", async () => {
    const onProgress = vi.fn();
    void uploadResumable(new File(["x"], "gamma.las"), { logRunId: "1" }, { onProgress });

    optionsOf<{ onProgress: (sent: number, total: number) => void }>().onProgress(512, 2048);

    expect(onProgress).toHaveBeenCalledWith({ loaded: 512, total: 2048 });
  });

  it("sends what the file is for", () => {
    void uploadResumable(new File(["x"], "gamma.las", { type: "text/plain" }), { logRunId: "1", logFileId: "7" });

    expect(optionsOf<{ metadata: Record<string, string> }>().metadata).toStrictEqual({
      logRunId: "1",
      logFileId: "7",
      filename: "gamma.las",
      contentType: "text/plain",
    });
  });

  it("reads the token again for every request", () => {
    authState.token = { token_type: "Bearer", access_token: "first" };
    void uploadResumable(new File(["x"], "gamma.las"), { logRunId: "1" });

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
    void uploadResumable(new File(["x"], "gamma.las"), { logRunId: "1" });

    const setHeader = vi.fn();
    optionsOf<{ onBeforeRequest: (request: StubbedRequest) => void }>().onBeforeRequest({ setHeader });

    expect(setHeader).not.toHaveBeenCalled();
  });

  it("resolves with the id the server reports", async () => {
    const pending = uploadResumable(new File(["x"], "gamma.las"), { logRunId: "1" });

    optionsOf<{
      onSuccess: (payload: { lastResponse: { getHeader: (name: string) => string | undefined } }) => void;
    }>().onSuccess({ lastResponse: { getHeader: () => "77" } });

    await expect(pending).resolves.toBe(77);
  });

  it("fails when the server reports no id", async () => {
    const pending = uploadResumable(new File(["x"], "gamma.las"), { logRunId: "1" });

    optionsOf<{
      onSuccess: (payload: { lastResponse: { getHeader: (name: string) => string | undefined } }) => void;
    }>().onSuccess({ lastResponse: { getHeader: () => undefined } });

    await expect(pending).rejects.toThrow("The server did not report which log file it stored.");
  });

  it("rejects with an abort error when the caller gives up", async () => {
    const controller = new AbortController();
    const pending = uploadResumable(new File(["x"], "gamma.las"), { logRunId: "1" }, { signal: controller.signal });

    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });

    // Terminating tells the server to drop the chunks it already holds.
    expect(uploadInstances[0].abort).toHaveBeenCalledWith(true);
  });

  it("rejects immediately when the signal is already aborted", async () => {
    const pending = uploadResumable(new File(["x"], "gamma.las"), { logRunId: "1" }, { signal: AbortSignal.abort() });

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(uploadInstances).toHaveLength(0);
  });

  it("surfaces the reason the server gave for refusing the file", async () => {
    const pending = uploadResumable(new File(["x"], "gamma.las"), { logRunId: "1" });

    optionsOf<{ onError: (error: Error) => void }>().onError(
      Object.assign(new Error("tus: unexpected response"), {
        originalResponse: {
          getStatus: () => 400,
          getBody: () =>
            JSON.stringify({ type: "userError", detail: "A file named 'gamma.las' already exists in this log run." }),
        },
      }),
    );

    await expect(pending).rejects.toBeInstanceOf(ApiError);
    await expect(pending).rejects.toMatchObject({
      message: "A file named 'gamma.las' already exists in this log run.",
      status: 400,
    });
  });

  it("passes a transport failure on unchanged", async () => {
    const pending = uploadResumable(new File(["x"], "gamma.las"), { logRunId: "1" });
    const failure = new Error("tus: failed to upload chunk");

    optionsOf<{ onError: (error: Error) => void }>().onError(failure);

    await expect(pending).rejects.toBe(failure);
  });
});
