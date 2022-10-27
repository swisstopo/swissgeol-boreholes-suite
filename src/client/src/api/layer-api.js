import store from "../reducers";

export async function fetchLayers(profileId) {
  const credentials = store.getState().core_user.authentication;
  const response = await fetch(`/api/v2/layer?profileId=${profileId}`, {
    method: "GET",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(
        `${credentials.username}:${credentials.password}`,
      )}`,
    },
  });
  if (response.ok) {
    return await response.json();
  }
}

export async function fetchLayerById(id) {
  const credentials = store.getState().core_user.authentication;
  const response = await fetch(`/api/v2/layer/${id}`, {
    method: "GET",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(
        `${credentials.username}:${credentials.password}`,
      )}`,
    },
  });
  if (response.ok) {
    return await response.json();
  }
}

export const updateLayer = async layer => {
  const credentials = store.getState().core_user.authentication;
  // remove derived objects
  delete layer.createdBy;
  delete layer.updatedBy;
  const response = await fetch("/api/v2/layer", {
    method: "PUT",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(
        `${credentials.username}:${credentials.password}`,
      )}`,
    },
    body: JSON.stringify(layer),
  });
  return await response.json();
};
