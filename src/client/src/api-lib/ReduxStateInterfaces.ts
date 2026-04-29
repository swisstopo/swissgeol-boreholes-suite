export interface ReduxRootState {
  editor: EditorStore;
  setting: Setting;
  core_user: User;
}

export interface Setting {
  data: {
    map: {
      explorer: string;
    };
  };
}

export interface EditorStore {
  mselected: number[];
}

type Role = "PUBLIC" | "VIEW" | "VALID" | "EDIT" | "CONTROL";

export interface User {
  data: UserData;
  authentication: {
    token_type: string;
    access_token: string;
  };
}

export interface UserData {
  // Incomplete type definition, add other properties as needed
  workgroups: Workgroup[];
  roles: Role[];
  id: number;
  name: string;
  username: string;
  admin: boolean;
}

export interface Workgroup {
  disabled: null;
  id: number;
  workgroup: string;
  roles: Role[];
}
