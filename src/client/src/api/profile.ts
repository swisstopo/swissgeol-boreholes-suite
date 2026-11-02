import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getImageFromBlob } from "../utils.ts";
import { labelingFileFormat, matchesFileFormat, PanelTab } from "./dataextractionInterfaces.ts";
import { download } from "./download.ts";
import { ApiError } from "./errorClasses.ts";
import { fetchApiV2Legacy, fetchApiV2WithApiError, upload } from "./fetchApiV2.ts";
import { formatFileSize, getMaxFileSize } from "./fileSize.ts";
import { OcrStatus, Profile, ProfileOcrStatus, ProfileUpdate } from "./generated";

export async function uploadProfile(boreholeId: number, file: File): Promise<Profile> {
  if (file && file.size <= getMaxFileSize()) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await upload(`profile/upload?boreholeId=${boreholeId}`, "POST", formData);
    if (!response.ok) {
      throw new ApiError("errorDuringFileUpload", response.status);
    }
    return (await response.json()) as Profile;
  } else {
    throw new ApiError("fileMaxSizeExceeded", 500, undefined, { size: formatFileSize(getMaxFileSize()) });
  }
}

export const deleteProfile = async (profileId: number) => {
  return await fetchApiV2Legacy(`profile/${profileId}`, "DELETE");
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

export const updateProfile = async (
  profileId: number,
  description: ProfileUpdate["description"],
  isPublic: ProfileUpdate["public"],
) => {
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
  // Not awaited: callers reload in the background and do not wait for the refetches.
  return useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: [profileQueryKey, boreholeId] });
    void queryClient.invalidateQueries({ queryKey: [profileOcrStatusQueryKey, boreholeId] });
  }, [boreholeId, queryClient]);
};

export const ocrStatusIsTerminal = (status?: OcrStatus): boolean =>
  status === "Success" || status === "Error" || status === "WillNotBeProcessed";

/**
 * Whether the file's text can be read. Scanned documents only contain text after a successful OCR, while files
 * that are not processed are read as they are.
 * @param status The profile's OCR status.
 */
export const isOcrTextAvailable = (status?: OcrStatus): boolean =>
  status === "Success" || status === "WillNotBeProcessed";

const ocrStatusPollIntervalMs = 2000;

export const decidePollInterval = (data: ProfileOcrStatus[] | undefined): number | false =>
  data?.some(p => !ocrStatusIsTerminal(p.ocrStatus)) ? ocrStatusPollIntervalMs : false;

const fetchOcrStatuses = async (boreholeId?: number): Promise<ProfileOcrStatus[]> =>
  await fetchApiV2WithApiError<ProfileOcrStatus[]>(`profile/getOcrStatusForBorehole?boreholeId=${boreholeId}`, "GET");

export function useProfileOcrStatus(boreholeId?: number) {
  return useQuery({
    enabled: !!boreholeId,
    queryKey: [profileOcrStatusQueryKey, boreholeId],
    queryFn: () => fetchOcrStatuses(boreholeId),
    refetchInterval: ({ state: { data } }) => decidePollInterval(data),
  });
}

const findOcrStatus = (data: ProfileOcrStatus[] | undefined, profileId: number | undefined): OcrStatus | undefined =>
  data?.find(p => p.id === profileId)?.ocrStatus;

/**
 * Polls the OCR status of one profile until it reached a terminal status. OCR writes the recognized text into
 * the stored file, so anything reading the file's text before that finds none in scanned documents. A profile
 * missing from the borehole's statuses keeps polling, which covers a fresh upload.
 * @param boreholeId The borehole the profile belongs to.
 * @param profileId The profile whose OCR to follow, or undefined while none is selected.
 * @returns The profile's OCR status, or undefined until it is known.
 */
export function useProfileOcrStatusOf(boreholeId: number, profileId: number | undefined): OcrStatus | undefined {
  const { data } = useQuery({
    enabled: profileId !== undefined,
    queryKey: [profileOcrStatusQueryKey, boreholeId],
    queryFn: () => fetchOcrStatuses(boreholeId),
    refetchInterval: ({ state: { data } }) =>
      ocrStatusIsTerminal(findOcrStatus(data, profileId)) ? false : ocrStatusPollIntervalMs,
  });
  return findOcrStatus(data, profileId);
}
