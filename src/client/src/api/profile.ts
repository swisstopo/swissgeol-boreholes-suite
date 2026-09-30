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
