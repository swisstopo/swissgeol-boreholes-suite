// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { fetchApiV2Base as realFetchApiV2Base } from "./fetchApiV2.ts";
import { isAbortError, TransferProgress } from "./transferProgress.ts";

const fetchApiV2Base = vi.hoisted(() => vi.fn<typeof realFetchApiV2Base>());
vi.mock("./fetchApiV2.ts", () => ({ fetchApiV2Base }));

const { download, downloadArchive, downloadArchivePost, downloadPost } = await import("./download.ts");

/**
 * Builds a response whose body arrives in the given chunks, mirroring how the streamed
 * ZIP exports reach the client.
 */
const streamedResponse = (chunks: string[], headers: Record<string, string> = {}): Response => {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach(chunk => controller.enqueue(encoder.encode(chunk)));
      controller.close();
    },
  });
  return new Response(body, { status: 200, headers: { "content-type": "application/zip", ...headers } });
};

const collectProgress = () => {
  const reported: TransferProgress[] = [];
  return { reported, onProgress: (progress: TransferProgress) => reported.push(progress) };
};

/**
 * Stands in for the save dialog of Chrome and Edge. The file it hands out is a real WritableStream,
 * so a test sees what reached the file and whether it ended up committed or thrown away.
 */
const stubSaveFilePicker = () => {
  const written: string[] = [];
  let outcome: "open" | "committed" | "discarded" = "open";
  const decoder = new TextDecoder();
  const file = new WritableStream<Uint8Array>({
    write: chunk => {
      written.push(decoder.decode(chunk));
    },
    close: () => {
      outcome = "committed";
    },
    abort: () => {
      outcome = "discarded";
    },
  });
  const showSaveFilePicker =
    vi.fn<(options: { suggestedName: string }) => Promise<{ createWritable: () => Promise<WritableStream> }>>();
  showSaveFilePicker.mockResolvedValue({ createWritable: () => Promise.resolve(file) });
  vi.stubGlobal("showSaveFilePicker", showSaveFilePicker);
  return { showSaveFilePicker, written, outcome: () => outcome };
};

/**
 * A chunked response the test feeds one chunk at a time, like a slow connection. Aborting the
 * request breaks the body off with an AbortError, as fetch does with a response it is still
 * delivering. The error is created here rather than taken from the signal, whose reason comes from
 * Node's realm in this environment and so is not recognised by jsdom's DOMException.
 */
const controlledTransfer = () => {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
  const body = new ReadableStream<Uint8Array>({
    start: streamController => {
      controller = streamController;
    },
  });
  fetchApiV2Base.mockImplementation((_url, _method, _body, _contentType, signal) => {
    signal?.addEventListener("abort", () =>
      controller?.error(new DOMException("The user aborted a request.", "AbortError")),
    );
    return Promise.resolve(new Response(body, { status: 200, headers: { "content-type": "application/zip" } }));
  });
  return {
    send: (chunk: string) => controller?.enqueue(encoder.encode(chunk)),
    end: () => controller?.close(),
    fail: (error: Error) => controller?.error(error),
  };
};

/** Records the name each file saved through the browser's download was offered under. */
const recordSavedNames = () => {
  const names: string[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
    names.push(this.download);
  });
  return names;
};

const createObjectURL = vi.fn<typeof URL.createObjectURL>(() => "blob:stub");

