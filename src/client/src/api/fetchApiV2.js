import store from "../reducers";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { getAuthorizationHeader } from "./authentication";

/**
 * Fetch data from the C# Api.
 * @param {*} url The resource url.
 * @param {*} method The HTTP request method to apply (e.g. GET, PUT, POST...).
 * @param {*} payload The payload of the HTTP request (optional).
 * @param {*} isFileUpload Boolean indicating whether the request is used to upload a file, defaults to false.
 * @returns The HTTP response as JSON.
 */

export async function fetchApiV2(
  url,
  method,
  payload = null,
  isFileUpload = false,
  isFileDownload = false,
) {
  const baseUrl = "/api/v2/";
  const authentication = store.getState().core_user.authentication;
  const body = isFileUpload ? payload : JSON.stringify(payload);
  let headers = {
    Authorization: getAuthorizationHeader(authentication),
  };
  if (!isFileUpload && !isFileDownload)
    headers = { ...headers, "Content-Type": "application/json" };
  const response = await fetch(baseUrl + url, {
    method: method,
    cache: "no-cache",
    credentials: "same-origin",
    headers: headers,
    body: payload && body,
  });
  if (isFileUpload) {
    return response;
  }
  if (isFileDownload) {
    if (!response.ok) {
      const error = new Error(response.statusText);
      error.response = response;
      throw error;
    }

    const fileName =
      response.headers
        .get("content-disposition")
        ?.split("; ")[1]
        ?.replace("filename=", "") ?? "export.pdf";
    const blob = await response.blob();
    const downLoadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downLoadUrl;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    return response;
  }

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

// boreholes
export const importBoreholes = async (workgroupId, combinedFormData) => {
  return await fetchApiV2(
    `upload?workgroupId=${workgroupId}`,
    "POST",
    combinedFormData,
    true,
  );
};

export const copyBorehole = async (boreholeId, workgroupId) => {
  return await fetchApiV2(
    `borehole/copy?id=${boreholeId}&workgroupId=${workgroupId}`,
    "POST",
  );
};

// layers
export const fetchLayerById = async id =>
  await fetchApiV2(`layer/${id}`, "GET");

export const fetchLayersByProfileId = async profileId =>
  await fetchApiV2(`layer?profileId=${profileId}`, "GET");

export const updateLayer = async layer => {
  // remove derived objects
  delete layer.createdBy;
  delete layer.updatedBy;
  return await fetchApiV2("layer", "PUT", layer);
};

// codelists
export const fetchAllCodeLists = async () =>
  await fetchApiV2("codelist", "GET");

export const updateCodeLists = async codelist =>
  await fetchApiV2("codelist", "PUT", codelist);

// casings
export const fetchCasingsByBoreholeId = async boreholeId => {
  const kindId = 3002; // casing kind
  return await fetchApiV2(
    `stratigraphy?kindId=${kindId}&boreholeId=${boreholeId}`,
    "GET",
  );
};

// lithological descriptions
export const fetchLithologicalDescriptionsByProfileId = async profileId => {
  return await fetchApiV2(
    `lithologicaldescription?stratigraphyId=${profileId}`,
    "GET",
  );
};

export const addLithologicalDescription = async lithologicalDescription => {
  return await fetchApiV2(
    "lithologicaldescription",
    "POST",
    lithologicalDescription,
  );
};

export const updateLithologicalDescription = async lithologicalDescription => {
  return await fetchApiV2(
    "lithologicaldescription",
    "PUT",
    lithologicalDescription,
  );
};

export const deleteLithologicalDescription = async id => {
  return await fetchApiV2(`lithologicaldescription?id=${id}`, "DELETE");
};

// facies descriptions
export const fetchFaciesDescriptionsByProfileId = async profileId => {
  return await fetchApiV2(
    `faciesdescription?stratigraphyId=${profileId}`,
    "GET",
  );
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

export const fetchUsers = async () => await fetchApiV2("user", "GET");

// stratigraphy
export const copyStratigraphy = async id => {
  return await fetchApiV2(`stratigraphy/copy?id=${id}`, "POST");
};

export const deleteStratigraphy = async id => {
  return await fetchApiV2(`stratigraphy?id=${id}`, "DELETE");
};

export const createStratigraphy = async (boreholeId, kindId) => {
  return await fetchApiV2("stratigraphy", "POST", {
    boreholeId: boreholeId,
    kindId: kindId,
  });
};

export const addBedrock = async id => {
  return await fetchApiV2(`stratigraphy/addbedrock?id=${id}`, "POST");
};

// Enable using react-query outputs across the application.

// eslint-disable-next-line react-hooks/rules-of-hooks
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
    queryFn: () =>
      fetchLithologicalDescriptionsByProfileId(selectedStratigraphyID),
  });

