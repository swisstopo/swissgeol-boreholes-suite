export function getAuthorizationHeader(authentication: { token_type: string; id_token: string }) {
  return authentication === null ? "Anonymous" : `${authentication.token_type} ${authentication.id_token}`;
}
