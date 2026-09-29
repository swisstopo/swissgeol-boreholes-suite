import { ClassificationConsolidation, ClassifyResponse } from "../../../../../../api/dataextractionInterfaces.ts";
import { Codelist } from "../../../../../../api/generated";
import {
  areFieldValuesEqual,
  FieldChange,
  FieldValue,
} from "../../../../../../components/form/fieldAnalysis/fieldAnalysis.ts";
import { LithologyFormValues } from "../../stratigraphy.ts";

type MatchStrategy = "code" | "text";

/**
 * Normalises an english codelist text for comparison. Reduces every run of non alphanumeric
 * characters to a single space, because the service joins words with underscores while the codelist
 * texts use spaces, commas and hyphens: `fragments_splitters` has to find `fragments, splitters`.
 */
export const normaliseText = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * Normalises a codelist code for comparison. The service enum is lowercase throughout, escapes the
 * member that would collide with a python keyword (`or_` for the code `Or`), and joins compound
 * codes with an underscore where the codelist uses a hyphen (`GP_GC` for `GP-GC`).
 */
export const normaliseCode = (value: string): string =>
  value.trim().toLowerCase().replace(/_+$/, "").replace(/_/g, "-");

/**
 * Resolves a value the classification returned to a codelist id within one schema.
 * @returns The codelist id, or undefined when the schema holds no matching entry.
 */
export const findCodelistId = (
  codelists: Codelist[],
  schema: string,
  match: MatchStrategy,
  value: string,
): number | undefined => {
  const normalise = match === "code" ? normaliseCode : normaliseText;
  const wanted = normalise(value);
  // Many codelists carry an empty code, so an empty needle must never match.
  if (wanted.length === 0) return undefined;

  return codelists.find(
    entry => entry.schema === schema && normalise((match === "code" ? entry.code : entry.en) ?? "") === wanted,
  )?.id;
};

/** How many values of the response the registry writes into how many form fields. */
type AttributeKind = "single" | "list" | "singleIntoList" | "fanOut";

interface AttributeTarget {
  path: string;
  labelKey: string;
}

interface AttributeRegistryEntry {
  apiKey: keyof ClassifyResponse;
  targets: AttributeTarget[];
  schema: string;
  match: MatchStrategy;
  kind: AttributeKind;
  /** The mode the attribute belongs to. The service only populates the keys of the mode it inferred. */
  isUnconsolidated: boolean;
}

export interface ModeChange {
  previous: boolean | null;
  next: boolean | null;
}

interface ClassificationChanges {
  changes: FieldChange[];
  modeChange?: ModeChange;
}

const descriptionTarget = (field: string, labelKey: string): AttributeTarget => ({
  path: `lithologyDescriptions.0.${field}`,
  labelKey,
});

/**
 * The whole contract between the classification response and the lithology form, in one table.
 * Adding an attribute the service starts to return is one row.
 */
export const attributeRegistry: AttributeRegistryEntry[] = [
  {
    apiKey: "en_main",
    targets: [descriptionTarget("lithologyUnconMainId", "lithologyUnconMain")],
    schema: "lithology_uncon_main",
    match: "code",
    kind: "single",
    isUnconsolidated: true,
  },
  {
    apiKey: "en_secondary",
    targets: [
      descriptionTarget("lithologyUncon2Id", "lithologyUnconSecondary"),
      descriptionTarget("lithologyUncon3Id", "componentUncon"),
      descriptionTarget("lithologyUncon4Id", "componentUncon"),
      descriptionTarget("lithologyUncon5Id", "componentUncon"),
      descriptionTarget("lithologyUncon6Id", "componentUncon"),
    ],
    schema: "lithology_uncon_secondary",
    match: "code",
    kind: "fanOut",
    isUnconsolidated: true,
  },
  {
    apiKey: "uscs",
    targets: [{ path: "uscsTypeCodelistIds", labelKey: "uscsType" }],
    schema: "uscs_type",
    match: "code",
    kind: "singleIntoList",
    isUnconsolidated: true,
  },
  {
    apiKey: "color",
    targets: [descriptionTarget("colorPrimaryId", "colorPrimary")],
    schema: "color",
    match: "text",
    kind: "single",
    isUnconsolidated: true,
  },
  {
    apiKey: "organic_components",
    targets: [descriptionTarget("componentUnconOrganicCodelistIds", "componentUnconOrganic")],
    schema: "component_uncon_organic",
    match: "text",
    kind: "list",
    isUnconsolidated: true,
  },
  {
    apiKey: "debris",
    targets: [descriptionTarget("componentUnconDebrisCodelistIds", "componentUnconDebris")],
    schema: "component_uncon_debris",
    match: "text",
    kind: "list",
    isUnconsolidated: true,
  },
  {
    apiKey: "grain_angularity",
    targets: [descriptionTarget("grainAngularityCodelistIds", "grainAngularity")],
    schema: "grain_angularity",
    match: "text",
    kind: "list",
    isUnconsolidated: true,
  },
  {
    apiKey: "grain_shape",
    targets: [descriptionTarget("grainShapeCodelistIds", "grainShape")],
    schema: "grain_shape",
    match: "text",
    kind: "list",
    isUnconsolidated: true,
  },
  {
    apiKey: "lithology",
    targets: [descriptionTarget("lithologyConId", "lithologyCon")],
    schema: "lithology_con",
    match: "text",
    kind: "single",
    isUnconsolidated: false,
  },
  {
    apiKey: "color",
    targets: [descriptionTarget("colorPrimaryId", "colorPrimary")],
    schema: "color",
    match: "text",
    kind: "single",
    isUnconsolidated: false,
  },
  {
    apiKey: "cementation",
    targets: [descriptionTarget("cementationId", "cementation")],
    schema: "cementation",
    match: "text",
    kind: "single",
    isUnconsolidated: false,
  },
  {
    apiKey: "mineral_components",
    targets: [descriptionTarget("componentConMineralCodelistIds", "componentConMineral")],
    schema: "component_con_mineral",
    match: "text",
    kind: "list",
    isUnconsolidated: false,
  },
  {
    apiKey: "accessory_components",
    targets: [descriptionTarget("componentConParticleCodelistIds", "componentConParticle")],
    schema: "component_con_particle",
    match: "text",
    kind: "list",
    isUnconsolidated: false,
  },
  {
    apiKey: "alteration_degree_consolidated",
    targets: [{ path: "alterationDegreeId", labelKey: "alterationDegree" }],
    schema: "alteration_degree",
    match: "text",
    kind: "single",
    isUnconsolidated: false,
  },
];

