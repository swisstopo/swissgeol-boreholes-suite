import { useCallback } from "react";
import { useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { ApiError, NullableDateString, User } from "../../../../api/apiInterfaces.ts";
import {
  download,
  fetchApiV2Base,
  fetchApiV2Legacy,
  fetchApiV2WithApiError,
  upload,
} from "../../../../api/fetchApiV2.ts";

export interface Photo {
  id: number;
  boreholeId: number;
  name: string;
  nameUuid: string;
  fileType: string;
  fromDepth: number;
  toDepth: number;
  public: boolean;
  createdBy?: User;
  created?: NullableDateString;
  updatedBy?: User;
  updated?: NullableDateString;
}

export const uploadPhoto = async (boreholeId: number, file: File): Promise<Photo> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await upload(`photo/upload?boreholeId=${boreholeId}`, "POST", formData);
  if (response.ok) {
    return (await response.json()) as Photo;
  } else {
    if (response.status === 400) {
      throw new ApiError(await response.text(), response.status);
    } else {
      throw new ApiError("errorDuringBoreholeFileUpload", response.status);
    }
  }
};

export const getPhotosByBoreholeId = async (boreholeId: number): Promise<Photo[]> => {
  return await fetchApiV2WithApiError(`photo/getAllForBorehole?boreholeId=${boreholeId}`, "GET");
};

export const exportPhotos = async (photoIds: number[]): Promise<Response> => {
  const queryParams = photoIds.map(id => `photoIds=${id}`).join("&");
  return await download(`photo/export?${queryParams}`);
};

export const deletePhotos = async (photoIds: number[]): Promise<Response> => {
  const queryParams = photoIds.map(id => `photoIds=${id}`).join("&");
  return await fetchApiV2Legacy(`photo?${queryParams}`, "DELETE");
};

export const updatePhotos = async (data: { id: number; public: boolean }[]): Promise<Response> => {
  return await fetchApiV2WithApiError("photo", "PUT", data);
};

export const getPhotoImageData = async (photoId: number): Promise<Blob> => {
  const response = await fetchApiV2Base(`photo/image?photoId=${photoId}`, "GET");
  if (!response.ok) {
    throw new ApiError("errorLoadingImage", response.status);
  }
  return await response.blob();
};

export const photoQueryKey = "photos";

export const usePhotos = (boreholeId?: number): UseQueryResult<Photo[]> =>
  useQuery({
    queryKey: [photoQueryKey, boreholeId],
    queryFn: async () => {
      return await getPhotosByBoreholeId(boreholeId!);
    },
    enabled: !!boreholeId,
  });

// Necessary as long as the photo mutations are not handled via tanstack-query.
export const useReloadPhotos = (boreholeId: number) => {
  const queryClient = useQueryClient();
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [photoQueryKey, boreholeId] });
  }, [queryClient, boreholeId]);
};
