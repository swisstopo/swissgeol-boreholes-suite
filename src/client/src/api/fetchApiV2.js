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
    return await response.json();
  }
}

export async function fetchLayerById(id) {
  return await fetchApiV2(`layer/${id}`, "GET");
}

export async function fetchLayersByProfileId(profileId) {
  return await fetchApiV2(`layer?profileId=${profileId}`, "GET");
}

export const fetchAllCodeLists = async () => {
  return await fetchApiV2(`codelist`, "GET");
};

export const updateCodeLists = async codelist => {
  return await fetchApiV2("codelist", "PUT", codelist);
};

export async function updateLayer(layer) {
  // remove derived objects
  delete layer.createdBy;
  delete layer.updatedBy;
  return await fetchApiV2(`layer`, "PUT", layer);
}

// Enable using react-query outputs across the application.

// eslint-disable-next-line react-hooks/rules-of-hooks
export const useDomains = () =>
  useQuery("domains", async () => {
    const domains = fetchApiV2(`codelist`, "GET");
    return domains;
  });
