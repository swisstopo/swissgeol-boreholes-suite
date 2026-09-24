// @vitest-environment jsdom
import { createElement, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./errorClasses.ts";
import { setFileSizeLimits } from "./fileSize.ts";
import { OcrStatus, Profile, ProfileOcrStatus } from "./generated";
import {
  decidePollInterval,
  getProfileForBorehole,
  ocrStatusIsTerminal,
  uploadProfile,
  useProfiles,
  useReloadProfiles,
} from "./profile";
import { profileUploadTarget } from "./resumableUpload.ts";

const { fetchApiV2Legacy, uploadResumable } = vi.hoisted(() => ({
  fetchApiV2Legacy: vi.fn(),
  uploadResumable: vi.fn(),
}));

vi.mock("./fetchApiV2.ts", async importOriginal => ({
  ...(await importOriginal<typeof import("./fetchApiV2.ts")>()),
  fetchApiV2Legacy,
}));

// The real upload target is kept, so the endpoint the profiles go to is the one under test.
vi.mock("./resumableUpload.ts", async importOriginal => ({
  ...(await importOriginal<typeof import("./resumableUpload.ts")>()),
  uploadResumable,
}));

const largeMaxFileSize = 5_000_000_000;

setFileSizeLimits({
  maxFileSize: 210_000_000,
  largeMaxFileSize,
  maxImportArchiveSize: 1_000_000_000,
  chunkSize: 6 * 1024 * 1024,
});

beforeEach(() => {
  vi.clearAllMocks();
});

/** A file that reports a size without holding one, so the limits can be tried without the bytes. */
const fileOfSize = (bytes: number): File => {
  const file = new File(["x"], "report.pdf", { type: "application/pdf" });
  Object.defineProperty(file, "size", { value: bytes });
  return file;
};

/** The reason a call was refused, so that it can be read rather than only matched. */
const rejectionOf = async (pending: Promise<unknown>): Promise<unknown> => {
  try {
    await pending;
  } catch (error) {
    return error;
  }
  throw new Error("The call was expected to be refused, but it succeeded.");
};

const allTerminal: ProfileOcrStatus[] = [
  { id: 1, ocrStatus: "Success" },
  { id: 2, ocrStatus: "WillNotBeProcessed" },
  { id: 3, ocrStatus: "Error" },
];

const someProcessing: ProfileOcrStatus[] = [
  { id: 1, ocrStatus: "Success" },
  { id: 2, ocrStatus: "Processing" },
];

describe("ocrStatusIsTerminal", () => {
  it.each<OcrStatus>(["Success", "Error", "WillNotBeProcessed"])("returns true for terminal status %s", status => {
    expect(ocrStatusIsTerminal(status)).toBe(true);
  });

  it.each<OcrStatus>(["Created", "Processing"])("returns false for non-terminal status %s", status => {
    expect(ocrStatusIsTerminal(status)).toBe(false);
  });
});

describe("OCR polling decision", () => {
  it("returns false when data is undefined", () => {
    expect(decidePollInterval(undefined)).toBe(false);
  });

  it("returns false when list is empty", () => {
    expect(decidePollInterval([])).toBe(false);
  });

  it("returns false when every entry is terminal", () => {
    expect(decidePollInterval(allTerminal)).toBe(false);
  });

  it("returns 2000 ms while any entry is non-terminal", () => {
    expect(decidePollInterval(someProcessing)).toBe(2000);
  });
});

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("useProfiles", () => {
  const uploaded: Profile = { id: 1, boreholeId: 4, name: "site.pdf", nameUuid: "a.pdf", type: "application/pdf" };
  const awaitingUpload: Profile = { id: 2, boreholeId: 4, name: "report.pdf", nameUuid: null, type: "application/pdf" };
  const image: Profile = { id: 3, boreholeId: 4, name: "core.png", nameUuid: "c.png", type: "image/png" };

  const profilesListed = async (forLabeling: boolean): Promise<Profile[] | undefined> => {
    fetchApiV2Legacy.mockResolvedValue([uploaded, awaitingUpload, image]);

    const { result } = renderHook(() => useProfiles(4, forLabeling), {
      wrapper: createWrapper(new QueryClient()),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    return result.current.data;
  };

  it("offers labeling only the profiles whose file it can open", async () => {
    expect(await profilesListed(true)).toEqual([uploaded]);
  });

  it("lists every profile outside labeling, one still waiting for its file too", async () => {
    expect(await profilesListed(false)).toEqual([uploaded, awaitingUpload, image]);
  });
});

describe("useReloadProfiles", () => {
  it("invalidates both profiles and OCR status queries", () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useReloadProfiles(42), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      result.current();
    });

    expect(invalidateSpy).toHaveBeenCalledTimes(2);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["profiles", 42] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["profileOcrStatus", 42] });
  });
});

describe("uploadProfile", () => {
  it("sends the profile to the tus endpoint against its borehole", async () => {
    uploadResumable.mockResolvedValue(7);

    const profileId = await uploadProfile(4, fileOfSize(12));

    expect(profileId).toBe(7);
    expect(uploadResumable).toHaveBeenCalledWith(expect.any(File), profileUploadTarget, { boreholeId: "4" }, undefined);
  });

  it("passes progress reporting and cancellation on", async () => {
    uploadResumable.mockResolvedValue(7);
    const options = { onProgress: vi.fn(), signal: new AbortController().signal };

    await uploadProfile(4, fileOfSize(12), options);

    expect(uploadResumable).toHaveBeenCalledWith(expect.any(File), profileUploadTarget, { boreholeId: "4" }, options);
  });

  it("sends a file of exactly the resumable limit", async () => {
    uploadResumable.mockResolvedValue(7);

    await expect(uploadProfile(4, fileOfSize(largeMaxFileSize))).resolves.toBe(7);
  });

  it("refuses a file above the resumable limit before sending anything", async () => {
    await expect(uploadProfile(4, fileOfSize(largeMaxFileSize + 1))).rejects.toBeInstanceOf(ApiError);
    expect(uploadResumable).not.toHaveBeenCalled();
  });

  it("names the resumable limit in the refusal", async () => {
    const error = await rejectionOf(uploadProfile(4, fileOfSize(largeMaxFileSize + 1)));

    if (!(error instanceof ApiError)) throw error;
    expect(error.message).toBe("fileMaxSizeExceeded");
    expect(error.status).toBe(400);
    expect(error.details).toEqual({ size: "5 GB" });
  });
});

describe("getProfileForBorehole", () => {
  const profiles: Profile[] = [
    { id: 5, boreholeId: 4, name: "site.pdf" },
    { id: 7, boreholeId: 4, name: "report.pdf" },
  ];

  it("returns the profile the borehole holds under that id", async () => {
    fetchApiV2Legacy.mockResolvedValue(profiles);

    await expect(getProfileForBorehole(4, 7)).resolves.toEqual(profiles[1]);
    expect(fetchApiV2Legacy).toHaveBeenCalledWith("profile/getAllForBorehole?boreholeId=4", "GET");
  });

  it("refuses when the borehole holds no profile with that id", async () => {
    fetchApiV2Legacy.mockResolvedValue(profiles);

    await expect(getProfileForBorehole(4, 9)).rejects.toBeInstanceOf(ApiError);
  });
});
