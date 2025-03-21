import { SettingsItem } from "./SettingsItem.ts";

const fields = [
  { label: "borehole_identifier", prefix: "custom" },
  { label: "original_name", prefix: "extended" },
  { label: "project_name", prefix: "custom" },
  { label: "alternate_name", prefix: "custom" },
  { label: "restriction" },
  { label: "restriction_until" },
  { label: "national_interest" },
  { label: "elevation_z" },
  { label: "reference_elevation" },
  { label: "reference_elevation_type" },
  { label: "location_precision" },
  { label: "elevation_precision" },
  { label: "reference_elevation_qt" },
  { label: "canton", prefix: "custom" },
  { label: "spatial_reference_system" },
];

export const locationEditorData: SettingsItem[] = fields.map((field, index) => ({
  id: index,
  label: field.label,
  value: field.prefix ? `${field.prefix}.${field.label}` : field.label,
}));
