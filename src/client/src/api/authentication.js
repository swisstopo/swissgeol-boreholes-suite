export function getAuthorizationHeader(authentication) {
  return `${authentication.token_type} ${authentication.id_token}`;
}
