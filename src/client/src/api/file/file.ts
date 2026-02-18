import { useQuery } from "@tanstack/react-query";
import { ExtractedLithologicalDescription } from "../../pages/detail/form/stratigraphy/lithologicalDescription.ts";
import {
  BoundingBoxResponse,
  ExtractionRequest,
  ExtractionResponse,
  StratigraphyExtractionResponse,
} from "../../pages/detail/labeling/labelingInterfaces.tsx";
import { ApiError, BoreholeAttachment } from "../apiInterfaces.ts";
import { fetchCreatePngs, fetchExtractData, fetchExtractStratigraphy, fetchPageBoundingBoxes } from "../dataextraction";
import { download, fetchApiV2Base, fetchApiV2Legacy, fetchApiV2WithApiError, upload } from "../fetchApiV2.ts";
import { processFileWithOCR } from "../ocr.ts";
import { DataExtractionResponse, maxFileSizeBytes, Profile } from "./fileInterfaces.ts";

export async function uploadFile(boreholeId: number, file: File) {
  if (file && file.size <= maxFileSizeBytes) {
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
      const uploadedFile = (await response.json()) as Profile;
      processFileWithOCR({ file: uploadedFile.file.nameUuid });
      return uploadedFile;
    }
  } else {
    throw new ApiError("fileMaxSizeExceeded", 500);
  }
}

export const detachFile = async (profileId: number) => {
  return await fetchApiV2Legacy(`boreholefile/detachFile?profileId=${profileId}`, "POST");
};

export async function getFiles<FileResponse>(boreholeId: number): Promise<FileResponse[]> {
  const response = await fetchApiV2Legacy(`boreholefile/getAllForBorehole?boreholeId=${boreholeId}`, "GET");
  if (response) {
    return response as FileResponse[];
  } else {
    throw new ApiError("errorBoreholeFileLoading", 500);
  }
}

export const downloadFile = async (profileId: number) => {
  return await download(`boreholefile/download?profileId=${profileId}`);
};

export const updateFile = async (boreholeId: string, profileId: number, description: string, isPublic: boolean) => {
  return await fetchApiV2WithApiError(`boreholefile/update?boreholeId=${boreholeId}&profileId=${profileId}`, "PUT", {
    description: description,
    public: isPublic,
  });
};

export async function getDataExtractionFileInfo(profileId: number, index = 1): Promise<DataExtractionResponse> {
  let response = await fetchApiV2Legacy(
    `boreholefile/getDataExtractionFileInfo?profileId=${profileId}&index=${index}`,
    "GET",
  );
  if (response) {
    response = response as DataExtractionResponse;
    if (response.count === 0) {
      await createExtractionPngs(response.fileName);
      return await getDataExtractionFileInfo(profileId, index);
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

export async function extractStratigraphies(
  fileName: string,
  abortSignal: AbortSignal,
): Promise<StratigraphyExtractionResponse> {
  const response = await fetchExtractStratigraphy(fileName, abortSignal);
  if (response.ok) {
    const responseObject = await response.json();
    if (responseObject.detail) {
      throw new ApiError(responseObject.detail, 500);
    }
    return responseObject;
  } else {
    throw new ApiError("errorDataExtraction", response.status);
  }
}

const cleanUpExtractionData = (
  lithologicalDescriptions: ExtractedLithologicalDescription[],
): ExtractedLithologicalDescription[] => {
  return lithologicalDescriptions
    .filter(l => l.fromDepth != null && l.toDepth != null && l.description && l.fromDepth < l.toDepth)
    .sort((a, b) => (a.fromDepth ?? 0) - (b.fromDepth ?? 0))
    .reduce<ExtractedLithologicalDescription[]>((acc, layer) => {
      // Only use layer if it does not overlap with the previous one
      if (acc.length === 0 || layer.fromDepth >= acc[acc.length - 1].toDepth) {
        acc.push(layer);
      }
      return acc;
    }, []);
};

export function useExtractStratigraphies(file: BoreholeAttachment) {
  return useQuery({
    queryKey: ["extractStratigraphies", file],
    enabled: !!file,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes => Extraction for the same file doesn't need to be refetched.
    queryFn: async ({ signal }) => {
      await getDataExtractionFileInfo(file.id);
      const response = await extractStratigraphies(file.nameUuid, signal);
      const lithologicalDescriptions: ExtractedLithologicalDescription[] =
        // Todo: The extraction currently only supports a single borehole per file https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2146
        Array.isArray(response.boreholes) && response.boreholes.length > 0
          ? response.boreholes[0]?.layers?.map(({ start, end, material_description }, idx) => ({
              id: idx,
              fromDepth: start?.depth,
              toDepth: end?.depth,
              startDepthBoundingBoxes: start?.bounding_boxes,
              endDepthBoundingBoxes: end?.bounding_boxes,
              description: material_description.text,
              descriptionBoundingBoxes: material_description.bounding_boxes,
              stratigraphyId: 0,
            })) || []
          : [];
      return cleanUpExtractionData(lithologicalDescriptions);
    },
  });
}
