import {
  CoordinateLimits,
  FieldNameDirectionKeys,
  ReferenceSystem,
  ReferenceSystemCode,
  ReferenceSystemKey,
} from "./coordinateSegmentInterfaces.ts";

export const webApilv95tolv03 = "https://geodesy.geo.admin.ch/reframe/lv95tolv03";
export const webApilv03tolv95 = "https://geodesy.geo.admin.ch/reframe/lv03tolv95";

// --- Constants ---

// bounding box for Switzerland
export const boundingBox: CoordinateLimits = {
  LV95: {
    X: { Min: 2485869.5728, Max: 2837076.5648 },
    Y: { Min: 1076443.1884, Max: 1299941.7864 },
  },
  LV03: {
    X: { Min: 485870.0968, Max: 837076.3921 },
    Y: { Min: 76442.8707, Max: 299941.9083 },
  },
};

export const referenceSystems: { [key: string]: ReferenceSystem } = {
  LV95: {
    code: ReferenceSystemCode.LV95,
    name: ReferenceSystemKey.LV95,
    fieldName: { X: FieldNameDirectionKeys.locationX, Y: FieldNameDirectionKeys.locationY },
  },
  LV03: {
    code: ReferenceSystemCode.LV03,
    name: ReferenceSystemKey.LV03,
    fieldName: { X: FieldNameDirectionKeys.locationXLV03, Y: FieldNameDirectionKeys.locationYLV03 },
  },
};

export const defaultHrsId = 20106001;
