export interface ReduxRootState {
  filters: Filters;
  editor: EditorStore;
  setting: Setting;
  core_user: User;
  core_borehole_editor_list: Boreholes;
  core_borehole: Borehole;
}

export interface Setting {
  data: SettingData;
}

export interface SettingData {
  map: {
    explorer: string;
  };
}
export interface Filters {
  filter: string;
}

export interface EditorStore {
  mselected: string;
}

export type Role = "PUBLIC" | "VIEW" | "VALID" | "EDIT" | "CONTROL";

export interface User {
  data: UserData;
}

export interface UserData {
  // Incomplete type definition, add other properties as needed
  workgroups: Workgroup[];
  roles: Role[];
  id: number;
  name: string;
  username: string;
}

export interface Workgroup {
  disabled: null;
  id: number;
  workgroup: string;
  roles: Role[];
}

interface Workflow {
  started: string;
  finished: string;
  role: Role;
  username: string;
  workflow: number;
}

interface BoreholeAttributes {
  workgroup: Workgroup;
  workflow: Workflow;
  id: number;
  spatial_reference_system: number;
  role: Role;
  lock: {
    id: number;
  };
  location_precision: number;
  reference_elevation: number;
  height_reference_system: number;
  reference_elevation_type: number;
  qt_reference_elevation: number;
  elevation_precision: number;
  elevation_z: number;
  location_x: number;
  location_y: number;
  location_x_lv03: number;
  location_y_lv03: number;
  precision_location_x: number;
  precision_location_y: number;
  precision_location_x_lv03: number;
  precision_location_y_lv03: number;
  custom: {
    country: string;
    canton: string;
    municipality: string;
    project_name: string;
    alternate_name: string;
  };
  extended: {
    original_name: string;
  };
}

export interface Boreholes {
  limit: number;
  isFetching: boolean;
  length: number;
  orderby: string;
  direction: string;
  page: number;
  data: BoreholeAttributes[];
}

export interface Borehole {
  isFetching: boolean;
  length: number;
  orderby: string;
  direction: string;
  data: BoreholeAttributes;
}
