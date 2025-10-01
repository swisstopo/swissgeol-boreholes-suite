import { SettingsItem } from "./SettingsItem.ts";

const fields = [
  { label: "borehole_type" },
  { label: "purpose", prefix: "extended" },
  { label: "boreholestatus", prefix: "extended" },
  { label: "totaldepth", value: "length" },
  { label: "top_bedrock_fresh_md", prefix: "extended" },
  { label: "qt_depth" },
  { label: "top_bedrock_weathered_md" },
  { label: "groundwater", prefix: "extended" },
  /// Todo: Reactivate when filters are migrated to new API
  // { label: "lithology_top_bedrock", prefix: "custom", value: "lit_pet_top_bedrock" },
  // { label: "lithostratigraphy_top_bedrock", prefix: "custom", value: "lit_str_top_bedrock" },
  // { label: "chronostratigraphy_top_bedrock", prefix: "custom", value: "chro_str_top_bedrock" },
];

export const boreholeEditorData: SettingsItem[] = fields.map((field, index) => ({
  id: index,
  label: field.label,
  value: field.value ?? (field.prefix ? `${field.prefix}.${field.label}` : field.label),
}));
