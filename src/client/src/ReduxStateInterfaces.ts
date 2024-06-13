export interface ReduxRootState {
  core_user: User;
  core_borehole_editor_list: Boreholes;
}

export interface User {
  data: UserData;
}

export interface UserData {
  // Incomplete type definition, add other properties as needed
  workgroups: Workgroup[];
  roles: string[];
  id: number;
  name: string;
  username: string;
}

export interface Workgroup {
  supplier: boolean;
  disabled: null;
  id: number;
  workgroup: string;
  roles: string[];
}

export interface Borehole {
  // Incomplete type definition, add other properties as needed
  data: {
    id: number;
    spatial_reference_system: number;
    role: string;
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
    extended: {
      original_name: string;
    };
  };
}

export interface Boreholes {
  isFetching: boolean;
  length: number;
}
