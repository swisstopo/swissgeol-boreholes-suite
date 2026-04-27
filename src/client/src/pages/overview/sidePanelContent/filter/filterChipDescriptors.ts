import type { TFunction } from "i18next";
import type { Workgroup } from "../../../../api/apiInterfaces";
import type { Codelist } from "../../../../components/codelist";
import { capitalizeFirstLetter } from "../../../../utils";
import { FilterKey } from "../../useBoreholeUrlParams.ts";

type ChipDescriptor = {
  id: string;
  label: string;
  tooltip?: string;
  testId: string;
  onDelete: () => void;
};

type FilterFieldMeta =
  | { type: "multiselectCodelist"; labelKey: string; schema: string }
  | { type: "multiselectWorkgroup"; labelKey: string }
  | {
      type: "multiselectString";
      labelKey: string;
      translateValue?: (v: string, t: TFunction) => string;
    }
  | {
      type: "text";
      labelKey: string;
      translateValue?: (v: string, t: TFunction) => string;
    }
  | { type: "rangeMin"; labelKey: string; boundLabel: "min" | "from" }
  | { type: "rangeMax"; labelKey: string; boundLabel: "max" | "to" }
  | { type: "nullableBoolean"; labelKey: string; allowNull: boolean };

type FilterValueByType = {
  multiselectCodelist: number[];
  multiselectWorkgroup: number[];
  multiselectString: string[];
  text: string;
  rangeMin: number | string; // types for dates and numeric ranges.
  rangeMax: number | string;
  nullableBoolean: "true" | "false" | "null";
};

type FilterTypeOf<K extends FilterKey> = (typeof FilterFieldMetaData)[K]["type"];

type MultiselectCodelistKey = {
  [K in FilterKey]: FilterTypeOf<K> extends "multiselectCodelist" ? K : never;
}[FilterKey];

type MultiselectWorkgroupKey = {
  [K in FilterKey]: FilterTypeOf<K> extends "multiselectWorkgroup" ? K : never;
}[FilterKey];

type MultiselectStringKey = {
  [K in FilterKey]: FilterTypeOf<K> extends "multiselectString" ? K : never;
}[FilterKey];

export type ChipDescriptorInputs = {
  filterParams: Partial<{ [K in FilterKey]: FilterValueByType[FilterTypeOf<K>] }>;
  codelists: Codelist[];
  getCodelistLabel: (c: Codelist) => string;
  workgroups: Workgroup[];
  t: TFunction;
  setField: (key: FilterKey, value: number[] | string[]) => void;
  clearField: (key: FilterKey) => void;
};

// Meta for every key in filterParsers.
// each entry so `FilterTypeOf<K>` can look up the per-key type.
export const FilterFieldMetaData = {
  originalName: { type: "text", labelKey: "original_name" },
  projectName: { type: "text", labelKey: "project_name" },
  name: { type: "text", labelKey: "name" },
  statusId: { type: "multiselectCodelist", labelKey: "boreholeStatus", schema: "extended.status" },
  typeId: { type: "multiselectCodelist", labelKey: "borehole_type", schema: "borehole_type" },
  purposeId: { type: "multiselectCodelist", labelKey: "purpose", schema: "extended.purpose" },
  workgroupId: { type: "multiselectWorkgroup", labelKey: "workgroup" },
  restrictionId: { type: "multiselectCodelist", labelKey: "restriction", schema: "restriction" },
  restrictionUntilFrom: { type: "rangeMin", labelKey: "restriction_until", boundLabel: "from" },
  restrictionUntilTo: { type: "rangeMax", labelKey: "restriction_until", boundLabel: "to" },
  totalDepthMin: { type: "rangeMin", labelKey: "totaldepth", boundLabel: "min" },
  totalDepthMax: { type: "rangeMax", labelKey: "totaldepth", boundLabel: "max" },
  topBedrockFreshMdMin: { type: "rangeMin", labelKey: "top_bedrock_fresh_md", boundLabel: "min" },
  topBedrockFreshMdMax: { type: "rangeMax", labelKey: "top_bedrock_fresh_md", boundLabel: "max" },
  topBedrockWeatheredMdMin: { type: "rangeMin", labelKey: "top_bedrock_weathered_md", boundLabel: "min" },
  topBedrockWeatheredMdMax: { type: "rangeMax", labelKey: "top_bedrock_weathered_md", boundLabel: "max" },
  nationalInterest: { type: "nullableBoolean", labelKey: "nationalInterest", allowNull: true },
  topBedrockIntersected: { type: "nullableBoolean", labelKey: "topBedrockIntersected", allowNull: true },
  hasGroundwater: { type: "nullableBoolean", labelKey: "hasGroundwater", allowNull: true },
  hasGeometry: { type: "nullableBoolean", labelKey: "hasGeometry", allowNull: false },
  hasLogs: { type: "nullableBoolean", labelKey: "hasLogs", allowNull: false },
  hasProfiles: { type: "nullableBoolean", labelKey: "hasProfiles", allowNull: false },
  hasPhotos: { type: "nullableBoolean", labelKey: "hasPhotos", allowNull: false },
  hasDocuments: { type: "nullableBoolean", labelKey: "hasDocuments", allowNull: false },
  workflowStatus: {
    type: "multiselectString",
    labelKey: "workflowStatus",
    translateValue: (v: string, t: TFunction) => capitalizeFirstLetter(t(`statuses.${v}`)),
  },
} as const satisfies Record<FilterKey, FilterFieldMeta>; // Adding a new parser without adding a meta entry here fails the TypeScript build.

