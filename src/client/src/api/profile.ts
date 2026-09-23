import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getImageFromBlob } from "../utils.ts";
import { labelingFileFormat, matchesFileFormat, PanelTab } from "./dataextractionInterfaces.ts";
import { download } from "./download.ts";
import { ApiError } from "./errorClasses.ts";
import { fetchApiV2Legacy, fetchApiV2WithApiError } from "./fetchApiV2.ts";
import { formatFileSize, getLargeMaxFileSize } from "./fileSize.ts";
import { OcrStatus, Profile, ProfileOcrStatus } from "./generated";
import { profileUploadTarget, uploadResumable } from "./resumableUpload.ts";
import { TransferOptions } from "./transferProgress.ts";

/**
 * Uploads a profile for a borehole.
 *
 * The file goes up in chunks, so no single request is long enough to be cut off and a profile may
 * be far larger than one request would carry.
 * @param boreholeId The borehole to attach it to.
 * @param file The file to upload.
 * @param options Progress reporting and cancellation.
 * @returns The id of the profile the server stored.
 * @throws {ApiError} If the file is larger than the API accepts, or if the server refused it.
 * @throws {DOMException} Named `AbortError` if the caller gave up on the upload.
 */
export const uploadProfile = async (boreholeId: number, file: File, options?: TransferOptions): Promise<number> => {
  if (file.size > getLargeMaxFileSize()) {
    throw new ApiError("fileMaxSizeExceeded", 400, undefined, { size: formatFileSize(getLargeMaxFileSize()) });
  }

  return await uploadResumable(file, profileUploadTarget, { boreholeId: String(boreholeId) }, options);
};

/**
 * Reads a single profile of a borehole.
 *
 * The API serves profiles per borehole and has no endpoint for one on its own, so the borehole's
 * profiles are read and the one with that id is picked out. This is how a caller that has only the
 * id an upload returned gets the row as the server wrote it, rather than building one itself.
 * @param boreholeId The borehole the profile belongs to.
 * @param profileId The profile to read.
 * @returns The profile as the server holds it.
 * @throws {ApiError} If the borehole holds no profile with that id.
 */
export const getProfileForBorehole = async (boreholeId: number, profileId: number): Promise<Profile> => {
  const profile = (await getProfiles(boreholeId)).find(candidate => candidate.id === profileId);
  if (!profile) {
    throw new ApiError("errorProfileLoading", 500);
  }

  return profile;
};

export const deleteProfile = async (profileId: number) => {
  return await fetchApiV2Legacy(`profile/${profileId}`, "DELETE");
};

/**
 * Removes the row an import wrote for an attachment that never arrived.
 *
 * Distinct from `deleteProfile`, which shows the user what went wrong: a discard follows a failure
 * the user has already been told about, and it tidies up row by row, so one dialog per row would
 * bury the reason the import stopped. The caller decides what a failed discard is worth instead.
 * @param profileId The row to remove.
 * @throws {ApiError|Error} If the row could not be removed.
 */
export const discardPendingProfile = async (profileId: number): Promise<void> => {
  await fetchApiV2WithApiError(`profile/${profileId}`, "DELETE");
};

export async function getProfiles(boreholeId: number): Promise<Profile[]> {
  const response = await fetchApiV2Legacy(`profile/getAllForBorehole?boreholeId=${boreholeId}`, "GET");
  if (response) {
    return response as Profile[];
  } else {
    throw new ApiError("errorProfileLoading", 500);
  }
}

export const downloadProfile = async (profileId: number) => {
  return await download(`profile/download?profileId=${profileId}`);
};

export const updateProfile = async (profileId: number, description: string, isPublic: boolean) => {
  return await fetchApiV2WithApiError(`profile/${profileId}`, "PUT", {
    description: description,
    public: isPublic,
  });
};

export function useProfileImage(fileName: string | undefined) {
  return useQuery({
    queryKey: ["loadImage", fileName],
    enabled: !!fileName,
    queryFn: async () => {
      const blob = await fetchApiV2WithApiError<Blob>("profile/dataextraction/" + fileName, "GET");
      return getImageFromBlob(blob);
    },
  });
}

const profileQueryKey = "profiles";
const profileOcrStatusQueryKey = "profileOcrStatus";

export function useProfiles(boreholeId?: number, forLabeling: boolean = false) {
  return useQuery({
    enabled: !!boreholeId,
    queryKey: [profileQueryKey, boreholeId, forLabeling],
    queryFn: async () => {
      if (!boreholeId) return [];
      const profiles = await getProfiles(Number(boreholeId));

      if (forLabeling) {
        return profiles.filter(profile => matchesFileFormat(labelingFileFormat[PanelTab.profile], profile.type!));
      }
      return profiles;
    },
  });
}

// Necessary as long as the profile mutations are not handled via tanstack-query.
export const useReloadProfiles = (boreholeId: number) => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [profileQueryKey, boreholeId] });
    queryClient.invalidateQueries({ queryKey: [profileOcrStatusQueryKey, boreholeId] });
  }, [boreholeId, queryClient]);
};

export const ocrStatusIsTerminal = (status?: OcrStatus): boolean =>
  status === "Success" || status === "Error" || status === "WillNotBeProcessed";

export const decidePollInterval = (data: ProfileOcrStatus[] | undefined): number | false =>
  data?.some(p => !ocrStatusIsTerminal(p.ocrStatus)) ? 2000 : false;

export function useProfileOcrStatus(boreholeId?: number) {
  return useQuery({
    enabled: !!boreholeId,
    queryKey: [profileOcrStatusQueryKey, boreholeId],
    queryFn: async (): Promise<ProfileOcrStatus[]> => {
      return await fetchApiV2WithApiError<ProfileOcrStatus[]>(
        `profile/getOcrStatusForBorehole?boreholeId=${boreholeId}`,
        "GET",
      );
    },
    refetchInterval: ({ state: { data } }) => decidePollInterval(data),
  });
}