const modeForConsolidation = (consolidation: ClassificationConsolidation | undefined): boolean | null => {
  if (consolidation === "unconsolidated") return true;
  if (consolidation === "consolidated") return false;
  return null;
};

const valueAtPath = (values: LithologyFormValues, path: string): FieldValue => {
  const raw = path.split(".").reduce<unknown>((step, key) => {
    if (step === null || step === undefined) return undefined;
    return (step as Record<string, unknown>)[key];
  }, values);

  if (Array.isArray(raw)) return raw as number[];
  if (typeof raw === "number") return raw;
  return null;
};

const asList = (raw: unknown): string[] => {
  if (Array.isArray(raw)) return raw.filter((value): value is string => typeof value === "string");
  if (typeof raw === "string") return [raw];
  return [];
};

const resolveIds = (entry: AttributeRegistryEntry, raw: unknown, codelists: Codelist[]): number[] =>
  asList(raw)
    .map(value => {
      const id = findCodelistId(codelists, entry.schema, entry.match, value);
      if (id === undefined) {
        console.warn(`Classification returned "${value}" for ${entry.apiKey}, which no ${entry.schema} entry matches.`);
      }
      return id;
    })
    .filter((id): id is number => id !== undefined);

/**
 * Turns a classification response into the mode change and the field changes it implies.
 *
 * A value equal to the one already in the form is not a change, so it produces nothing. When the
 * mode changes, every previous value is reported as empty, because the mode switch clears the
 * fields of the outgoing mode and values are never carried across.
 * @param response The classification response.
 * @param codelists Every codelist, as loaded by useCodelists.
 * @param currentValues The live form values, which are the undo baseline.
 */
export const mapClassificationToChanges = (
  response: ClassifyResponse,
  codelists: Codelist[],
  currentValues: LithologyFormValues,
): ClassificationChanges => {
  const nextMode = modeForConsolidation(response.consolidation);
  const currentMode = currentValues.isUnconsolidated ?? null;
  const modeChange = nextMode === currentMode ? undefined : { previous: currentMode, next: nextMode };

  const changes: FieldChange[] = [];

  for (const entry of attributeRegistry) {
    if (nextMode === null || entry.isUnconsolidated !== nextMode) continue;

    const ids = resolveIds(entry, response[entry.apiKey], codelists);
    if (ids.length === 0) continue;

    const nextByTarget: [AttributeTarget, FieldValue][] =
      entry.kind === "fanOut"
        ? ids.slice(0, entry.targets.length).map((id, index) => [entry.targets[index], id])
        : [[entry.targets[0], entry.kind === "single" ? ids[0] : ids]];

    if (entry.kind === "fanOut" && ids.length > entry.targets.length) {
      console.warn(
        `Classification returned ${ids.length} values for ${entry.apiKey}, only the first ${entry.targets.length} fit the form.`,
      );
    }

    for (const [target, next] of nextByTarget) {
      const previous = modeChange ? null : valueAtPath(currentValues, target.path);
      if (areFieldValuesEqual(previous, next)) continue;
      changes.push({ path: target.path, labelKey: target.labelKey, previous, next });
    }
  }

  return modeChange ? { changes, modeChange } : { changes };
};