export const faciesDescriptionQueryKey = "faciesDesc";

export const useFaciesDescription = selectedStratigraphyID =>
  useQuery({
    queryKey: [faciesDescriptionQueryKey, selectedStratigraphyID],
    queryFn: () => fetchFaciesDescriptionsByProfileId(selectedStratigraphyID),
  });

export const casingKey = "casings";

export const useCasings = boreholeId =>
  useQuery([casingKey, boreholeId], () => {
    return fetchCasingsByBoreholeId(boreholeId);
  });

export const useLithologyStratigraphies = boreholeId => {
  const kindId = 3000; // stratigraphy
  return useQuery({
    queryKey: ["lithologyStratigraphies", boreholeId],
    queryFn: async () => {
      return await fetchApiV2(
        `stratigraphy?kindId=${kindId}&boreholeId=${boreholeId}`,
        "GET",
      );
    },
  });
};

export const chronostratigraphiesQueryKey = "chronostratigraphies";

export const useChronostratigraphies = stratigraphyID =>
  useQuery({
    queryKey: [chronostratigraphiesQueryKey, stratigraphyID],
    queryFn: async () => {
      return await fetchApiV2(
        `chronostratigraphy?stratigraphyId=${stratigraphyID}`,
        "GET",
      );
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
      return await fetchApiV2(
        `chronostratigraphy?id=${chronostratigraphyId}`,
        "DELETE",
      );
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
      return await fetchApiV2(
        `lithostratigraphy?stratigraphyId=${stratigraphyID}`,
        "GET",
      );
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
      return await fetchApiV2(
        `lithostratigraphy?id=${lithostratigraphyId}`,
        "DELETE",
      );
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

export const waterIngressQueryKey = "wateringresses";

export const useWaterIngresses = boreholeId =>
  useQuery({
    queryKey: [waterIngressQueryKey, boreholeId],
    queryFn: async () => {
      return await fetchApiV2(`wateringress?boreholeId=${boreholeId}`, "GET");
    },
  });

export const useWaterIngressMutations = () => {
  const queryClient = useQueryClient();
  const useAddWaterIngress = useMutation(
    async waterIngress => {
      return await fetchApiV2("wateringress", "POST", waterIngress);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [waterIngressQueryKey],
        });
      },
    },
  );
  const useUpdateWaterIngress = useMutation(
    async waterIngress => {
      return await fetchApiV2("wateringress", "PUT", waterIngress);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [waterIngressQueryKey],
        });
      },
    },
  );
  const useDeleteWaterIngress = useMutation(
    async waterIngressId => {
      return await fetchApiV2(`wateringress?id=${waterIngressId}`, "DELETE");
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [waterIngressQueryKey],
        });
      },
    },
  );
  return {
    add: useAddWaterIngress,
    update: useUpdateWaterIngress,
    delete: useDeleteWaterIngress,
  };
};

export const groundwaterLevelMeasurementsQueryKey =
  "groundwaterLevelMeasurements";

export const useGroundwaterLevelMeasurements = boreholeId =>
  useQuery({
    queryKey: [groundwaterLevelMeasurementsQueryKey, boreholeId],
    queryFn: async () => {
      return await fetchApiV2(
        `groundwaterlevelmeasurement?boreholeId=${boreholeId}`,
        "GET",
      );
    },
  });

export const useGroundwaterLevelMeasurementMutations = () => {
  const queryClient = useQueryClient();
  const useAddGroundwaterLevelMeasurement = useMutation(
    async groundwaterLevelMeasurement => {
      return await fetchApiV2(
        "groundwaterlevelmeasurement",
        "POST",
        groundwaterLevelMeasurement,
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [groundwaterLevelMeasurementsQueryKey],
        });
      },
    },
  );
  const useUpdateGroundwaterLevelMeasurement = useMutation(
    async groundwaterLevelMeasurement => {
      return await fetchApiV2(
        "groundwaterlevelmeasurement",
        "PUT",
        groundwaterLevelMeasurement,
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [groundwaterLevelMeasurementsQueryKey],
        });
      },
    },
  );
  const useDeleteGroundwaterLevelMeasurement = useMutation(
    async groundwaterLevelMeasurementId => {
      return await fetchApiV2(
        `groundwaterlevelmeasurement?id=${groundwaterLevelMeasurementId}`,
        "DELETE",
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [groundwaterLevelMeasurementsQueryKey],
        });
      },
    },
  );

  return {
    add: useAddGroundwaterLevelMeasurement,
    update: useUpdateGroundwaterLevelMeasurement,
    delete: useDeleteGroundwaterLevelMeasurement,
  };
};

