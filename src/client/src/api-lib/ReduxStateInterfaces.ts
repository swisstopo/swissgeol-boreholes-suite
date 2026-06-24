export interface ReduxRootState {
  editor: EditorStore;
  core_user: User;
}

export interface EditorStore {
  mselected: number[];
}

export interface User {
  authentication: {
    token_type: string;
    access_token: string;
  } | null;
}
