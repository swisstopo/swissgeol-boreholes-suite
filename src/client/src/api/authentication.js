export function getAuthorizationHeader(authentication) {
  // Bypass authentication in anonymous mode.
  const env = import.meta.env;
  if (env.VITE_ANONYMOUS_MODE_ENABLED === "true") {
    return "ANONYMOUS";
  } else {
    return `${authentication.token_type} ${authentication.id_token}`;
  }
}