export const fieldMeasurementsQueryKey = "fieldMeasurements";

export const useFieldMeasurements = boreholeId =>
  useQuery({
    queryKey: [fieldMeasurementsQueryKey, boreholeId],
    queryFn: async () => {
      return await fetchApiV2(
        `fieldmeasurement?boreholeId=${boreholeId}`,
        "GET",
      );
    },
  });

export const useFieldMeasurementMutations = () => {
  const queryClient = useQueryClient();
  const useAddFieldMeasurement = useMutation(
    async fieldMeasurement => {
      return await fetchApiV2("fieldmeasurement", "POST", fieldMeasurement);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [fieldMeasurementsQueryKey],
        });
      },
    },
  );
  const useUpdateFieldMeasurement = useMutation(
    async fieldMeasurement => {
      return await fetchApiV2("fieldmeasurement", "PUT", fieldMeasurement);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [fieldMeasurementsQueryKey],
        });
      },
    },
  );
  const useDeleteFieldMeasurement = useMutation(
    async fieldMeasurementId => {
      return await fetchApiV2(
        `fieldmeasurement?id=${fieldMeasurementId}`,
        "DELETE",
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [fieldMeasurementsQueryKey],
        });
      },
    },
  );

  return {
    add: useAddFieldMeasurement,
    update: useUpdateFieldMeasurement,
    delete: useDeleteFieldMeasurement,
  };
};

// Upload borehole attachment
export const uploadBoreholeAttachment = async (boreholeId, attachment) => {
  return await fetchApiV2(
    `boreholefile/upload?boreholeId=${boreholeId}`,
    "POST",
    attachment,
    true,
  );
};

// Detach borehole attachment
export const detachBoreholeAttachment = async (boreholeId, boreholeFileId) => {
  return await fetchApiV2(
    `boreholefile/detachFile?boreholeId=${boreholeId}&boreholeFileId=${boreholeFileId}`,
    "POST",
  );
};

// Get borehole attachment list
export const getBoreholeAttachments = async boreholeId => {
  return await fetchApiV2(
    `boreholefile/getAllForBorehole?boreholeId=${boreholeId}`,
    "GET",
  );
};

// Download borehole attachment
export const downloadBoreholeAttachment = async boreholeFileId => {
  return await fetchApiV2(
    `boreholefile/download?boreholeFileId=${boreholeFileId}`,
    "GET",
    null,
    false,
    true,
  );
};

// Update borehole attachment
export const updateBoreholeAttachment = async (
  boreholeId,
  fileId,
  description,
  isPublic,
) => {
  return await fetchApiV2(
    `boreholefile/update?boreholeId=${boreholeId}&boreholeFileId=${fileId}`,
    "PUT",
    {
      description: description,
      public: isPublic,
    },
    false,
  );
};

export const hydrotestQueryKey = "hydrotests";

export const useHydrotests = boreholeId =>
  useQuery({
    queryKey: [hydrotestQueryKey, boreholeId],
    queryFn: async () => {
      return await fetchApiV2(`hydrotest?boreholeId=${boreholeId}`, "GET");
    },
  });

export const useHydrotestMutations = () => {
  const queryClient = useQueryClient();
  const useAddHydrotests = useMutation(
    async hydrotest => {
      return await fetchApiV2("hydrotest", "POST", hydrotest);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [hydrotestQueryKey],
        });
      },
    },
  );
  const useUpdateHydrotests = useMutation(
    async hydrotest => {
      return await fetchApiV2("hydrotest", "PUT", hydrotest);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [hydrotestQueryKey],
        });
      },
    },
  );
  const useDeleteHydrotests = useMutation(
    async hydrotestId => {
      return await fetchApiV2(`hydrotest?id=${hydrotestId}`, "DELETE");
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [hydrotestQueryKey],
        });
      },
    },
  );

  return {
    add: useAddHydrotests,
    update: useUpdateHydrotests,
    delete: useDeleteHydrotests,
  };
};

export const downloadCodelistCsv = () =>
  fetchApiV2(`codelist/csv`, "GET", null, false, true);
