import { SettingsItem } from "./SettingsItem.ts";

const fields = [
  { label: "fromdepth", value: "layer.depth_from" },
  { label: "todepth", value: "layer.depth_to" },
  { label: "completeness", value: "layer.description_quality" },
  { label: "lithology", value: "layer.lithology" },
  { label: "original_lithology", value: "original_lithology" },
  { label: "uscs_original", value: "layer.uscs_original" },
  { label: "uscs_determination", value: "layer.uscs_determination" },
  { label: "uscs_1", value: "layer.uscs_1" },
  { label: "grain_size_1", value: "layer.grain_size_1" },
  { label: "uscs_2", value: "layer.uscs_2" },
  { label: "grain_size_2", value: "layer.grain_size_2" },
  { label: "uscs_3", value: "layer.uscs_3" },
  { label: "grain_shape", value: "layer.grain_shape" },
  { label: "grain_granularity", value: "layer.grain_granularity" },
  { label: "organic_component", value: "layer.organic_component" },
  { label: "debris", value: "layer.debris" },
  { label: "layer_lithology_top_bedrock", value: "layer.lithology_top_bedrock" },
  { label: "striae", value: "layer.striae" },
  { label: "color", value: "layer.color" },
  { label: "consistance", value: "layer.consistance" },
  { label: "plasticity", value: "layer.plasticity" },
  { label: "compactness", value: "layer.compactness" },
  { label: "cohesion", value: "layer.cohesion" },
  { label: "gradation", value: "layer.gradation" },
  { label: "humidity", value: "layer.humidity" },
  { label: "alteration", value: "layer.alteration" },
];

export const lithologyFilterEditorData: SettingsItem[] = fields.map((field, index) => ({
  id: index,
  label: field.label,
  value: field.value,
}));
