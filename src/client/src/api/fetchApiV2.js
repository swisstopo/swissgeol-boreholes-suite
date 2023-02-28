import store from "../reducers";
import { useQuery, useMutation, useQueryClient } from "react-query";

/**
 * Fetch data from the C# Api.
 * @param {*} url The resource url.
 * @param {*} method The HTTP request method to apply (e.g. GET, PUT, POST...).
 * @param {*} payload The payload of the HTTP request (optional).
 * @returns The HTTP response as JSON.
 */

export async function fetchApiV2(url, method, payload = null) {
  const baseUrl = "/api/v2/";
  const credentials = store.getState().core_user.authentication;
  const response = await fetch(baseUrl + url, {
    method: method,
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(
        `${credentials.username}:${credentials.password}`,
      )}`,
    },
    body: payload && JSON.stringify(payload),
  });
  if (response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
    } else {
      return await response.text();
    }
  }
}

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

export const layerQueryKey = "layers";

export const useLayers = profileId =>
  useQuery([layerQueryKey, profileId], () => {
    return fetchLayersByProfileId(profileId);
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
  });

export const useChronostratigraphyMutations = () => {
  const queryClient = useQueryClient();
  const useAddChronostratigraphy = useMutation(
    async chronostratigraphy => {
      return await fetchApiV2(`chronostratigraphy`, "POST", chronostratigraphy);
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
      return await fetchApiV2(`chronostratigraphy`, "PUT", chronostratigraphy);
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
