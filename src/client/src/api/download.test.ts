// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { TransferProgress } from "./transferProgress.ts";

const fetchApiV2Base = vi.hoisted(() => vi.fn());
vi.mock("./fetchApiV2.ts", () => ({ fetchApiV2Base }));

const { download, downloadPost } = await import("./download.ts");

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

beforeAll(() => {
  // jsdom does not implement the object URL API the download link relies on.
  URL.createObjectURL = vi.fn(() => "blob:stub");
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
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

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    const savedBlob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    await expect(savedBlob.text()).resolves.toBe("abcde");
  });

  it("reads the body in one piece when no progress is wanted", async () => {
    fetchApiV2Base.mockResolvedValue(streamedResponse(["abc", "de"]));

    await downloadPost("log/export", { logRunIds: [1] });

    const savedBlob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
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
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
});
