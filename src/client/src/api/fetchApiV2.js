import store from "../reducers";
import { useQuery } from "react-query";

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
  return await fetchApiV2(`layer`, "PUT", layer);
};

// codelists
export const fetchAllCodeLists = async () =>
  await fetchApiV2(`codelist`, "GET");

export const updateCodeLists = async codelist =>
  await fetchApiV2(`codelist`, "PUT", codelist);

// lithological descriptions
export const fetchLithologicalDescriptionsByProfileId = async profileId => {
  return await fetchApiV2(
    `lithologicaldescription?stratigraphyId=${profileId}`,
    "GET",
  );
};

export const addLithologicalDescription = async lithologicalDescription => {
  return await fetchApiV2(
    `lithologicaldescription`,
    "POST",
    lithologicalDescription,
  );
};

export const updateLithologicalDescription = async lithologicalDescription => {
  return await fetchApiV2(
    `lithologicaldescription`,
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
  return await fetchApiV2(`faciesdescription`, "POST", faciesDescription);
};

export const updateFaciesDescription = async faciesDescription => {
  return await fetchApiV2(`faciesdescription`, "PUT", faciesDescription);
};

export const deleteFaciesDescription = async id => {
  return await fetchApiV2(`faciesdescription?id=${id}`, "DELETE");
};

// Enable using react-query outputs across the application.

// eslint-disable-next-line react-hooks/rules-of-hooks
export const useDomains = () =>
  useQuery("domains", () => {
    const domains = fetchApiV2(`codelist`, "GET");
    return domains;
  });

export const useLayers = profileId =>
  useQuery(["layers", profileId], () => {
    return fetchLayersByProfileId(profileId);
  });

export const useLithoDescription = selectedStratigraphyID =>
  useQuery({
    queryKey: ["lithoDesc", selectedStratigraphyID],
    queryFn: () =>
      fetchLithologicalDescriptionsByProfileId(selectedStratigraphyID),
  });

export const useFaciesDescription = selectedStratigraphyID =>
  useQuery({
    queryKey: ["faciesDesc", selectedStratigraphyID],
    queryFn: () => fetchFaciesDescriptionsByProfileId(selectedStratigraphyID),
  });