// Order in which chips render. Uses the declaration order of FilterFieldMetaData.
const FilterKeyOrder = Object.keys(FilterFieldMetaData) as FilterKey[];

function resolveCategoryLabel(meta: { labelKey: string }, inputs: ChipDescriptorInputs): string {
  return inputs.t(meta.labelKey) as string;
}

// Shared delete behavior for multiselect types: remove the value; if nothing
// is left, clear the field entirely so URL state matches
function makeMultiselectDeleteHandler<T extends number | string>(
  key: FilterKey,
  value: T[],
  id: T,
  inputs: ChipDescriptorInputs,
): () => void {
  return () => {
    const next = value.filter(v => v !== id);
    if (next.length === 0) {
      inputs.clearField(key);
    } else {
      inputs.setField(key, next as number[] | string[]);
    }
  };
}

// Per-type strategy for the generic multiselect builder. `isLoading` lets
// codelist/workgroup types suppress chips while their lookup table is fetching.
type MultiselectStrategy<V extends number | string> = {
  isLoading: boolean;
  getLabel: (v: V) => string;
};

function buildMultiselectDescriptors<V extends number | string>(
  key: FilterKey,
  value: V[],
  meta: { labelKey: string },
  inputs: ChipDescriptorInputs,
  { isLoading, getLabel }: MultiselectStrategy<V>,
): ChipDescriptor[] {
  if (isLoading) return [];
  const categoryLabel = resolveCategoryLabel(meta, inputs);
  return value.map(v => {
    const valueLabel = getLabel(v);
    return {
      id: `${key}:${v}`,
      label: valueLabel,
      tooltip: `${categoryLabel}: ${valueLabel}`,
      testId: `filter-chip-${key}-${v}`,
      onDelete: makeMultiselectDeleteHandler(key, value, v, inputs),
    };
  });
}

function buildCodelistMultiselectDescriptors(
  key: MultiselectCodelistKey,
  meta: Extract<FilterFieldMeta, { type: "multiselectCodelist" }>,
  inputs: ChipDescriptorInputs,
): ChipDescriptor[] {
  const value = inputs.filterParams[key];
  if (value === undefined) return [];
  return buildMultiselectDescriptors(key, value, meta, inputs, {
    isLoading: inputs.codelists.length === 0,
    getLabel: id => {
      const codelist = inputs.codelists.find(c => c.schema === meta.schema && c.id === id);
      return codelist ? inputs.getCodelistLabel(codelist) : `#${id}`;
    },
  });
}

function buildWorkgroupMultiselectDescriptors(
  key: MultiselectWorkgroupKey,
  meta: Extract<FilterFieldMeta, { type: "multiselectWorkgroup" }>,
  inputs: ChipDescriptorInputs,
): ChipDescriptor[] {
  const value = inputs.filterParams[key];
  if (value === undefined) return [];
  return buildMultiselectDescriptors(key, value, meta, inputs, {
    isLoading: inputs.workgroups.length === 0,
    getLabel: id => inputs.workgroups.find(w => w.id === id)?.name ?? `#${id}`,
  });
}

function buildStringMultiselectDescriptors(
  key: MultiselectStringKey,
  meta: Extract<FilterFieldMeta, { type: "multiselectString" }>,
  inputs: ChipDescriptorInputs,
): ChipDescriptor[] {
  const value = inputs.filterParams[key];
  if (value === undefined) return [];
  return buildMultiselectDescriptors(key, value, meta, inputs, {
    isLoading: false,
    getLabel: v => (meta.translateValue ? meta.translateValue(v, inputs.t) : v),
  });
}

