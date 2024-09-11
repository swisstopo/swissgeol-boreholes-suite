import { DataExtractionResponse, maxFileSizeKB } from "./fileInterfaces.ts";
import { fetchApiV2 } from "../fetchApiV2";
import { ApiError } from "../apiInterfaces.ts";

export async function uploadFile<FileResponse>(boreholeId: number, file: File) {
  if (file && file.size <= maxFileSizeKB) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetchApiV2(`boreholefile/upload?boreholeId=${boreholeId}`, "POST", formData, true);
    if (!response.ok) {
      if (response.status === 400) {
        throw new ApiError("errorDuplicatedUploadPerBorehole", response.status);
      } else {
        throw new ApiError("errorDuringBoreholeFileUpload", response.status);
      }
    } else {
      return (await response.json()) as FileResponse;
    }
  } else {
    throw new ApiError("fileMaxSizeExceeded", 500);
  }
}

export const detachFile = async (boreholeId: number, boreholeFileId: number) => {
  return await fetchApiV2(`boreholefile/detachFile?boreholeId=${boreholeId}&boreholeFileId=${boreholeFileId}`, "POST");
};

export async function getFiles<FileResponse>(boreholeId: number): Promise<FileResponse[]> {
  const response = await fetchApiV2(`boreholefile/getAllForBorehole?boreholeId=${boreholeId}`, "GET");
  if (response) {
    return response as FileResponse[];
  } else {
    throw new ApiError("errorBoreholeFileLoading", 500);
  }
}

export const downloadFile = async (boreholeFileId: number) => {
  return await fetchApiV2(`boreholefile/download?boreholeFileId=${boreholeFileId}`, "GET", null, false, true);
};

export const updateFile = async (
  boreholeId: number,
  boreholeFileId: number,
  description: string,
  isPublic: boolean,
) => {
  return await fetchApiV2(
    `boreholefile/update?boreholeId=${boreholeId}&boreholeFileId=${boreholeFileId}`,
    "PUT",
    {
      description: description,
      public: isPublic,
    },
    false,
  );
};

export const getDataExtractionFile = async (boreholeFileId: number, index: number) => {
  const response = await fetchApiV2(
    `boreholefile/getDataExtractionFile?boreholeFileId=${boreholeFileId}&index=${index}`,
    "GET",
  );
  if (response) {
    return response as DataExtractionResponse;
  } else {
    throw new ApiError("errorDataExtractionFileLoading", 500);
  }
};
