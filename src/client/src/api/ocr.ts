import store from "../reducers";
import { getAuthorizationHeader } from "./authentication";

export async function processFile(request: object) {
  return await fetch("/ocr/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: getAuthorizationHeader(store.getState().core_user.authentication),
    },
    body: JSON.stringify(request),
  });
}