function buildRangeBoundDescriptor(
  key: FilterKey,
  meta: Extract<FilterFieldMeta, { type: "rangeMin" | "rangeMax" }>,
  value: string | number,
  inputs: ChipDescriptorInputs,
): ChipDescriptor | null {
  // Empty-string date bounds ("restrictionUntil*" uses parseAsString, so the
  // URL can legitimately carry "") shouldn't surface as active filters.
  if (typeof value === "string" && value.trim().length === 0) return null;
  const categoryLabel = resolveCategoryLabel(meta, inputs);
  const boundWord = meta.boundLabel;
  const symbol = meta.type === "rangeMin" ? ">" : "<";
  const label = `${symbol} ${value}`;
  return {
    id: key,
    label,
    tooltip: `${categoryLabel} ${boundWord}: ${label}`,
    testId: `filter-chip-${key}`,
    onDelete: () => inputs.clearField(key),
  };
}

function buildNullableBooleanDescriptor(
  key: FilterKey,
  meta: Extract<FilterFieldMeta, { type: "nullableBoolean" }>,
  value: "true" | "false" | "null",
  inputs: ChipDescriptorInputs,
): ChipDescriptor | null {
  let valueLabel: string;
  if (value === "true") {
    valueLabel = inputs.t("yes") as string;
  } else if (value === "false") {
    valueLabel = inputs.t("no") as string;
  } else if (value === "null" && meta.allowNull) {
    valueLabel = inputs.t("np") as string;
  } else {
    // "null" on a non-nullable field is not a valid selection — hide the chip.
    return null;
  }
  const categoryLabel = resolveCategoryLabel(meta, inputs);
  return {
    id: key,
    // Already contains both category + value, so no tooltip is needed.
    label: `${categoryLabel}: ${valueLabel}`,
    testId: `filter-chip-${key}`,
    // Must use clearField (not setField(key, null)) — for keys in
    // nullableBooleanFilterKeys, setFilterField translates null to the URL
    // literal "null" (meaning "Keine Angabe"), which would keep the chip alive.
    onDelete: () => inputs.clearField(key),
  };
}

function buildTextDescriptor(
  key: FilterKey,
  meta: Extract<FilterFieldMeta, { type: "text" }>,
  value: string,
  inputs: ChipDescriptorInputs,
): ChipDescriptor | null {
  // Empty / whitespace-only strings shouldn't surface as active filters — the
  // underlying query treats them as "no filter".
  if (value.trim().length === 0) return null;
  const categoryLabel = resolveCategoryLabel(meta, inputs);
  const valueLabel = meta.translateValue ? meta.translateValue(value, inputs.t) : value;
  return {
    id: key,
    label: valueLabel,
    tooltip: `${categoryLabel}: ${valueLabel}`,
    testId: `filter-chip-${key}`,
    onDelete: () => inputs.clearField(key),
  };
}

export function buildFilterChipDescriptors(inputs: ChipDescriptorInputs): ChipDescriptor[] {
  const result: ChipDescriptor[] = [];
  for (const key of FilterKeyOrder) {
    const raw = inputs.filterParams[key];
    if (raw === undefined || raw === null) continue;
    const meta = FilterFieldMetaData[key];
    switch (meta.type) {
      case "multiselectCodelist":
        result.push(...buildCodelistMultiselectDescriptors(key as MultiselectCodelistKey, meta, inputs));
        break;
      case "multiselectWorkgroup":
        result.push(...buildWorkgroupMultiselectDescriptors(key as MultiselectWorkgroupKey, meta, inputs));
        break;
      case "multiselectString":
        result.push(...buildStringMultiselectDescriptors(key as MultiselectStringKey, meta, inputs));
        break;
      case "text": {
        const descriptor = buildTextDescriptor(key, meta, raw as string, inputs);
        if (descriptor) result.push(descriptor);
        break;
      }
      case "rangeMin":
      case "rangeMax": {
        const descriptor = buildRangeBoundDescriptor(key, meta, raw as string | number, inputs);
        if (descriptor) result.push(descriptor);
        break;
      }
      case "nullableBoolean": {
        const descriptor = buildNullableBooleanDescriptor(key, meta, raw as "true" | "false" | "null", inputs);
        if (descriptor) result.push(descriptor);
        break;
      }
      default:
        // Exhaustiveness — every type in FilterFieldMeta should be handled.
        meta satisfies never;
        break;
    }
  }
  return result;
}
