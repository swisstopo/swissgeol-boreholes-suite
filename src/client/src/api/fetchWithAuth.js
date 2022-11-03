import store from "../reducers";

export async function fetchWithAuth(url, method, payload = null) {
  const credentials = store.getState().core_user.authentication;
  const response = await fetch(url, {
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
