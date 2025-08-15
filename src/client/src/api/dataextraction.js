import store from "../reducers";
import { getAuthorizationHeader } from "./authentication";

export async function fetchCreatePngs(fileName) {
  return await fetch("/dataextraction/api/V1/create_pngs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthorizationHeader(store.getState().core_user.authentication),
    },
    body: JSON.stringify({ filename: fileName + ".pdf" }),
  });
}

export async function fetchPageBoundingBoxes(fileName, pageNumber) {
  return await fetch("/dataextraction/api/V1/bounding_boxes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthorizationHeader(store.getState().core_user.authentication),
    },
    body: JSON.stringify({ filename: fileName, page_number: pageNumber }),
  });
}

export async function fetchExtractData(request, abortSignal) {
  return await fetch("/dataextraction/api/V1/extract_data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: getAuthorizationHeader(store.getState().core_user.authentication),
    },
    body: JSON.stringify(request),
    signal: abortSignal,
  });
}

export async function fetchExtractStratigraphy(fileName, abortSignal) {
  return await fetch("/dataextraction/api/V1/extract_stratigraphy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: getAuthorizationHeader(store.getState().core_user.authentication),
    },
    body: JSON.stringify({ filename: fileName }),
    signal: abortSignal,
  });
}
