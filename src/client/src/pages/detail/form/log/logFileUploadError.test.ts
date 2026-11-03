import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../../api/errorClasses.ts";
import { formatFileSize, setFileSizeLimits } from "../../../../api/fileSize.ts";
import { toLogFileUploadError } from "./logFileUploadError.ts";

/**
 * Limits small enough for a file in a test to exceed, in the shape the application settings
 * normally supply.
 */
const limits = { maxFileSize: 2, largeMaxFileSize: 4, chunkSize: 1 };

/** A file within the large limit. */
const gamma = new File(["123"], "gamma.las");

/** A file over the large limit. */
const sonic = new File(["12345"], "sonic.las");

describe("toLogFileUploadError", () => {
  beforeEach(() => {
    setFileSizeLimits(limits);
  });

  it("keeps a refusal the server already put in words", () => {
    const refusal = new ApiError("taken", 400, "logFileNameAlreadyExists", { fileName: "gamma.las" });

    expect(toLogFileUploadError(refusal, gamma)).toBe(refusal);
  });

  it("names the file a transport failure was about", () => {
    const error = toLogFileUploadError(new Error("tus: failed to upload chunk"), gamma);

    expect(error).toMatchObject({
      message: "tus: failed to upload chunk",
      messageKey: "logFileUploadFailed",
      details: { fileName: "gamma.las" },
    });
  });

  it("names the file a server error was about", () => {
    const error = toLogFileUploadError(new ApiError("tus: unexpected response", 500), gamma);

    expect(error).toMatchObject({
      status: 500,
      messageKey: "logFileUploadFailed",
      details: { fileName: "gamma.las" },
    });
  });

  it("names the file and the limit when the file is too large", () => {
    const error = toLogFileUploadError(new ApiError("tus: unexpected response", 413), sonic);

    expect(error).toMatchObject({
      status: 413,
      messageKey: "logFileTooLarge",
      details: { fileName: "sonic.las", size: formatFileSize(limits.largeMaxFileSize) },
    });
  });

  // A proxy in front of the API refuses a chunk over its own body limit with the same status, and
  // naming the file size limit would then send the user looking for the wrong cause.
  it("does not blame the size of a file within the limit", () => {
    const error = toLogFileUploadError(new ApiError("tus: unexpected response", 413), gamma);

    expect(error).toMatchObject({
      status: 413,
      messageKey: "logFileUploadFailed",
      details: { fileName: "gamma.las" },
    });
  });

  it("names the file when the rejection is not an error at all", () => {
    const error = toLogFileUploadError("gone", gamma);

    expect(error).toMatchObject({
      message: "gone",
      messageKey: "logFileUploadFailed",
      details: { fileName: "gamma.las" },
    });
  });
});
