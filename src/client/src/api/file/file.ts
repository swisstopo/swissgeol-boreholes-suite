import { DataExtractionResponse, maxFileSizeKB } from "./fileInterfaces.ts";
import { download, fetchApiV2, fetchApiV2Base, upload } from "../fetchApiV2";
import { ApiError } from "../apiInterfaces.ts";
import { ExtractionRequest, ExtractionResponse } from "../../pages/detail/labeling/labelingInterfaces.tsx";

export async function uploadFile<FileResponse>(boreholeId: number, file: File) {
  if (file && file.size <= maxFileSizeKB) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await upload(`boreholefile/upload?boreholeId=${boreholeId}`, "POST", formData);
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
  return await download(`boreholefile/download?boreholeFileId=${boreholeFileId}`);
};

export const updateFile = async (
  boreholeId: number,
  boreholeFileId: number,
  description: string,
  isPublic: boolean,
) => {
  return await fetchApiV2(`boreholefile/update?boreholeId=${boreholeId}&boreholeFileId=${boreholeFileId}`, "PUT", {
    description: description,
    public: isPublic,
  });
};

export async function getDataExtractionFileInfo(
  boreholeFileId: number,
  index: number,
): Promise<DataExtractionResponse> {
  let response = await fetchApiV2(
    `boreholefile/getDataExtractionFileInfo?boreholeFileId=${boreholeFileId}&index=${index}`,
    "GET",
  );
  if (response) {
    response = response as DataExtractionResponse;
    if (response.count === 0) {
      await createExtractionPngs(response.fileName);
      return await getDataExtractionFileInfo(boreholeFileId, index);
    }
    return response;
  } else {
    throw new ApiError("errorDataExtractionFileLoading", 500);
  }
}

export async function loadImage(fileName: string) {
  const response = await fetchApiV2Base("boreholefile/dataextraction/" + fileName, "GET");
  if (response.ok) {
    return response.blob();
  } else {
    throw new ApiError(response.statusText, response.status);
  }
}

export async function createExtractionPngs(fileName: string) {
  // TODO: Maybe update URL after proper integration
  const response = await fetch("http://localhost:8000/api/V1/create_pngs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: fileName + ".pdf" }),
  });
  if (!response.ok) {
    throw new ApiError("errorDataExtractionFileLoading", 500);
  }
}

export async function extractData(request: ExtractionRequest, abortSignal: AbortSignal): Promise<ExtractionResponse> {
  // TODO: Maybe update URL after proper integration
  const response = await fetch("http://localhost:8000/api/V1/extract_data", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(request),
    signal: abortSignal,
  });

  if (response.ok) {
    const extractionResponse = (await response.json()) as ExtractionResponse;
    console.log("extractionResponse", extractionResponse);
    if (extractionResponse.detail) {
      throw new ApiError(extractionResponse.detail, 500);
    }
    return extractionResponse;
  } else {
    const text = await response.text();
    console.log(text);
    throw new ApiError("errorDataExtraction", response.status);
  }
}