beforeAll(() => {
  // jsdom does not implement the object URL API the download link relies on.
  URL.createObjectURL = createObjectURL;
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("download progress", () => {
  it("reports the bytes received as each chunk arrives", async () => {
    fetchApiV2Base.mockResolvedValue(streamedResponse(["abcde", "fg", "hij"]));
    const { reported, onProgress } = collectProgress();

    await download("boreholeexport/zip?ids=1", { onProgress });

    expect(reported.map(p => p.loaded)).toEqual([0, 5, 7, 10]);
  });

  it("leaves the total undefined when the response is chunked", async () => {
    fetchApiV2Base.mockResolvedValue(streamedResponse(["abcde"]));
    const { reported, onProgress } = collectProgress();

    await download("boreholeexport/zip?ids=1", { onProgress });

    expect(reported.every(p => p.total === undefined)).toBe(true);
  });

  it("passes on the total when the server declares a content length", async () => {
    fetchApiV2Base.mockResolvedValue(streamedResponse(["abcde"], { "content-length": "5" }));
    const { reported, onProgress } = collectProgress();

    await download("codelist/csv", { onProgress });

    expect(reported).toEqual([
      { loaded: 0, total: 5 },
      { loaded: 5, total: 5 },
    ]);
  });

  it("reports progress for a posted export as well", async () => {
    fetchApiV2Base.mockResolvedValue(streamedResponse(["abc", "de"]));
    const { reported, onProgress } = collectProgress();

    await downloadPost("log/export", { logRunIds: [1] }, { onProgress });

    expect(reported.map(p => p.loaded)).toEqual([0, 3, 5]);
  });

  it("saves the complete body once the transfer finished", async () => {
    fetchApiV2Base.mockResolvedValue(streamedResponse(["abc", "de"]));

    await downloadPost("log/export", { logRunIds: [1] }, { onProgress: vi.fn() });

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const savedBlob = createObjectURL.mock.calls[0][0] as Blob;
    await expect(savedBlob.text()).resolves.toBe("abcde");
  });

  it("reads the body in one piece when no progress is wanted", async () => {
    fetchApiV2Base.mockResolvedValue(streamedResponse(["abc", "de"]));

    await downloadPost("log/export", { logRunIds: [1] });

    const savedBlob = createObjectURL.mock.calls[0][0] as Blob;
    await expect(savedBlob.text()).resolves.toBe("abcde");
  });

  it("throws before reading the body when the request failed", async () => {
    fetchApiV2Base.mockResolvedValue(new Response("nope", { status: 500 }));
    const onProgress = vi.fn();

    await expect(downloadPost("log/export", { logRunIds: [1] }, { onProgress })).rejects.toThrow();
    expect(onProgress).not.toHaveBeenCalled();
  });
});

describe("download cancellation", () => {
  it("hands the signal to the request so the server stops the export", async () => {
    fetchApiV2Base.mockResolvedValue(streamedResponse(["abc"]));
    const controller = new AbortController();

    await downloadPost("log/export", { logRunIds: [1] }, { signal: controller.signal });

    expect(fetchApiV2Base).toHaveBeenCalledWith(
      "log/export",
      "POST",
      JSON.stringify({ logRunIds: [1] }),
      "application/json",
      controller.signal,
    );
  });

  it("saves nothing when the transfer is given up on", async () => {
    fetchApiV2Base.mockRejectedValue(new DOMException("The user aborted a request.", "AbortError"));
    const controller = new AbortController();

    await expect(downloadPost("log/export", { logRunIds: [1] }, { signal: controller.signal })).rejects.toThrow(
      DOMException,
    );
    expect(createObjectURL).not.toHaveBeenCalled();
  });
});

describe("saving an archive into a picked file", () => {
  it("writes each chunk into the picked file while the transfer is still running", async () => {
    const picker = stubSaveFilePicker();
    const transfer = controlledTransfer();

    const saving = downloadArchive("boreholeexport/zip?ids=1", "export.zip");
    transfer.send("abc");
    await vi.waitFor(() => expect(picker.written).toEqual(["abc"]));
    transfer.send("de");
    await vi.waitFor(() => expect(picker.written).toEqual(["abc", "de"]));
    expect(picker.outcome()).toBe("open");

    transfer.end();
    await saving;
    expect(picker.outcome()).toBe("committed");
  });

  it("suggests the given name in the save dialog", async () => {
    const picker = stubSaveFilePicker();
    fetchApiV2Base.mockResolvedValue(streamedResponse(["abc"]));

    await downloadArchive("boreholeexport/zip?ids=1", "COLDWATER.zip");

    expect(picker.showSaveFilePicker.mock.lastCall?.[0]).toEqual({ suggestedName: "COLDWATER.zip" });
  });

  it("reports the bytes written as each chunk arrives", async () => {
    stubSaveFilePicker();
    fetchApiV2Base.mockResolvedValue(streamedResponse(["abcde", "fg", "hij"]));
    const { reported, onProgress } = collectProgress();

    await downloadArchive("boreholeexport/zip?ids=1", "export.zip", { onProgress });

    expect(reported.map(p => p.loaded)).toEqual([0, 5, 7, 10]);
  });

  it("posts the request body for an archive requested by POST", async () => {
    const picker = stubSaveFilePicker();
    fetchApiV2Base.mockResolvedValue(streamedResponse(["abc"]));
    const controller = new AbortController();

    await downloadArchivePost("log/export", { logRunIds: [1] }, "log_export.zip", { signal: controller.signal });

    expect(fetchApiV2Base).toHaveBeenCalledWith(
      "log/export",
      "POST",
      JSON.stringify({ logRunIds: [1] }),
      "application/json",
      controller.signal,
    );
    expect(picker.written).toEqual(["abc"]);
  });

  it("sends no request and saves nothing when the save dialog is dismissed", async () => {
    const picker = stubSaveFilePicker();
    picker.showSaveFilePicker.mockRejectedValue(new DOMException("The user aborted a request.", "AbortError"));

    await expect(downloadArchive("boreholeexport/zip?ids=1", "export.zip")).resolves.toBeUndefined();

    expect(fetchApiV2Base).not.toHaveBeenCalled();
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it("throws the picked file away when the server refuses the export", async () => {
    const picker = stubSaveFilePicker();
    fetchApiV2Base.mockResolvedValue(new Response("nope", { status: 500 }));

    await expect(downloadArchive("boreholeexport/zip?ids=1", "export.zip")).rejects.toThrow();

    expect(picker.written).toEqual([]);
    expect(picker.outcome()).toBe("discarded");
  });

  it("throws the picked file away when the transfer breaks off", async () => {
    const picker = stubSaveFilePicker();
    const transfer = controlledTransfer();

    const saving = downloadArchive("boreholeexport/zip?ids=1", "export.zip");
    transfer.send("abc");
    await vi.waitFor(() => expect(picker.written).toEqual(["abc"]));
    transfer.fail(new TypeError("network error"));

    await expect(saving).rejects.toThrow("network error");
    expect(picker.outcome()).toBe("discarded");
  });

  it("stops the request and throws the picked file away when the transfer is cancelled", async () => {
    const picker = stubSaveFilePicker();
    const transfer = controlledTransfer();
    const controller = new AbortController();

    const saving = downloadArchive("boreholeexport/zip?ids=1", "export.zip", { signal: controller.signal });
    transfer.send("abc");
    await vi.waitFor(() => expect(picker.written).toEqual(["abc"]));
    controller.abort();

    const error: unknown = await saving.catch((reason: unknown) => reason);
    expect(isAbortError(error)).toBe(true);
    expect(fetchApiV2Base.mock.lastCall?.[4]).toBe(controller.signal);
    expect(picker.outcome()).toBe("discarded");
  });

  it("saves through the browser's download, under the server's name, where there is no save dialog", async () => {
    fetchApiV2Base.mockResolvedValue(
      streamedResponse(["abc", "de"], { "content-disposition": "attachment; filename=boreholes_export_20260101.zip" }),
    );
    const savedNames = recordSavedNames();

    await downloadArchive("boreholeexport/zip?ids=1", "export.zip");

    const savedBlob = createObjectURL.mock.calls[0][0] as Blob;
    await expect(savedBlob.text()).resolves.toBe("abcde");
    expect(savedNames).toEqual(["boreholes_export_20260101.zip"]);
  });

  it("saves through the browser's download when writing to a picked file is refused", async () => {
    const picker = stubSaveFilePicker();
    picker.showSaveFilePicker.mockRejectedValue(
      new DOMException("The request is not allowed in the current context.", "NotAllowedError"),
    );
    fetchApiV2Base.mockResolvedValue(streamedResponse(["abc", "de"]));

    await downloadArchive("boreholeexport/zip?ids=1", "export.zip");

    const savedBlob = createObjectURL.mock.calls[0][0] as Blob;
    await expect(savedBlob.text()).resolves.toBe("abcde");
  });
});
