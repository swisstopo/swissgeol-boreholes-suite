import { useMutation, useQuery, useQueryClient } from "react-query";

import store from "../reducers";
import { ApiError } from "./apiInterfaces";
import { getAuthorizationHeader } from "./authentication";

export async function fetchApiV2Base(url, method, body, contentType = null) {
  const baseUrl = "/api/v2/";
  const authentication = store.getState().core_user.authentication;
  let headers = {
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

/**
 * Fetch data from the C# Api.
 * @param {*} url The resource url.
 * @param {*} method The HTTP request method to apply (e.g. GET, PUT, POST...).
 * @param {*} payload The payload of the HTTP request (optional).
 * @returns The HTTP response as JSON.
 */
export async function fetchApiV2(url, method, payload = null) {
  const response = await fetchApiV2Base(url, method, payload ? JSON.stringify(payload) : null, "application/json");
  if (response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
    } else {
      return await response.text();
    }
  } else {
    return response.text().then(text => alert(text));
  }
}

export async function upload(url, method, payload) {
  return await fetchApiV2Base(url, method, payload);
}

export async function download(url) {
  const response = await fetchApiV2Base(url, "GET", null);
  if (!response.ok) {
    throw new ApiError(response.statusText, response.status);
  }

  const fileName =
    response.headers.get("content-disposition")?.split("; ")[1]?.replace("filename=", "") ?? "export.pdf";
  const blob = await response.blob();
  const downLoadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downLoadUrl;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  return response;
}

// boreholes
export const importBoreholes = async (workgroupId, combinedFormData) => {
  return await upload(`upload?workgroupId=${workgroupId}`, "POST", combinedFormData);
};

export const copyBorehole = async (boreholeId, workgroupId) => {
  return await fetchApiV2(`borehole/copy?id=${boreholeId}&workgroupId=${workgroupId}`, "POST");
};

// layers
export const fetchLayerById = async id => await fetchApiV2(`layer/${id}`, "GET");

export const fetchLayersByProfileId = async profileId => await fetchApiV2(`layer?profileId=${profileId}`, "GET");

export const updateLayer = async layer => {
  // remove derived objects
  delete layer.createdBy;
  delete layer.updatedBy;
  return await fetchApiV2("layer", "PUT", layer);
};

// codelists
export const fetchAllCodeLists = async () => await fetchApiV2("codelist", "GET");

export const updateCodeLists = async codelist => await fetchApiV2("codelist", "PUT", codelist);

// lithological descriptions
export const fetchLithologicalDescriptionsByProfileId = async profileId => {
  return await fetchApiV2(`lithologicaldescription?stratigraphyId=${profileId}`, "GET");
};

export const addLithologicalDescription = async lithologicalDescription => {
  return await fetchApiV2("lithologicaldescription", "POST", lithologicalDescription);
};

export const updateLithologicalDescription = async lithologicalDescription => {
  return await fetchApiV2("lithologicaldescription", "PUT", lithologicalDescription);
};

export const deleteLithologicalDescription = async id => {
  return await fetchApiV2(`lithologicaldescription?id=${id}`, "DELETE");
};

// facies descriptions
export const fetchFaciesDescriptionsByProfileId = async profileId => {
  return await fetchApiV2(`faciesdescription?stratigraphyId=${profileId}`, "GET");
};

export const addFaciesDescription = async faciesDescription => {
  return await fetchApiV2("faciesdescription", "POST", faciesDescription);
};

export const updateFaciesDescription = async faciesDescription => {
  return await fetchApiV2("faciesdescription", "PUT", faciesDescription);
};

export const deleteFaciesDescription = async id => {
  return await fetchApiV2(`faciesdescription?id=${id}`, "DELETE");
};

// stratigraphy
export const fetchStratigraphy = async id => {
  return await fetchApiV2(`stratigraphy/${id}`, "GET");
};

export const fetchStratigraphyByBoreholeId = async boreholeId => {
  return await fetchApiV2(`stratigraphy?boreholeId=${boreholeId}`, "GET");
};

export const copyStratigraphy = async id => {
  return await fetchApiV2(`stratigraphy/copy?id=${id}`, "POST");
};

export const deleteStratigraphy = async id => {
  return await fetchApiV2(`stratigraphy?id=${id}`, "DELETE");
};

export const createStratigraphy = async boreholeId => {
  return await fetchApiV2("stratigraphy", "POST", {
    boreholeId: boreholeId,
  });
};

export const addBedrock = async id => {
  return await fetchApiV2(`stratigraphy/addbedrock?id=${id}`, "POST");
};

export const updateStratigraphy = async stratigraphy => {
  // remove derived objects
  delete stratigraphy.createdBy;
  delete stratigraphy.updatedBy;

  return await fetchApiV2("stratigraphy", "PUT", stratigraphy);
};

// Enable using react-query outputs across the application.

export const useDomains = () =>
  useQuery("domains", () => {
    const domains = fetchApiV2("codelist", "GET");
    return domains;
  });

export const useDomainSchema = schema =>
  useQuery(
    ["domains", schema],
    async () => {
      return await fetchApiV2(`codelist?schema=${schema}`, "GET");
    },
    {
      staleTime: 10 * (60 * 1000), // 10 mins
      cacheTime: 15 * (60 * 1000), // 15 mins
    },
  );

export const useHydrotestDomains = testKindIds => {
  let queryString = "";
  testKindIds.forEach(id => {
    queryString += `testKindIds=${id}&`;
  });

  return useQuery(
    ["domains", queryString],
    async () => {
      return await fetchApiV2(`codelist?${queryString}`, "GET");
    },
    {
      staleTime: 10 * (60 * 1000), // 10 mins
      cacheTime: 15 * (60 * 1000), // 15 mins
    },
  );
};

export const layerQueryKey = "layers";

export const useLayers = profileId =>
  useQuery({
    queryKey: [layerQueryKey, profileId],
    queryFn: () => fetchLayersByProfileId(profileId),
    enabled: !!profileId,
  });

export const lithologicalDescriptionQueryKey = "lithoDesc";

export const useLithoDescription = selectedStratigraphyID =>
  useQuery({
    queryKey: [lithologicalDescriptionQueryKey, selectedStratigraphyID],
    queryFn: () => fetchLithologicalDescriptionsByProfileId(selectedStratigraphyID),
  });

export const faciesDescriptionQueryKey = "faciesDesc";

export const useFaciesDescription = selectedStratigraphyID =>
  useQuery({
    queryKey: [faciesDescriptionQueryKey, selectedStratigraphyID],
    queryFn: () => fetchFaciesDescriptionsByProfileId(selectedStratigraphyID),
  });

export const useLithologyStratigraphies = boreholeId => {
  return useQuery({
    queryKey: ["lithologyStratigraphies", boreholeId],
    queryFn: async () => {
      return await fetchApiV2(`stratigraphy?boreholeId=${boreholeId}`, "GET");
    },
  });
};

export const chronostratigraphiesQueryKey = "chronostratigraphies";

export const useChronostratigraphies = stratigraphyID =>
  useQuery({
    queryKey: [chronostratigraphiesQueryKey, stratigraphyID],
    queryFn: async () => {
      return await fetchApiV2(`chronostratigraphy?stratigraphyId=${stratigraphyID}`, "GET");
    },
    enabled: !!stratigraphyID,
  });

export const useChronostratigraphyMutations = () => {
  const queryClient = useQueryClient();
  const useAddChronostratigraphy = useMutation(
    async chronostratigraphy => {
      return await fetchApiV2("chronostratigraphy", "POST", chronostratigraphy);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [chronostratigraphiesQueryKey],
        });
      },
    },
  );
  const useUpdateChronostratigraphy = useMutation(
    async chronostratigraphy => {
      return await fetchApiV2("chronostratigraphy", "PUT", chronostratigraphy);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [chronostratigraphiesQueryKey],
        });
      },
    },
  );
  const useDeleteChronostratigraphy = useMutation(
    async chronostratigraphyId => {
      return await fetchApiV2(`chronostratigraphy?id=${chronostratigraphyId}`, "DELETE");
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [chronostratigraphiesQueryKey],
        });
      },
    },
  );

  return {
    add: useAddChronostratigraphy,
    update: useUpdateChronostratigraphy,
    delete: useDeleteChronostratigraphy,
  };
};

