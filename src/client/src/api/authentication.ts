export function getAuthorizationHeader(authentication: { token_type: string; access_token: string } | null) {
  return authentication === null ? "Anonymous" : `${authentication.token_type} ${authentication.access_token}`;
}
