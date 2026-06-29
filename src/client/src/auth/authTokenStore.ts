interface AuthToken {
  token_type: string;
  access_token: string;
}

let currentToken: AuthToken | null = null;

export function setAuthToken(token: AuthToken): void {
  currentToken = token;
}

export function clearAuthToken(): void {
  currentToken = null;
}

export function getAuthToken(): AuthToken | null {
  return currentToken;
}
