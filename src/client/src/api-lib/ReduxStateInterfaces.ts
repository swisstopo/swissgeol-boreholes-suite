import { GridRowSelectionModel } from "@mui/x-data-grid";
import { ReferenceSystemCode } from "../pages/detail/form/location/coordinateSegmentInterfaces.ts";

export interface ReduxRootState {
  core_workflow: Workflow;
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
  efilter: { [key: string]: string };
  map: {
    explorer: string;
  };
}

export interface Filters {
  filter: Record<string, unknown>;
}
export interface EditorStore {
  mselected: number[];
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
  admin: boolean;
}

export interface Workgroup {
  disabled: null;
  id: number;
  workgroup: string;
  roles: Role[];
}

export interface Workflow {
  id: number;
  started: string;
  finished: string;
  role: Role;
  username: string;
  workflow: number;
}

export interface Identifier {
  id: number;
  identifier: string;
  value: string;
}

export interface BoreholeAttributes {
  borehole_type: number | null;
  updater: string;
  national_interest: boolean;
  restriction_until: Date;
  restriction: number;
  workgroup: Workgroup;
  workflow: Workflow;
  id: number;
  spatial_reference_system: ReferenceSystemCode;
  role: Role;
  lock: {
    id: number;
  } | null;
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
  location: string;
  total_depth: number;
  precision_location_y_lv03: number;
  custom: {
    chronostratigraphy_top_bedrock: number;
    lithostratigraphy_top_bedrock: number;
    lithology_top_bedrock: number;
    qt_depth: number;
    top_bedrock_weathered_md: number;
    remarks: string | undefined;
    identifiers: Identifier[];
    country: string;
    canton: string;
    municipality: string;
    project_name: string;
    alternate_name: string;
  };
  extended: {
    groundwater: boolean;
    top_bedrock_fresh_md: number;
    status: number;
    purpose: number;
    original_name: string;
  };
}

export interface Boreholes {
  filtered_borehole_ids: GridRowSelectionModel;
  limit: number;
  isFetching: boolean;
  length: number;
  orderby: string;
  direction: string;
  page: number;
  data: BoreholeAttributes[];
}

export interface Borehole {
  error: string;
  isFetching: boolean;
  length: number;
  orderby: string;
  direction: string;
  data: BoreholeAttributes;
}
