import type { TFunction } from "i18next";
import type { Workgroup } from "../../../../api/apiInterfaces";
import type { Codelist } from "../../../../components/codelist";
import { capitalizeFirstLetter } from "../../../../utils";
import type { filterParsers } from "../../useBoreholeUrlParams";

export type ChipDescriptor = {
  id: string;
  label: string;
  tooltip?: string;
  testId: string;
  onDelete: () => void;
};

type FilterKey = keyof typeof filterParsers;

type FilterFieldMeta =
  | { shape: "multiselectCodelist"; labelKey: string; schema: string }
  | { shape: "multiselectWorkgroup"; labelKey: string }
  | {
      shape: "multiselectString";
      labelKey: string;
      translateValue?: (v: string, t: TFunction) => string;
    }
  | {
      shape: "text";
      labelKey: string;
      translateValue?: (v: string, t: TFunction) => string;
    }
  | { shape: "rangeMin"; labelKey: string; boundLabel: "min" | "from" }
  | { shape: "rangeMax"; labelKey: string; boundLabel: "max" | "to" }
  | { shape: "nullableBoolean"; labelKey: string; allowNull: boolean };

// Shape → value type mapping. Mirrors what `filterParsers` in
// useBoreholeUrlParams.ts actually produces at runtime, so the chip builders
// can narrow `filterParams[key]` without ad-hoc casts.
type FilterValueByShape = {
  multiselectCodelist: number[];
  multiselectWorkgroup: number[];
  multiselectString: string[];
  text: string;
  // `parseAsFloat` is used for the numeric ranges; `parseAsString` for the
  // date-string ranges (restrictionUntil*). Keep both options here.
  rangeMin: number | string;
  rangeMax: number | string;
  // `parseAsStringLiteral(["true", "false", "null"])` — URL representation.
  nullableBoolean: "true" | "false" | "null";
};

type FilterShapeOf<K extends FilterKey> = (typeof FILTER_FIELD_META)[K]["shape"];

// Keys whose meta shape is "multiselectCodelist". Used to narrow the
// multiselect-codelist builder's `key` parameter so `filterParams[key]` is
// typed as `number[] | undefined` without an explicit cast.
type MultiselectCodelistKey = {
  [K in FilterKey]: FilterShapeOf<K> extends "multiselectCodelist" ? K : never;
}[FilterKey];

// Same pattern for workgroup-multiselect keys.
type MultiselectWorkgroupKey = {
  [K in FilterKey]: FilterShapeOf<K> extends "multiselectWorkgroup" ? K : never;
}[FilterKey];

// Same pattern for string-multiselect keys (e.g. workflowStatus).
type MultiselectStringKey = {
  [K in FilterKey]: FilterShapeOf<K> extends "multiselectString" ? K : never;
}[FilterKey];

export type ChipDescriptorInputs = {
  filterParams: Partial<{ [K in FilterKey]: FilterValueByShape[FilterShapeOf<K>] }>;
  codelists: Codelist[];
  getCodelistLabel: (c: Codelist) => string;
  workgroups: Workgroup[];
  t: TFunction;
  // Only multiselect deletion writes back to filter state from this module —
  // and it always passes the narrowed remaining id array. Keep the signature
  // tight to prevent future misuse.
  setField: (key: FilterKey, value: number[] | string[]) => void;
  clearField: (key: FilterKey) => void;
};

