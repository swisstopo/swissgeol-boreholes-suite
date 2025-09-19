import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useResetTabStatus } from "../hooks/useResetTabStatus.ts";
import store from "../reducers";
import {
  ApiError,
  Backfill,
  Casing,
  Completion,
  Document,
  DocumentUpdate,
  GeometryFormat,
  Instrumentation,
  Photo,
} from "./apiInterfaces";
import { getAuthorizationHeader } from "./authentication";
import { Section } from "./section.ts";

export async function fetchApiV2Base(
  url: string,
  method: string,
  body: FormData | string | null = null,
  contentType: string | null = null,
): Promise<Response> {
  const baseUrl = "/api/v2/";
  // @ts-expect-error redux store will not be typed, as it's going to be removed
  const authentication = store.getState().core_user.authentication;
  let headers: Record<string, string> = {
    Authorization: getAuthorizationHeader(authentication),
  };
  if (contentType) headers = { ...headers, "Content-Type": contentType };
  return await fetch(baseUrl + url, {
    method: method,
    cache: "no-cache",
    credentials: "same-origin",
    headers: headers,
    body: body,
  });
}
/* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
async function readApiResponse(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json") || contentType?.includes("application/problem+json")) {
    return await response.json();
  } else if (
    contentType &&
    (contentType.indexOf("application/geopackage+sqlite") !== -1 ||
      contentType.indexOf("application/octet-stream") !== -1)
  ) {
    return await response.blob(); // Binary response
  } else {
    return await response.text(); // Fallback for plain text
  }
}

async function handleFetchError(response: Response) {
  const responseContent = await readApiResponse(response);
  if (typeof responseContent === "object" && responseContent !== null) {
    // Throw API Error if problem details or message is provided
    // This error type is ignored by the default mutation and query error handler in QueryClientInitializer in App.tsx and allows to handle the error individually
    if (responseContent.detail || responseContent.message) {
      throw new ApiError(responseContent.detail || responseContent.message, response.status);
    } else {
      throw new Error(responseContent);
    }
  }
}

/**
 * Fetch data from the C# Api.
 * In this method any errors that occur will be displayed in a standard browser alert.
 *The error is not accessible and cannot be handled individually.
 * Do not use this method in any new code.
 * @param url The resource url.
 * @param method The HTTP request method to apply (e.g. GET, PUT, POST...).
 * @param payload The payload of the HTTP request (optional).
 * @returns The HTTP response as JSON.
 */
/* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
export async function fetchApiV2Legacy(url: string, method: string, payload: object | null = null): Promise<any> {
  const response = await fetchApiV2Base(url, method, payload ? JSON.stringify(payload) : null, "application/json");
  if (response.ok) {
    return await readApiResponse(response);
  } else {
    return response.text().then(text => alert(text));
  }
}

/**
 * Fetch data from the C# Api and return an Api error if the fetch was not successfull.
 * This method should only be used in useQuery where the error state is handled by the query or in a try-catch block, handling the error.
 * @param url The resource url.
 * @param method The HTTP request method to apply (e.g. GET, PUT, POST...).
 * @param payload The payload of the HTTP request (optional).
 * @returns The HTTP response as JSON.
 */
export async function fetchApiV2WithApiError(url: string, method: string, payload: FormData | object | null = null) {
  const response = await fetchApiV2Base(url, method, payload ? JSON.stringify(payload) : null, "application/json");
  if (response.ok) {
    return await readApiResponse(response);
  } else {
    await handleFetchError(response);
  }
}

export async function uploadWithApiError(url: string, method: string, payload: FormData) {
  const response = await fetchApiV2Base(url, method, payload);
  if (response.ok) {
    return await readApiResponse(response);
  } else {
    await handleFetchError(response);
  }
}

export async function upload(url: string, method: string, payload: FormData): Promise<Response> {
  return await fetchApiV2Base(url, method, payload);
}

const getFallbackFileName = (url: string): string => {
  const match = /export\/(\w+)\?/.exec(url);
  if (!match) return "export";
  return `export.${match[1]}`;
};

