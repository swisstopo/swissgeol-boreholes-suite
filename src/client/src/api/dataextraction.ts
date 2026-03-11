import { User } from "../api-lib/ReduxStateInterfaces.ts";
import store from "../reducers";
import { getAuthorizationHeader } from "./authentication.ts";

export async function fetchCreatePngs(fileName: string): Promise<Response> {
  const reduxUser: User = store.getState().core_user as User;
  return await fetch("/dataextraction/api/V1/create_pngs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthorizationHeader(reduxUser.authentication),
    },
    body: JSON.stringify({ filename: fileName }),
  });
}

export async function fetchPageBoundingBoxes(fileName: string, pageNumber: number): Promise<Response> {
  const reduxUser: User = store.getState().core_user as User;
  return await fetch("/dataextraction/api/V1/bounding_boxes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthorizationHeader(reduxUser.authentication),
    },
    body: JSON.stringify({ filename: fileName, page_number: pageNumber }),
  });
}

export async function fetchExtractData(request: unknown, abortSignal: AbortSignal): Promise<Response> {
  const reduxUser: User = store.getState().core_user as User;
  return await fetch("/dataextraction/api/V1/extract_data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: getAuthorizationHeader(reduxUser.authentication),
    },
    body: JSON.stringify(request),
    signal: abortSignal,
  });
}

export async function fetchExtractStratigraphy(fileName: string, abortSignal: AbortSignal): Promise<Response> {
  const reduxUser: User = store.getState().core_user as User;
  return await fetch("/dataextraction/api/V1/extract_stratigraphy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: getAuthorizationHeader(reduxUser.authentication),
    },
    body: JSON.stringify({ filename: fileName }),
    signal: abortSignal,
  });
}
