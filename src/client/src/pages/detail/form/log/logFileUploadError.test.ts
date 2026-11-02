import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../../api/errorClasses.ts";
import { formatFileSize, setFileSizeLimits } from "../../../../api/fileSize.ts";
import { toLogFileUploadError } from "./logFileUploadError.ts";

/** The limits as the API reports them, which the application settings normally supply. */
const serverLimits = { maxFileSize: 210_000_000, largeMaxFileSize: 5_000_000_000, chunkSize: 6 * 1024 * 1024 };

describe("toLogFileUploadError", () => {
  beforeEach(() => {
    setFileSizeLimits(serverLimits);
  });

  it("keeps a refusal the server already put in words", () => {
    const refusal = new ApiError("taken", 400, "logFileNameAlreadyExists", { fileName: "gamma.las" });

    expect(toLogFileUploadError(refusal, "gamma.las")).toBe(refusal);
  });

  it("names the file a transport failure was about", () => {
    const error = toLogFileUploadError(new Error("tus: failed to upload chunk"), "gamma.las");

    expect(error).toMatchObject({
      message: "tus: failed to upload chunk",
      messageKey: "logFileUploadFailed",
      details: { fileName: "gamma.las" },
    });
  });

  it("names the file a server error was about", () => {
    const error = toLogFileUploadError(new ApiError("tus: unexpected response", 500), "gamma.las");

    expect(error).toMatchObject({
      status: 500,
      messageKey: "logFileUploadFailed",
      details: { fileName: "gamma.las" },
    });
  });

  it("names the file and the limit when the server found it too large", () => {
    const error = toLogFileUploadError(new ApiError("tus: unexpected response", 413), "gamma.las");

    expect(error).toMatchObject({
      status: 413,
      messageKey: "logFileTooLarge",
      details: { fileName: "gamma.las", size: formatFileSize(serverLimits.largeMaxFileSize) },
    });
  });

  it("names the file when the rejection is not an error at all", () => {
    const error = toLogFileUploadError("gone", "gamma.las");

    expect(error).toMatchObject({ message: "gone", messageKey: "logFileUploadFailed", details: { fileName: "gamma.las" } });
  });
});