// Exhaustive meta for every key in filterParsers.
// `satisfies` (instead of a `:` annotation) preserves the literal shape of
// each entry so `FilterShapeOf<K>` can look up the per-key shape.
// Adding a new parser without adding a meta entry here fails the TypeScript build.
export const FILTER_FIELD_META = {
  originalName: { shape: "text", labelKey: "original_name" },
  projectName: { shape: "text", labelKey: "project_name" },
  name: { shape: "text", labelKey: "name" },
  statusId: { shape: "multiselectCodelist", labelKey: "boreholeStatus", schema: "extended.status" },
  typeId: { shape: "multiselectCodelist", labelKey: "borehole_type", schema: "borehole_type" },
  purposeId: { shape: "multiselectCodelist", labelKey: "purpose", schema: "extended.purpose" },
  workgroupId: { shape: "multiselectWorkgroup", labelKey: "workgroup" },
  restrictionId: { shape: "multiselectCodelist", labelKey: "restriction", schema: "restriction" },
  restrictionUntilFrom: { shape: "rangeMin", labelKey: "restriction_until", boundLabel: "from" },
  restrictionUntilTo: { shape: "rangeMax", labelKey: "restriction_until", boundLabel: "to" },
  totalDepthMin: { shape: "rangeMin", labelKey: "totaldepth", boundLabel: "min" },
  totalDepthMax: { shape: "rangeMax", labelKey: "totaldepth", boundLabel: "max" },
  topBedrockFreshMdMin: { shape: "rangeMin", labelKey: "top_bedrock_fresh_md", boundLabel: "min" },
  topBedrockFreshMdMax: { shape: "rangeMax", labelKey: "top_bedrock_fresh_md", boundLabel: "max" },
  topBedrockWeatheredMdMin: { shape: "rangeMin", labelKey: "top_bedrock_weathered_md", boundLabel: "min" },
  topBedrockWeatheredMdMax: { shape: "rangeMax", labelKey: "top_bedrock_weathered_md", boundLabel: "max" },
  nationalInterest: { shape: "nullableBoolean", labelKey: "nationalInterest", allowNull: true },
  topBedrockIntersected: { shape: "nullableBoolean", labelKey: "topBedrockIntersected", allowNull: true },
  hasGroundwater: { shape: "nullableBoolean", labelKey: "hasGroundwater", allowNull: true },
  hasGeometry: { shape: "nullableBoolean", labelKey: "hasGeometry", allowNull: false },
  hasLogs: { shape: "nullableBoolean", labelKey: "hasLogs", allowNull: false },
  hasProfiles: { shape: "nullableBoolean", labelKey: "hasProfiles", allowNull: false },
  hasPhotos: { shape: "nullableBoolean", labelKey: "hasPhotos", allowNull: false },
  hasDocuments: { shape: "nullableBoolean", labelKey: "hasDocuments", allowNull: false },
  workflowStatus: {
    shape: "multiselectString",
    labelKey: "workflowStatus",
    translateValue: (v: string, t: TFunction) => capitalizeFirstLetter(t(`statuses.${v}`)),
  },
} as const satisfies Record<FilterKey, FilterFieldMeta>;

// Order in which chips render. Uses the declaration order of FILTER_FIELD_META.
const FILTER_KEY_ORDER = Object.keys(FILTER_FIELD_META) as FilterKey[];

// Shared helper — every shape that renders a tooltip formats the same
// "{Category}: {value}" string. Keeping it in one place keeps the builders
// short and makes it obvious when a future shape needs different formatting.
function resolveCategoryLabel(meta: { labelKey: string }, inputs: ChipDescriptorInputs): string {
  return inputs.t(meta.labelKey) as string;
}

// Shared delete behavior for multiselect shapes: remove the value; if nothing
// is left, clear the field entirely so URL state matches "no filter active".
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

function buildCodelistMultiselectDescriptors(
  key: MultiselectCodelistKey,
  meta: Extract<FilterFieldMeta, { shape: "multiselectCodelist" }>,
  inputs: ChipDescriptorInputs,
): ChipDescriptor[] {
  // `MultiselectCodelistKey` constrains `K` so `filterParams[key]` narrows to
  // `number[] | undefined` via the `FilterValueByShape` map — no cast needed.
  const value = inputs.filterParams[key];
  if (value === undefined) return [];
  // Skip entirely while codelists are still loading — flashing "#<id>" chips for
  // every selection on initial render is worse than briefly rendering no chips.
  if (inputs.codelists.length === 0) return [];
  const categoryLabel = resolveCategoryLabel(meta, inputs);
  return value.map(id => {
    const codelist = inputs.codelists.find(c => c.schema === meta.schema && c.id === id);
    const valueLabel = codelist ? inputs.getCodelistLabel(codelist) : `#${id}`;
    return {
      id: `${key}:${id}`,
      label: valueLabel,
      tooltip: `${categoryLabel}: ${valueLabel}`,
      testId: `filter-chip-${key}-${id}`,
      onDelete: makeMultiselectDeleteHandler(key, value, id, inputs),
    };
  });
}

