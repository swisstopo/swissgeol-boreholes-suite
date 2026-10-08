import { getAuthToken } from "../auth/authTokenStore.ts";

export function getAuthorizationHeader(authentication: { token_type: string; access_token: string }) {
  return `${authentication.token_type} ${authentication.access_token}`;
}

// No header in anonymous mode: a basic auth proxy in front of the app rejects any other value.
export function getAuthorizationHeaders(): Record<string, string> {
  const authentication = getAuthToken();
  return authentication === null ? {} : { Authorization: getAuthorizationHeader(authentication) };
}