export async function download(url: string): Promise<Response> {
  const response = await fetchApiV2Base(url, "GET", null);
  if (!response.ok) {
    throw new ApiError("errorOccurredWhileFetchingFileFromCloudStorage", response.status);
  }
  let fileName =
    response.headers.get("content-disposition")?.split("; ")[1]?.replace("filename=", "") ?? getFallbackFileName(url);

  // Explicitly add zip extension
  // By default if a fileName includes a dot, everything following the dot is treated as the extension and no zip extension is added.
  if (url.includes("/zip?")) {
    fileName = fileName.replace(/"/g, "");
    fileName += ".zip";
  }
  const blob = await response.blob();
  const downLoadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downLoadUrl;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  return response;
}

// Enable using react-query outputs across the application.

const staleTime10Min = 10 * 60 * 1000;
const garbageCollectionTime15Min = 15 * 60 * 1000;

export const useCantons = () =>
  useQuery({
    queryKey: ["cantons"],
    queryFn: () => {
      return fetchApiV2WithApiError("canton", "GET");
    },
    staleTime: staleTime10Min,
    gcTime: garbageCollectionTime15Min,
  });

export const geometryQueryKey = "boreholeGeometry";

export const useBoreholeGeometry = (boreholeId?: number) =>
  useQuery({
    queryKey: [geometryQueryKey, boreholeId],
    queryFn: async () => {
      return await fetchApiV2WithApiError(`boreholegeometry?boreholeId=${boreholeId}`, "GET");
    },
    enabled: !!boreholeId,
  });

export const getBoreholeGeometryFormats = async (): Promise<GeometryFormat[]> => {
  return await fetchApiV2Legacy("boreholegeometry/geometryformats", "GET");
};

export const useBoreholeGeometryMutations = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["geometry"]);

  const useSetBoreholeGeometry = useMutation({
    mutationFn: async ({ boreholeId, formData }: { boreholeId: number; formData: FormData }) => {
      return await uploadWithApiError(`boreholegeometry?boreholeId=${boreholeId}`, "POST", formData);
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({
        queryKey: [geometryQueryKey],
      });
    },
  });
  const useDeleteBoreholeGeometry = useMutation({
    mutationFn: async (boreholeId: number) => {
      return await fetchApiV2WithApiError(`boreholegeometry?boreholeId=${boreholeId}`, "DELETE");
    },
    onSuccess: () => {
      resetTabStatus();
      queryClient.invalidateQueries({
        queryKey: [geometryQueryKey],
      });
    },
  });

  return {
    set: useSetBoreholeGeometry,
    delete: useDeleteBoreholeGeometry,
  };
};

export const getBoreholeGeometryDepthTVD = async (boreholeId: number, depthMD: number): Promise<number> => {
  return await fetchApiV2Legacy(`boreholegeometry/getDepthTVD?boreholeId=${boreholeId}&depthMD=${depthMD}`, "GET");
};

export const getBoreholeGeometryDepthMasl = async (boreholeId: number, depthMD: number): Promise<number> => {
  return await fetchApiV2Legacy(`boreholegeometry/getDepthInMasl?boreholeId=${boreholeId}&depthMD=${depthMD}`, "GET");
};

export const getBoreholeGeometryDepthMDFromMasl = async (boreholeId: number, depthMasl: number): Promise<number> => {
  return await fetchApiV2Legacy(
    `boreholegeometry/getDepthMDFromMasl?boreholeId=${boreholeId}&depthMasl=${depthMasl}`,
    "GET",
  );
};

export const getCompletions = async (boreholeId: number): Promise<Completion[]> => {
  return await fetchApiV2Legacy(`completion?boreholeId=${boreholeId}`, "GET");
};

export const addCompletion = async (completion: Completion): Promise<Completion> => {
  return await fetchApiV2Legacy("completion", "POST", completion);
};

export const updateCompletion = async (completion: Completion): Promise<Completion> => {
  return await fetchApiV2Legacy("completion", "PUT", completion);
};

export const copyCompletion = async (completionId: number): Promise<Completion> => {
  return await fetchApiV2Legacy(`completion/copy?id=${completionId}`, "POST");
};

export const deleteCompletion = async (id: number): Promise<void> => {
  return await fetchApiV2Legacy(`completion?id=${id}`, "DELETE");
};

export const getInstrumentation = async (completionId: number): Promise<Instrumentation[]> => {
  return await fetchApiV2Legacy(`instrumentation?completionId=${completionId}`, "GET");
};

export const addInstrumentation = async (instrumentation: Instrumentation): Promise<Instrumentation> => {
  return await fetchApiV2Legacy("instrumentation", "POST", instrumentation);
};