export const lithostratigraphiesQueryKey = "lithostratigraphies";

export const useLithostratigraphies = stratigraphyID =>
  useQuery({
    queryKey: [lithostratigraphiesQueryKey, stratigraphyID],
    queryFn: async () => {
      return await fetchApiV2(`lithostratigraphy?stratigraphyId=${stratigraphyID}`, "GET");
    },
    enabled: !!stratigraphyID,
  });

export const useLithostratigraphyMutations = () => {
  const queryClient = useQueryClient();
  const useAddLithostratigraphy = useMutation(
    async lithostratigraphy => {
      return await fetchApiV2("lithostratigraphy", "POST", lithostratigraphy);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [lithostratigraphiesQueryKey],
        });
      },
    },
  );
  const useUpdateLithostratigraphy = useMutation(
    async lithostratigraphy => {
      return await fetchApiV2("lithostratigraphy", "PUT", lithostratigraphy);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [lithostratigraphiesQueryKey],
        });
      },
    },
  );
  const useDeleteLithostratigraphy = useMutation(
    async lithostratigraphyId => {
      return await fetchApiV2(`lithostratigraphy?id=${lithostratigraphyId}`, "DELETE");
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [lithostratigraphiesQueryKey],
        });
      },
    },
  );

  return {
    add: useAddLithostratigraphy,
    update: useUpdateLithostratigraphy,
    delete: useDeleteLithostratigraphy,
  };
};

