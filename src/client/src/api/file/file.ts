import {
  BoundingBoxResponse,
  ExtractionRequest,
  ExtractionResponse,
} from "../../pages/detail/labeling/labelingInterfaces.tsx";
import { ApiError } from "../apiInterfaces.ts";
import { fetchCreatePngs, fetchExtractData, fetchPageBoundingBoxes } from "../dataextraction";
import { download, fetchApiV2Base, fetchApiV2Legacy, fetchApiV2WithApiError, upload } from "../fetchApiV2.ts";
import { processFileWithOCR } from "../ocr.ts";
import { BoreholeFile, DataExtractionResponse, maxFileSizeKB } from "./fileInterfaces.ts";

export async function uploadFile(boreholeId: number, file: File) {
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
      const uploadedFile = (await response.json()) as BoreholeFile;
      processFileWithOCR({ file: uploadedFile.file.nameUuid });
      return uploadedFile;
    }
  } else {
    throw new ApiError("fileMaxSizeExceeded", 500);
  }
}

export const detachFile = async (boreholeFileId: number) => {
  return await fetchApiV2Legacy(`boreholefile/detachFile?boreholeFileId=${boreholeFileId}`, "POST");
};

export async function getFiles<FileResponse>(boreholeId: number): Promise<FileResponse[]> {
  const response = await fetchApiV2Legacy(`boreholefile/getAllForBorehole?boreholeId=${boreholeId}`, "GET");
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
  boreholeId: string,
  boreholeFileId: number,
  description: string,
  isPublic: boolean,
) => {
  return await fetchApiV2WithApiError(
    `boreholefile/update?boreholeId=${boreholeId}&boreholeFileId=${boreholeFileId}`,
    "PUT",
    {
      description: description,
      public: isPublic,
    },
  );
};

export async function getDataExtractionFileInfo(
  boreholeFileId: number,
  index: number,
): Promise<DataExtractionResponse> {
  let response = await fetchApiV2Legacy(
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
  if (!response.ok) {
    throw new ApiError(response.statusText, response.status);
  } else {
    return response.blob();
  }
}

export async function createExtractionPngs(fileName: string) {
  const response = await fetchCreatePngs(fileName);
  if (!response.ok) {
    throw new ApiError("errorDataExtractionFileLoading", response.status);
  }
}

export async function fetchExtractionBoundingBoxes(fileName: string, pageNumber: number): Promise<BoundingBoxResponse> {
  const response = await fetchPageBoundingBoxes(fileName, pageNumber);
  if (!response.ok) {
    throw new ApiError("errorDataExtractionFetchBoundingBoxes", response.status);
  }
  return await response.json();
}

async function fetchAndHandleExtractionResponse(
  request: ExtractionRequest,
  abortSignal: AbortSignal,
  notFoundErrorKey: string,
): Promise<ExtractionResponse> {
  const response = await fetchExtractData(request, abortSignal);
  if (response.ok) {
    const responseObject = await response.json();
    if (responseObject.detail) {
      throw new ApiError(responseObject.detail, 500);
    }
    return responseObject as ExtractionResponse;
  } else {
    if (response.status === 404) {
      throw new ApiError(notFoundErrorKey, response.status);
    }
    throw new ApiError("errorDataExtraction", response.status);
  }
}

export async function extractCoordinates(
  request: ExtractionRequest,
  abortSignal: AbortSignal,
): Promise<ExtractionResponse> {
  return fetchAndHandleExtractionResponse(request, abortSignal, "coordinatesNotFound");
}

export async function extractText(request: ExtractionRequest, abortSignal: AbortSignal): Promise<ExtractionResponse> {
  return fetchAndHandleExtractionResponse(request, abortSignal, "noTextFound");
}
