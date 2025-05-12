import { store } from "../api-lib";
import { getAuthorizationHeader } from "./authentication";

export async function processFile(request: object) {
  // @ts-expect-error redux store will not be typed, as it's going to be removed
  const authentication = store.getState().core_user.authentication;
  const headers: Record<string, string> = {
    Authorization: getAuthorizationHeader(authentication),
    "Content-Type": "application/json",
  };

  return await fetch("/ocr", {
    method: "POST",
    credentials: "same-origin",
    headers: headers,
    body: JSON.stringify(request),
  });
}