export const geometryQueryKey = "boreholeGeometry";

export const useBoreholeGeometry = boreholeId =>
  useQuery({
    queryKey: [geometryQueryKey, boreholeId],
    queryFn: async () => {
      return await fetchApiV2(`boreholegeometry?boreholeId=${boreholeId}`, "GET");
    },
    enabled: !!boreholeId,
  });

export const getBoreholeGeometryFormats = async () => {
  return await fetchApiV2("boreholegeometry/geometryformats", "GET");
};

export const useBoreholeGeometryMutations = () => {
  const queryClient = useQueryClient();
  const useSetBoreholeGeometry = useMutation(
    async ({ boreholeId, formData }) => {
      return await upload(`boreholegeometry?boreholeId=${boreholeId}`, "POST", formData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [geometryQueryKey],
        });
      },
    },
  );
  const useDeleteBoreholeGeometry = useMutation(
    async boreholeId => {
      return await fetchApiV2(`boreholegeometry?boreholeId=${boreholeId}`, "DELETE");
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [geometryQueryKey],
        });
      },
    },
  );

  return {
    set: useSetBoreholeGeometry,
    delete: useDeleteBoreholeGeometry,
  };
};

export const getBoreholeGeometryDepthTVD = async (boreholeId, depthMD) => {
  return await fetchApiV2(`boreholegeometry/getDepthTVD?boreholeId=${boreholeId}&depthMD=${depthMD}`, "GET");
};

export const getWaterIngress = async boreholeId => {
  return await fetchApiV2(`wateringress?boreholeId=${boreholeId}`, "GET");
};

export const addWaterIngress = async wateringress => {
  return await fetchApiV2("wateringress", "POST", wateringress);
};

export const updateWaterIngress = async wateringress => {
  return await fetchApiV2("wateringress", "PUT", wateringress);
};

export const deleteWaterIngress = async id => {
  return await fetchApiV2(`wateringress?id=${id}`, "DELETE");
};

export const getGroundwaterLevelMeasurements = async boreholeId => {
  return await fetchApiV2(`groundwaterlevelmeasurement?boreholeId=${boreholeId}`, "GET");
};

export const addGroundwaterLevelMeasurement = async groundwaterLevelMeasurement => {
  return await fetchApiV2("groundwaterlevelmeasurement", "POST", groundwaterLevelMeasurement);
};

