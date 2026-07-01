import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "../auth/authTokenStore.ts";
import { ExtractedLithologicalDescription } from "../pages/detail/form/stratigraphy/stratigraphy.ts";
import { getAuthorizationHeader } from "./authentication.ts";
import {
  BoundingBoxResponse,
  DataExtractionResponse,
  ExtractionRequest,
  ExtractionResponse,
  StratigraphyExtractionResponse,
} from "./dataextractionInterfaces.ts";
import { ApiError } from "./errorClasses.ts";
import { fetchApiV2WithApiError } from "./fetchApiV2.ts";
import { BoreholeAttachment } from "./unionTypes.ts";

async function fetchCreatePngs(fileName: string): Promise<Response> {
  return await fetch("/dataextraction/api/V1/create_pngs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthorizationHeader(getAuthToken()),
    },
    body: JSON.stringify({ filename: fileName }),
  });
}

async function fetchPageBoundingBoxes(fileName: string, pageNumber: number): Promise<Response> {
  return await fetch("/dataextraction/api/V1/bounding_boxes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthorizationHeader(getAuthToken()),
    },
    body: JSON.stringify({ filename: fileName, page_number: pageNumber }),
  });
}

async function fetchExtractData(request: unknown, abortSignal: AbortSignal): Promise<Response> {
  return await fetch("/dataextraction/api/V1/extract_data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: getAuthorizationHeader(getAuthToken()),
    },
    body: JSON.stringify(request),
    signal: abortSignal,
  });
}

async function fetchExtractStratigraphy(fileName: string, abortSignal: AbortSignal): Promise<Response> {
  return await fetch("/dataextraction/api/V1/extract_stratigraphy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: getAuthorizationHeader(getAuthToken()),
    },
    body: JSON.stringify({ filename: fileName }),
    signal: abortSignal,
  });
}

// Track which files have already had PNG creation triggered, to avoid duplicate work across retries.
const pngCreationStartedForFiles = new Set<string>();

export function useFileInfo(profileId: number | undefined, activePage: number) {
  return useQuery({
    queryKey: ["dataExtractionFileInfo", profileId, activePage],
    enabled: !!profileId,
    retry: 4, // Increase retries since we intentionally trigger retry after fetching pngs.
    queryFn: async () => {
      if (!profileId) return null;

      const response = await fetchApiV2WithApiError(
        `profile/getDataExtractionFileInfo?profileId=${profileId}&index=${activePage}`,
        "GET",
      );
      if (!response) {
        throw new ApiError("errorDataExtractionFileLoading", 500);
      }
      const dataResponse = response as DataExtractionResponse;

      // Create pngs if not yet available
      if (dataResponse.count === 0) {
        const fileNameWithExtension = dataResponse.fileName.includes(".")
          ? dataResponse.fileName
          : dataResponse.fileName + ".pdf";

        if (!pngCreationStartedForFiles.has(fileNameWithExtension)) {
          pngCreationStartedForFiles.add(fileNameWithExtension);
          if (fileNameWithExtension.includes(".pdf")) {
            await createExtractionPngs(fileNameWithExtension);
          }
        }

        // Throw error to trigger useQuery's retry mechanism
        throw new ApiError("pngsNotYetAvailable", 202); // 202 = Processing
      }

      return dataResponse;
    },
  });
}

async function createExtractionPngs(fileName: string) {
  const response = await fetchCreatePngs(fileName);
  if (!response.ok) {
    throw new ApiError("errorDataExtractionFileLoading", response.status);
  }
}

async function fetchExtractionBoundingBoxes(fileName: string, pageNumber: number): Promise<BoundingBoxResponse> {
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

async function extractStratigraphies(
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

export interface ExtractedStratigraphy {
  descriptions: ExtractedLithologicalDescription[];
  pageNumbers: number[];
}

// Map a raw extraction response to stratigraphies, keeping layers as-is and only dropping those
// without a description. Overlaps, invalid ranges and failed (null) depths are intentionally left
// for the lithology table seeding (cleanupOverlaps / flagErrors) to clamp or surface as errors, so
// nothing extracted is silently discarded and the "depth extraction failed" alert can fire.
export function mapExtractionResponse(response: StratigraphyExtractionResponse): ExtractedStratigraphy[] {
  if (!Array.isArray(response.boreholes) || response.boreholes.length === 0) return [];
  return response.boreholes.map(borehole => {
    const descriptions: ExtractedLithologicalDescription[] = (borehole.layers ?? [])
      .map(({ start, end, material_description }, idx) => ({
        id: idx,
        fromDepth: start?.depth ?? null,
        toDepth: end?.depth ?? null,
        startDepthBoundingBoxes: start?.bounding_boxes ?? [],
        endDepthBoundingBoxes: end?.bounding_boxes ?? [],
        description: material_description.text,
        descriptionBoundingBoxes: material_description.bounding_boxes,
        stratigraphyId: 0,
      }))
      .filter(l => l.description);

    return { descriptions, pageNumbers: borehole.page_numbers } as ExtractedStratigraphy;
  });
}

export function useExtractionBoundingBoxes(
  fileName: string | undefined,
  fileInfo: DataExtractionResponse | null | undefined,
  pageNumber: number,
) {
  return useQuery({
    queryKey: ["extractionBoundingBoxes", fileName, pageNumber],
    // only fetch bounding boxes if all necessary information is available: if fileInfo is available, we are sure that pngs have been created for newly uploaded files.
    enabled: !!fileName && !!fileInfo && pageNumber > 0,
    queryFn: async () => {
      if (!fileName) return null;
      return await fetchExtractionBoundingBoxes(fileName, pageNumber);
    },
  });
}

export function useExtractStratigraphies(file: BoreholeAttachment, activePage: number) {
  const { data: fileInfo } = useFileInfo(file?.id, activePage);
  return useQuery({
    queryKey: ["extractStratigraphies", file.nameUuid],
    enabled: !!file && !!fileInfo,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes => Extraction for the same file doesn't need to be refetched.
    queryFn: async ({ signal }) => {
      const response = await extractStratigraphies(file.nameUuid!, signal);
      return mapExtractionResponse(response);
    },
  });
}