export const updateInstrumentation = async (instrumentation: Instrumentation): Promise<Instrumentation> => {
  return await fetchApiV2Legacy("instrumentation", "PUT", instrumentation);
};

export const deleteInstrumentation = async (id: number): Promise<void> => {
  return await fetchApiV2Legacy(`instrumentation?id=${id}`, "DELETE");
};

export const getBackfills = async (completionId: number): Promise<Backfill[]> => {
  return await fetchApiV2Legacy(`backfill?completionId=${completionId}`, "GET");
};

export const addBackfill = async (backfill: Backfill): Promise<Backfill> => {
  return await fetchApiV2Legacy("backfill", "POST", backfill);
};

export const updateBackfill = async (backfill: Backfill): Promise<Backfill> => {
  return await fetchApiV2Legacy("backfill", "PUT", backfill);
};

export const deleteBackfill = async (id: number): Promise<void> => {
  return await fetchApiV2Legacy(`backfill?id=${id}`, "DELETE");
};

export const getCasings = async (completionId: number): Promise<Casing[]> => {
  return await fetchApiV2Legacy(`casing?completionId=${completionId}`, "GET");
};

export const getCasingsByBoreholeId = async (boreholeId: number): Promise<Casing[]> => {
  return await fetchApiV2Legacy(`casing?boreholeId=${boreholeId}`, "GET");
};

export const addCasing = async (casing: Casing): Promise<Casing> => {
  return await fetchApiV2Legacy("casing", "POST", casing);
};

export const updateCasing = async (casing: Casing): Promise<Casing> => {
  return await fetchApiV2Legacy("casing", "PUT", casing);
};

export const deleteCasing = async (id: number): Promise<void> => {
  return await fetchApiV2Legacy(`casing?id=${id}`, "DELETE");
};

export const getSectionsByBoreholeId = async (boreholeId: number): Promise<Section[]> => {
  return await fetchApiV2Legacy(`section?boreholeId=${boreholeId}`, "GET");
};

export const addSection = async (section: Section): Promise<Section> => {
  return await fetchApiV2Legacy("section", "POST", section);
};

export const updateSection = async (section: Section): Promise<Section> => {
  return await fetchApiV2Legacy("section", "PUT", section);
};

export const deleteSection = async (id: number): Promise<void> => {
  return await fetchApiV2Legacy(`section?id=${id}`, "DELETE");
};

export const downloadCodelistCsv = (): Promise<Response> => download(`codelist/csv`);

export const uploadPhoto = async (boreholeId: number, file: File): Promise<Photo> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await upload(`photo/upload?boreholeId=${boreholeId}`, "POST", formData);
  if (!response.ok) {
    if (response.status === 400) {
      throw new ApiError(await response.text(), response.status);
    } else {
      throw new ApiError("errorDuringBoreholeFileUpload", response.status);
    }
  } else {
    return (await response.json()) as Photo;
  }
};

export const getPhotosByBoreholeId = async (boreholeId: number): Promise<Photo[]> => {
  return await fetchApiV2Legacy(`photo/getAllForBorehole?boreholeId=${boreholeId}`, "GET");
};

export const exportPhotos = async (photoIds: number[]): Promise<Response> => {
  return await download(`photo/export?${photoIds.map(id => `photoIds=${id}`).join("&")}`);
};

export const deletePhotos = async (photoIds: number[]): Promise<Response> => {
  return await fetchApiV2Legacy(`photo?${photoIds.map(id => `photoIds=${id}`).join("&")}`, "DELETE");
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

export const getDocumentsByBoreholeId = async (boreholeId: number): Promise<Document[]> => {
  return await fetchApiV2Legacy(`document/getAllForBorehole?boreholeId=${boreholeId}`, "GET");
};

export const createDocument = async (document: Document): Promise<Document> => {
  return await fetchApiV2Legacy("document", "POST", document);
};

export const updateDocuments = async (documents: DocumentUpdate[]): Promise<Document> => {
  return await fetchApiV2WithApiError("document", "PUT", documents);
};

export const deleteDocuments = async (documentIds: number[]): Promise<Response> => {
  return await fetchApiV2Legacy(`document?${documentIds.map(id => `documentIds=${id}`).join("&")}`, "DELETE");
};