function buildWorkgroupMultiselectDescriptors(
  key: MultiselectWorkgroupKey,
  meta: Extract<FilterFieldMeta, { shape: "multiselectWorkgroup" }>,
  inputs: ChipDescriptorInputs,
): ChipDescriptor[] {
  const value = inputs.filterParams[key];
  if (value === undefined) return [];
  // Same rationale as codelists: skip while workgroups haven't loaded rather
  // than flash "#<id>" chips that immediately resolve.
  if (inputs.workgroups.length === 0) return [];
  const categoryLabel = resolveCategoryLabel(meta, inputs);
  return value.map(id => {
    const workgroup = inputs.workgroups.find(w => w.id === id);
    const valueLabel = workgroup ? workgroup.name : `#${id}`;
    return {
      id: `${key}:${id}`,
      label: valueLabel,
      tooltip: `${categoryLabel}: ${valueLabel}`,
      testId: `filter-chip-${key}-${id}`,
      onDelete: makeMultiselectDeleteHandler(key, value, id, inputs),
    };
  });
}

function buildStringMultiselectDescriptors(
  key: MultiselectStringKey,
  meta: Extract<FilterFieldMeta, { shape: "multiselectString" }>,
  inputs: ChipDescriptorInputs,
): ChipDescriptor[] {
  const value = inputs.filterParams[key];
  if (value === undefined) return [];
  const categoryLabel = resolveCategoryLabel(meta, inputs);
  return value.map(v => {
    const valueLabel = meta.translateValue ? meta.translateValue(v, inputs.t) : v;
    return {
      id: `${key}:${v}`,
      label: valueLabel,
      tooltip: `${categoryLabel}: ${valueLabel}`,
      testId: `filter-chip-${key}-${v}`,
      onDelete: makeMultiselectDeleteHandler(key, value, v, inputs),
    };
  });
}

function buildRangeBoundDescriptor(
  key: FilterKey,
  meta: Extract<FilterFieldMeta, { shape: "rangeMin" | "rangeMax" }>,
  value: string | number,
  inputs: ChipDescriptorInputs,
): ChipDescriptor | null {
  // Empty-string date bounds ("restrictionUntil*" uses parseAsString, so the
  // URL can legitimately carry "") shouldn't surface as active filters.
  if (typeof value === "string" && value.trim().length === 0) return null;
  const categoryLabel = resolveCategoryLabel(meta, inputs);
  const boundWord = meta.boundLabel;
  const symbol = meta.shape === "rangeMin" ? ">" : "<";
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
  meta: Extract<FilterFieldMeta, { shape: "nullableBoolean" }>,
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
    // Face already contains both category + value, so no tooltip is needed.
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
  meta: Extract<FilterFieldMeta, { shape: "text" }>,
  value: string,
  inputs: ChipDescriptorInputs,
): ChipDescriptor | null {
  // Empty / whitespace-only strings shouldn't surface as active filters — the
  // underlying query treats them as "no filter", so a chip would be misleading.
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
  for (const key of FILTER_KEY_ORDER) {
    const raw = inputs.filterParams[key];
    if (raw === undefined || raw === null) continue;
    const meta = FILTER_FIELD_META[key];
    switch (meta.shape) {
      case "multiselectCodelist":
        // `key` is broadly typed as `FilterKey` here; the helper re-accesses
        // `filterParams` with a narrowed key type to avoid a value cast.
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
        // Exhaustiveness — every shape in FilterFieldMeta should be handled.
        meta satisfies never;
        break;
    }
  }
  return result;
}
