export function getAuthorizationHeader(authentication) {
  return authentication === null ? "Anonymous" : `${authentication.token_type} ${authentication.id_token}`;
}
