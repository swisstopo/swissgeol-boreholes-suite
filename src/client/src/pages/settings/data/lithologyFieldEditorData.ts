import { SettingsItem } from "./SettingsItem.ts";

const fields = [
  "layer_last",
  "completeness",
  "lithology",
  "original_lithology",
  "uscs_original",
  "uscs_determination",
  "uscs_1",
  "grain_size_1",
  "uscs_2",
  "grain_size_2",
  "uscs_3",
  "grain_shape",
  "grain_granularity",
  "organic_component",
  "debris",
  "layer_lithology_top_bedrock",
  "striae",
  "color",
  "consistance",
  "plasticity",
  "compactness",
  "cohesion",
  "gradation",
  "humidity",
  "alteration",
  "notes",
];

export const lithologyFieldEditorData: SettingsItem[] = fields.map((field, index) => ({
  id: index,
  label: field,
  value: field === "completeness" ? "description_quality" : field,
}));
