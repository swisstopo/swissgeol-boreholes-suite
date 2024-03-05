interface Borehole {
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
  };
}