export const updateGroundwaterLevelMeasurement = async groundwaterLevelMeasurement => {
  return await fetchApiV2("groundwaterlevelmeasurement", "PUT", groundwaterLevelMeasurement);
};

export const deleteGroundwaterLevelMeasurement = async id => {
  return await fetchApiV2(`groundwaterlevelmeasurement?id=${id}`, "DELETE");
};

export const getFieldMeasurements = async boreholeId => {
  return await fetchApiV2(`fieldmeasurement?boreholeId=${boreholeId}`, "GET");
};

export const addFieldMeasurement = async fieldmeasurement => {
  return await fetchApiV2("fieldmeasurement", "POST", fieldmeasurement);
};

export const updateFieldMeasurement = async fieldmeasurement => {
  return await fetchApiV2("fieldmeasurement", "PUT", fieldmeasurement);
};

export const deleteFieldMeasurement = async id => {
  return await fetchApiV2(`fieldmeasurement?id=${id}`, "DELETE");
};

export const getCompletions = async boreholeId => {
  return await fetchApiV2(`completion?boreholeId=${boreholeId}`, "GET");
};

export const addCompletion = async completion => {
  return await fetchApiV2("completion", "POST", completion);
};

export const updateCompletion = async completion => {
  return await fetchApiV2("completion", "PUT", completion);
};

export const copyCompletion = async completionId => {
  return await fetchApiV2(`completion/copy?id=${completionId}`, "POST");
};

export const deleteCompletion = async id => {
  return await fetchApiV2(`completion?id=${id}`, "DELETE");
};

export const getHydrotests = async boreholeId => {
  return await fetchApiV2(`hydrotest?boreholeId=${boreholeId}`, "GET");
};

export const addHydrotest = async hydrotest => {
  return await fetchApiV2("hydrotest", "POST", hydrotest);
};

export const updateHydrotest = async hydrotest => {
  return await fetchApiV2("hydrotest", "PUT", hydrotest);
};

export const deleteHydrotest = async id => {
  return await fetchApiV2(`hydrotest?id=${id}`, "DELETE");
};

export const getInstrumentation = async completionId => {
  return await fetchApiV2(`instrumentation?completionId=${completionId}`, "GET");
};

export const addInstrumentation = async instrumentation => {
  return await fetchApiV2("instrumentation", "POST", instrumentation);
};

export const updateInstrumentation = async instrumentation => {
  return await fetchApiV2("instrumentation", "PUT", instrumentation);
};

export const deleteInstrumentation = async id => {
  return await fetchApiV2(`instrumentation?id=${id}`, "DELETE");
};

export const getBackfills = async completionId => {
  return await fetchApiV2(`backfill?completionId=${completionId}`, "GET");
};

export const addBackfill = async backfill => {
  return await fetchApiV2("backfill", "POST", backfill);
};

export const updateBackfill = async backfill => {
  return await fetchApiV2("backfill", "PUT", backfill);
};

export const deleteBackfill = async id => {
  return await fetchApiV2(`backfill?id=${id}`, "DELETE");
};

export const getCasings = async completionId => {
  return await fetchApiV2(`casing?completionId=${completionId}`, "GET");
};

export const getCasingsByBoreholeId = async boreholeId => {
  return await fetchApiV2(`casing?boreholeId=${boreholeId}`, "GET");
};

export const addCasing = async casing => {
  return await fetchApiV2("casing", "POST", casing);
};

export const updateCasing = async casing => {
  return await fetchApiV2("casing", "PUT", casing);
};

export const deleteCasing = async id => {
  return await fetchApiV2(`casing?id=${id}`, "DELETE");
};

export const getSectionsByBoreholeId = async boreholeId => {
  return await fetchApiV2(`section?boreholeId=${boreholeId}`, "GET");
};

export const addSection = async section => {
  return await fetchApiV2("section", "POST", section);
};

export const updateSection = async section => {
  return await fetchApiV2("section", "PUT", section);
};

export const deleteSection = async id => {
  return await fetchApiV2(`section?id=${id}`, "DELETE");
};

export const downloadCodelistCsv = () => download(`codelist/csv`);
