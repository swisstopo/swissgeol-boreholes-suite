export interface ReduxRootState {
  core_user: User;
}

export interface User {
  authentication: {
    token_type: string;
    access_token: string;
  } | null;
}
