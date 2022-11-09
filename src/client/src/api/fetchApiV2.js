import store from "../reducers";

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
