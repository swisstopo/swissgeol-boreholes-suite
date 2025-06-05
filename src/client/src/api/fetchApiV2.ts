import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Codelist } from "../components/Codelist.ts";
import store from "../reducers";
import {
  ApiError,
  Backfill,
  Casing,
  Chronostratigraphy,
  Completion,
  Document,
  DocumentUpdate,
  FaciesDescription,
  GeometryFormat,
  Instrumentation,
  Layer,
  LithologicalDescription,
  Lithostratigraphy,
  Photo,
  Stratigraphy,
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
  if (contentType && contentType.indexOf("application/json") !== -1) {
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

/**
 * Fetch data from the C# Api.
 * @param url The resource url.
 * @param method The HTTP request method to apply (e.g. GET, PUT, POST...).
 * @param payload The payload of the HTTP request (optional).
 * @returns The HTTP response as JSON.
 */
/* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
export async function fetchApiV2(url: string, method: string, payload: object | null = null): Promise<any> {
  const response = await fetchApiV2Base(url, method, payload ? JSON.stringify(payload) : null, "application/json");
  if (response.ok) {
    return await readApiResponse(response);
  } else {
    return response.text().then(text => alert(text));
  }
}

/**
 * Fetch data from the C# Api and return an Api error if the fetch was not successfull.
 * This method should only be used in a try-catch block, handling the error.
 * @param url The resource url.
 * @param method The HTTP request method to apply (e.g. GET, PUT, POST...).
 * @param payload The payload of the HTTP request (optional).
 * @returns The HTTP response as JSON.
 */
export async function fetchApiV2WithApiError(
  url: string,
  method: string,
  payload: FormData | object | null = null,
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
): Promise<any> {
  const response = await fetchApiV2Base(url, method, payload ? JSON.stringify(payload) : null, "application/json");
  if (response.ok) {
    return await readApiResponse(response);
  }
  try {
    // handle throwing alert with error details
    const responseContent = await readApiResponse(response);
    const responseDetail = JSON.parse(responseContent).detail;
    throw new ApiError(responseDetail || "errorWhileFetchingData", response.status);
  } catch (e) {
    if (e instanceof ApiError) {
      throw e;
    }
    throw new ApiError("errorWhileFetchingData", response.status);
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

// layers
export const fetchLayerById = async (id: number): Promise<Layer> => await fetchApiV2(`layer/${id}`, "GET");

export const fetchLayersByProfileId = async (profileId: number): Promise<Layer[]> =>
  await fetchApiV2(`layer?profileId=${profileId}`, "GET");

export const updateLayer = async (layer: Layer): Promise<Layer> => {
  // remove derived objects
  delete layer.createdBy;
  delete layer.updatedBy;
  return await fetchApiV2("layer", "PUT", layer);
};

// codelists
export const fetchAllCodeLists = async (): Promise<Codelist[]> => await fetchApiV2("codelist", "GET");

export const updateCodeLists = async (codelist: Codelist): Promise<Codelist> =>
  await fetchApiV2("codelist", "PUT", codelist);

// lithological descriptions
export const fetchLithologicalDescriptionsByProfileId = async (
  profileId: number,
): Promise<LithologicalDescription[]> => {
  return await fetchApiV2(`lithologicaldescription?stratigraphyId=${profileId}`, "GET");
};

export const addLithologicalDescription = async (
  lithologicalDescription: LithologicalDescription,
): Promise<LithologicalDescription> => {
  return await fetchApiV2("lithologicaldescription", "POST", lithologicalDescription);
};

export const updateLithologicalDescription = async (
  lithologicalDescription: LithologicalDescription,
): Promise<LithologicalDescription> => {
  return await fetchApiV2("lithologicaldescription", "PUT", lithologicalDescription);
};

export const deleteLithologicalDescription = async (id: number): Promise<void> => {
  return await fetchApiV2(`lithologicaldescription?id=${id}`, "DELETE");
};

// facies descriptions
export const fetchFaciesDescriptionsByProfileId = async (profileId: number): Promise<FaciesDescription[]> => {
  return await fetchApiV2(`faciesdescription?stratigraphyId=${profileId}`, "GET");
};

export const addFaciesDescription = async (faciesDescription: FaciesDescription): Promise<FaciesDescription> => {
  return await fetchApiV2("faciesdescription", "POST", faciesDescription);
};

export const updateFaciesDescription = async (faciesDescription: FaciesDescription): Promise<FaciesDescription> => {
  return await fetchApiV2("faciesdescription", "PUT", faciesDescription);
};

export const deleteFaciesDescription = async (id: number): Promise<void> => {
  return await fetchApiV2(`faciesdescription?id=${id}`, "DELETE");
};

// stratigraphy
export const fetchStratigraphy = async (id: number): Promise<Stratigraphy> => {
  return await fetchApiV2(`stratigraphy/${id}`, "GET");
};

export const fetchStratigraphyByBoreholeId = async (boreholeId: number): Promise<Stratigraphy[]> => {
  return await fetchApiV2(`stratigraphy?boreholeId=${boreholeId}`, "GET");
};

export const copyStratigraphy = async (id: number): Promise<Stratigraphy> => {
  return await fetchApiV2(`stratigraphy/copy?id=${id}`, "POST");
};

export const deleteStratigraphy = async (id: number): Promise<void> => {
  return await fetchApiV2(`stratigraphy?id=${id}`, "DELETE");
};

export const createStratigraphy = async (boreholeId: number): Promise<Stratigraphy> => {
  return await fetchApiV2("stratigraphy", "POST", {
    boreholeId: boreholeId,
  });
};

export const addBedrock = async (id: number): Promise<void> => {
  return await fetchApiV2(`stratigraphy/addbedrock?id=${id}`, "POST");
};

export const updateStratigraphy = async (stratigraphy: Stratigraphy): Promise<Stratigraphy> => {
  // remove derived objects
  delete stratigraphy.createdBy;
  delete stratigraphy.updatedBy;

  return await fetchApiV2("stratigraphy", "PUT", stratigraphy);
};

// Enable using react-query outputs across the application.

const staleTime10Min = 10 * 60 * 1000;
const garbageCollectionTime15Min = 15 * 60 * 1000;

export const useDomains = () =>
  useQuery({
    queryKey: ["domains"],
    queryFn: () => {
      return fetchApiV2("codelist", "GET");
    },
    staleTime: staleTime10Min,
    gcTime: garbageCollectionTime15Min,
  });

export const useDomainSchema = (schema: string) =>
  useQuery({
    queryKey: ["domains", schema],
    queryFn: async () => {
      return await fetchApiV2(`codelist?schema=${schema}`, "GET");
    },
    staleTime: staleTime10Min,
    gcTime: garbageCollectionTime15Min,
  });

export const useCantons = () =>
  useQuery({
    queryKey: ["cantons"],
    queryFn: () => {
      return fetchApiV2("canton", "GET");
    },
    staleTime: staleTime10Min,
    gcTime: garbageCollectionTime15Min,
  });

export const layerQueryKey = "layers";

export const useLayers = (profileId?: number) =>
  useQuery({
    queryKey: [layerQueryKey, profileId],
    queryFn: () => fetchLayersByProfileId(profileId!),
    enabled: !!profileId,
  });

export const lithologicalDescriptionQueryKey = "lithoDesc";

export const useLithoDescription = (selectedStratigraphyID?: number) =>
  useQuery({
    queryKey: [lithologicalDescriptionQueryKey, selectedStratigraphyID],
    queryFn: () => fetchLithologicalDescriptionsByProfileId(selectedStratigraphyID!),
    enabled: !!selectedStratigraphyID,
  });

export const faciesDescriptionQueryKey = "faciesDesc";

export const useFaciesDescription = (selectedStratigraphyID?: number) =>
  useQuery({
    queryKey: [faciesDescriptionQueryKey, selectedStratigraphyID],
    queryFn: () => fetchFaciesDescriptionsByProfileId(selectedStratigraphyID!),
    enabled: !!selectedStratigraphyID,
  });

export const useLithologyStratigraphies = (boreholeId?: number) => {
  return useQuery({
    queryKey: ["lithologyStratigraphies", boreholeId],
    queryFn: async () => {
      return await fetchApiV2(`stratigraphy?boreholeId=${boreholeId}`, "GET");
    },
    enabled: !!boreholeId,
  });
};

export const chronostratigraphiesQueryKey = "chronostratigraphies";

export const useChronostratigraphies = (stratigraphyID?: number) =>
  useQuery({
    queryKey: [chronostratigraphiesQueryKey, stratigraphyID],
    queryFn: async () => {
      return await fetchApiV2(`chronostratigraphy?stratigraphyId=${stratigraphyID}`, "GET");
    },
    enabled: !!stratigraphyID,
  });

export const useChronostratigraphyMutations = () => {
  const queryClient = useQueryClient();
  const useAddChronostratigraphy = useMutation({
    mutationFn: async (chronostratigraphy: Chronostratigraphy) => {
      return await fetchApiV2("chronostratigraphy", "POST", chronostratigraphy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [chronostratigraphiesQueryKey],
      });
    },
  });
  const useUpdateChronostratigraphy = useMutation({
    mutationFn: async (chronostratigraphy: Chronostratigraphy) => {
      return await fetchApiV2("chronostratigraphy", "PUT", chronostratigraphy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [chronostratigraphiesQueryKey],
      });
    },
  });
  const useDeleteChronostratigraphy = useMutation({
    mutationFn: async (chronostratigraphyId: number) => {
      return await fetchApiV2(`chronostratigraphy?id=${chronostratigraphyId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [chronostratigraphiesQueryKey],
      });
    },
  });

  return {
    add: useAddChronostratigraphy,
    update: useUpdateChronostratigraphy,
    delete: useDeleteChronostratigraphy,
  };
};

export const lithostratigraphiesQueryKey = "lithostratigraphies";

export const useLithostratigraphies = (stratigraphyID?: number) =>
  useQuery({
    queryKey: [lithostratigraphiesQueryKey, stratigraphyID],
    queryFn: async () => {
      return await fetchApiV2(`lithostratigraphy?stratigraphyId=${stratigraphyID}`, "GET");
    },
    enabled: !!stratigraphyID,
  });

export const useLithostratigraphyMutations = () => {
  const queryClient = useQueryClient();
  const useAddLithostratigraphy = useMutation({
    mutationFn: async (lithostratigraphy: Lithostratigraphy) => {
      return await fetchApiV2("lithostratigraphy", "POST", lithostratigraphy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [lithostratigraphiesQueryKey],
      });
    },
  });
  const useUpdateLithostratigraphy = useMutation({
    mutationFn: async (lithostratigraphy: Lithostratigraphy) => {
      return await fetchApiV2("lithostratigraphy", "PUT", lithostratigraphy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [lithostratigraphiesQueryKey],
      });
    },
  });
  const useDeleteLithostratigraphy = useMutation({
    mutationFn: async (lithostratigraphyId: number) => {
      return await fetchApiV2(`lithostratigraphy?id=${lithostratigraphyId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [lithostratigraphiesQueryKey],
      });
    },
  });

  return {
    add: useAddLithostratigraphy,
    update: useUpdateLithostratigraphy,
    delete: useDeleteLithostratigraphy,
  };
};

export const geometryQueryKey = "boreholeGeometry";

export const useBoreholeGeometry = (boreholeId?: number) =>
  useQuery({
    queryKey: [geometryQueryKey, boreholeId],
    queryFn: async () => {
      return await fetchApiV2(`boreholegeometry?boreholeId=${boreholeId}`, "GET");
    },
    enabled: !!boreholeId,
  });

export const getBoreholeGeometryFormats = async (): Promise<GeometryFormat[]> => {
  return await fetchApiV2("boreholegeometry/geometryformats", "GET");
};

export const useBoreholeGeometryMutations = () => {
  const queryClient = useQueryClient();
  const useSetBoreholeGeometry = useMutation({
    mutationFn: async ({ boreholeId, formData }: { boreholeId: number; formData: FormData }) => {
      return await upload(`boreholegeometry?boreholeId=${boreholeId}`, "POST", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [geometryQueryKey],
      });
    },
  });
  const useDeleteBoreholeGeometry = useMutation({
    mutationFn: async (boreholeId: number) => {
      return await fetchApiV2(`boreholegeometry?boreholeId=${boreholeId}`, "DELETE");
    },
    onSuccess: () => {
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
  return await fetchApiV2(`boreholegeometry/getDepthTVD?boreholeId=${boreholeId}&depthMD=${depthMD}`, "GET");
};

export const getBoreholeGeometryDepthMasl = async (boreholeId: number, depthMD: number): Promise<number> => {
  return await fetchApiV2(`boreholegeometry/getDepthInMasl?boreholeId=${boreholeId}&depthMD=${depthMD}`, "GET");
};

export const getBoreholeGeometryDepthMDFromMasl = async (boreholeId: number, depthMasl: number): Promise<number> => {
  return await fetchApiV2(`boreholegeometry/getDepthMDFromMasl?boreholeId=${boreholeId}&depthMasl=${depthMasl}`, "GET");
};

export const getCompletions = async (boreholeId: number): Promise<Completion[]> => {
  return await fetchApiV2(`completion?boreholeId=${boreholeId}`, "GET");
};

export const addCompletion = async (completion: Completion): Promise<Completion> => {
  return await fetchApiV2("completion", "POST", completion);
};

export const updateCompletion = async (completion: Completion): Promise<Completion> => {
  return await fetchApiV2("completion", "PUT", completion);
};

export const copyCompletion = async (completionId: number): Promise<Completion> => {
  return await fetchApiV2(`completion/copy?id=${completionId}`, "POST");
};

export const deleteCompletion = async (id: number): Promise<void> => {
  return await fetchApiV2(`completion?id=${id}`, "DELETE");
};

export const getInstrumentation = async (completionId: number): Promise<Instrumentation[]> => {
  return await fetchApiV2(`instrumentation?completionId=${completionId}`, "GET");
};

export const addInstrumentation = async (instrumentation: Instrumentation): Promise<Instrumentation> => {
  return await fetchApiV2("instrumentation", "POST", instrumentation);
};

export const updateInstrumentation = async (instrumentation: Instrumentation): Promise<Instrumentation> => {
  return await fetchApiV2("instrumentation", "PUT", instrumentation);
};

export const deleteInstrumentation = async (id: number): Promise<void> => {
  return await fetchApiV2(`instrumentation?id=${id}`, "DELETE");
};

export const getBackfills = async (completionId: number): Promise<Backfill[]> => {
  return await fetchApiV2(`backfill?completionId=${completionId}`, "GET");
};

export const addBackfill = async (backfill: Backfill): Promise<Backfill> => {
  return await fetchApiV2("backfill", "POST", backfill);
};

export const updateBackfill = async (backfill: Backfill): Promise<Backfill> => {
  return await fetchApiV2("backfill", "PUT", backfill);
};

export const deleteBackfill = async (id: number): Promise<void> => {
  return await fetchApiV2(`backfill?id=${id}`, "DELETE");
};

export const getCasings = async (completionId: number): Promise<Casing[]> => {
  return await fetchApiV2(`casing?completionId=${completionId}`, "GET");
};

export const getCasingsByBoreholeId = async (boreholeId: number): Promise<Casing[]> => {
  return await fetchApiV2(`casing?boreholeId=${boreholeId}`, "GET");
};

export const addCasing = async (casing: Casing): Promise<Casing> => {
  return await fetchApiV2("casing", "POST", casing);
};

export const updateCasing = async (casing: Casing): Promise<Casing> => {
  return await fetchApiV2("casing", "PUT", casing);
};

export const deleteCasing = async (id: number): Promise<void> => {
  return await fetchApiV2(`casing?id=${id}`, "DELETE");
};

export const getSectionsByBoreholeId = async (boreholeId: number): Promise<Section[]> => {
  return await fetchApiV2(`section?boreholeId=${boreholeId}`, "GET");
};

export const addSection = async (section: Section): Promise<Section> => {
  return await fetchApiV2("section", "POST", section);
};

export const updateSection = async (section: Section): Promise<Section> => {
  return await fetchApiV2("section", "PUT", section);
};

export const deleteSection = async (id: number): Promise<void> => {
  return await fetchApiV2(`section?id=${id}`, "DELETE");
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
  return await fetchApiV2(`photo/getAllForBorehole?boreholeId=${boreholeId}`, "GET");
};

export const exportPhotos = async (photoIds: number[]): Promise<Response> => {
  return await download(`photo/export?${photoIds.map(id => `photoIds=${id}`).join("&")}`);
};

export const deletePhotos = async (photoIds: number[]): Promise<Response> => {
  return await fetchApiV2(`photo?${photoIds.map(id => `photoIds=${id}`).join("&")}`, "DELETE");
};

export const updatePhotos = async (data: { id: number; public: boolean }[]): Promise<Response> => {
  return await fetchApiV2("photo", "PUT", data);
};

export const getPhotoImageData = async (photoId: number): Promise<Blob> => {
  const response = await fetchApiV2Base(`photo/image?photoId=${photoId}`, "GET");
  if (!response.ok) {
    throw new ApiError("errorLoadingImage", response.status);
  }
  return await response.blob();
};

export const getDocumentsByBoreholeId = async (boreholeId: number): Promise<Document[]> => {
  return await fetchApiV2(`document/getAllForBorehole?boreholeId=${boreholeId}`, "GET");
};

export const createDocument = async (document: Document): Promise<Document> => {
  return await fetchApiV2("document", "POST", document);
};

export const updateDocuments = async (documents: DocumentUpdate[]): Promise<Document> => {
  return await fetchApiV2("document", "PUT", documents);
};

export const deleteDocuments = async (documentIds: number[]): Promise<Response> => {
  return await fetchApiV2(`document?${documentIds.map(id => `documentIds=${id}`).join("&")}`, "DELETE");
};
