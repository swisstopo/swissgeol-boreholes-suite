import store from "../reducers";
import { getAuthorizationHeader } from "./authentication";

export async function fetchCreatePngs(fileName) {
  return await fetch("dataextraction/api/V1/create_pngs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthorizationHeader(store.getState().core_user.authentication),
    },
    body: JSON.stringify({ filename: fileName + ".pdf" }),
  });
}

export async function fetchExtractData(request, abortSignal) {
  return await fetch("dataextraction/api/V1/extract_data", {
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
