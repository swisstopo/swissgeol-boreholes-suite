import type { LayerConfig } from "../components/map/map";

export interface ReduxRootState {
  editor: EditorStore;
  setting: Setting;
  core_user: User;
}

export interface Setting {
  data: {
    map: {
      explorer: Record<string, LayerConfig>;
    };
  };
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
