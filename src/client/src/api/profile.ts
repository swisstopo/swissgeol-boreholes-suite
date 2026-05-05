import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getImageFromBlob } from "../utils.ts";
import { ApiError, NullableDateString, User } from "./apiInterfaces.ts";
import { labelingFileFormat, matchesFileFormat, PanelTab } from "./dataextractionInterfaces.ts";
import { download } from "./download.ts";
import { fetchApiV2Legacy, fetchApiV2WithApiError, upload } from "./fetchApiV2.ts";
import { maxFileSizeBytes } from "./file.ts";
import { processFileWithOCR } from "./ocr.ts";

export interface Profile {
  id: number;
  boreholeId: number;
  name: string;
  nameUuid: string;
  type: string;
  description?: string;
  public?: boolean;
  createdById?: number;
  createdBy?: User;
  created?: NullableDateString;
  updatedById?: number;
  updatedBy?: User;
  updated?: NullableDateString;
}

export async function uploadProfile(boreholeId: number, file: File): Promise<Profile> {
  if (file && file.size <= maxFileSizeBytes) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await upload(`profile/upload?boreholeId=${boreholeId}`, "POST", formData);
    if (!response.ok) {
      throw new ApiError("errorDuringFileUpload", response.status);
    }
    const uploaded = (await response.json()) as Profile;
    processFileWithOCR({ file: uploaded.nameUuid });
    return uploaded;
  } else {
    throw new ApiError("fileMaxSizeExceeded", 500);
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

export function useProfiles(boreholeId?: number, forLabeling: boolean = false) {
  return useQuery({
    enabled: !!boreholeId,
    queryKey: [profileQueryKey, boreholeId, forLabeling],
    queryFn: async () => {
      if (!boreholeId) return [];
      const profiles = await getProfiles(Number(boreholeId));

      if (forLabeling) {
        return profiles.filter(profile => matchesFileFormat(labelingFileFormat[PanelTab.profile], profile.type));
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
  }, [boreholeId, queryClient]);
};
