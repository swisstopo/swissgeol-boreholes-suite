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

type ModeAttributeEntry = Omit<AttributeRegistryEntry, "isUnconsolidated">;

/** A description field named `<labelKey>Id` that takes one codelist id, matched by english text. */
const textSingle = (apiKey: keyof ClassifyResponse, labelKey: string, schema: string): ModeAttributeEntry => ({
  apiKey,
  targets: [descriptionTarget(`${labelKey}Id`, labelKey)],
  schema,
  match: "text",
  kind: "single",
});

/** A description field named `<labelKey>CodelistIds` that takes several codelist ids, matched by english text. */
const textList = (apiKey: keyof ClassifyResponse, labelKey: string, schema: string): ModeAttributeEntry => ({
  apiKey,
  targets: [descriptionTarget(`${labelKey}CodelistIds`, labelKey)],
  schema,
  match: "text",
  kind: "list",
});

const inMode = (isUnconsolidated: boolean, entries: ModeAttributeEntry[]): AttributeRegistryEntry[] =>
  entries.map(entry => ({ ...entry, isUnconsolidated }));

const color = textSingle("color", "colorPrimary", "color");

/**
 * The whole contract between the classification response and the lithology form, in one table.
 * Adding an attribute the service starts to return is one row.
 */
export const attributeRegistry: AttributeRegistryEntry[] = [
  ...inMode(true, [
    {
      apiKey: "en_main",
      targets: [descriptionTarget("lithologyUnconMainId", "lithologyUnconMain")],
      schema: "lithology_uncon_main",
      match: "code",
      kind: "single",
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
    },
    {
      apiKey: "uscs",
      targets: [{ path: "uscsTypeCodelistIds", labelKey: "uscsType" }],
      schema: "uscs_type",
      match: "code",
      kind: "singleIntoList",
    },
    color,
    textList("organic_components", "componentUnconOrganic", "component_uncon_organic"),
    textList("debris", "componentUnconDebris", "component_uncon_debris"),
    textList("grain_angularity", "grainAngularity", "grain_angularity"),
    textList("grain_shape", "grainShape", "grain_shape"),
  ]),
  ...inMode(false, [
    textSingle("lithology", "lithologyCon", "lithology_con"),
    color,
    textSingle("cementation", "cementation", "cementation"),
    textList("mineral_components", "componentConMineral", "component_con_mineral"),
    textList("accessory_components", "componentConParticle", "component_con_particle"),
    {
      apiKey: "alteration_degree_consolidated",
      targets: [{ path: "alterationDegreeId", labelKey: "alterationDegree" }],
      schema: "alteration_degree",
      match: "text",
      kind: "single",
    },
  ]),
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
