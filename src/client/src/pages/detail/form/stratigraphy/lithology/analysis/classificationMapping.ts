import { Path } from "react-hook-form";
import { ClassificationConsolidation, ClassifyResponse } from "../../../../../../api/dataextractionInterfaces.ts";
import { Codelist, LithologyDescription } from "../../../../../../api/generated";
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

/** Strips trailing underscores. */
const withoutTrailingUnderscores = (value: string): string => {
  let end = value.length;
  while (end > 0 && value[end - 1] === "_") end--;
  return value.slice(0, end);
};

/**
 * Normalises a codelist code for comparison. The service enum is lowercase throughout, escapes the
 * member that would collide with a python keyword (`or_` for the code `Or`), and joins compound
 * codes with an underscore where the codelist uses a hyphen (`GP_GC` for `GP-GC`).
 */
export const normaliseCode = (value: string): string =>
  withoutTrailingUnderscores(value.trim().toLowerCase()).replaceAll("_", "-");

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

type DescriptionField = Extract<keyof LithologyDescription, string>;

/**
 * A react-hook-form path the analysis writes to: a field of the layer or of its first description.
 * Narrower than `Path<LithologyFormValues>`, whose tens of thousands of members are too complex for
 * the compiler to carry through the mapping.
 */
export type LithologyFieldPath = Extract<
  `lithologyDescriptions.0.${DescriptionField}` | Extract<keyof LithologyFormValues, string>,
  Path<LithologyFormValues>
>;

/** The `<labelKey>` of every field named `<labelKey><suffix>`. */
type LabelKeyOf<TField extends string, TSuffix extends string> = TField extends `${infer TLabelKey}${TSuffix}`
  ? TLabelKey
  : never;

interface AttributeTarget {
  path: LithologyFieldPath;
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

/** The translation key of a consolidation mode, where null is the unspecified one. */
export const modeLabelKey = (mode: boolean | null): string => {
  if (mode === true) return "unconsolidated";
  if (mode === false) return "consolidated";
  return "unspecified";
};

export interface ClassificationChanges {
  changes: FieldChange<LithologyFieldPath>[];
  /**
   * Whether the response carried anything the form can hold: a consolidation, or a value that
   * matches a codelist entry of the mode. Tells a description the service could not read from one
   * the form already matches.
   */
  hasRecognizedValues: boolean;
  modeChange?: ModeChange;
}

const descriptionTarget = (field: DescriptionField, labelKey: string): AttributeTarget => ({
  path: `lithologyDescriptions.0.${field}`,
  labelKey,
});

type ModeAttributeEntry = Omit<AttributeRegistryEntry, "isUnconsolidated">;

/** A description field named `<labelKey>Id` that takes one codelist id, matched by english text. */
const textSingle = (
  apiKey: keyof ClassifyResponse,
  labelKey: LabelKeyOf<DescriptionField, "Id">,
  schema: string,
): ModeAttributeEntry => ({
  apiKey,
  targets: [descriptionTarget(`${labelKey}Id`, labelKey)],
  schema,
  match: "text",
  kind: "single",
});

/** A description field named `<labelKey>CodelistIds` that takes several codelist ids, matched by english text. */
const textList = (
  apiKey: keyof ClassifyResponse,
  labelKey: LabelKeyOf<DescriptionField, "CodelistIds">,
  schema: string,
): ModeAttributeEntry => ({
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
const attributeRegistry: AttributeRegistryEntry[] = [
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

/**
 * The mode the classification implies. Without a consolidation the service makes no claim about the
 * mode, so the layer keeps its own and the attributes are matched against that.
 */
const modeForConsolidation = (
  consolidation: ClassificationConsolidation | undefined,
  currentMode: boolean | null,
): boolean | null => {
  if (consolidation === undefined) return currentMode;
  return consolidation === "unconsolidated";
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

const mappedResponseKeys = new Set<string>(["consolidation", ...attributeRegistry.map(entry => entry.apiKey)]);

/**
 * Warns about response keys the mapping drops. A key the service renamed would otherwise leave its
 * fields empty without a trace.
 */
const warnAboutUnmappedKeys = (response: ClassifyResponse) => {
  Object.keys(response)
    .filter(key => !mappedResponseKeys.has(key))
    .forEach(key => console.warn(`Classification returned ${key}, which no attribute registry entry maps.`));
};

/** Pairs the resolved ids with the form fields they are written into. */
const pairIdsWithTargets = (entry: AttributeRegistryEntry, ids: number[]): [AttributeTarget, FieldValue][] => {
  if (entry.kind !== "fanOut") return [[entry.targets[0], entry.kind === "single" ? ids[0] : ids]];

  if (ids.length > entry.targets.length) {
    console.warn(
      `Classification returned ${ids.length} values for ${entry.apiKey}, only the first ${entry.targets.length} fit the form.`,
    );
  }
  return ids.slice(0, entry.targets.length).map((id, index) => [entry.targets[index], id]);
};

const changesForEntry = (
  entry: AttributeRegistryEntry,
  ids: number[],
  previousValueAt: (path: string) => FieldValue,
): FieldChange<LithologyFieldPath>[] => {
  if (ids.length === 0) return [];

  return pairIdsWithTargets(entry, ids).flatMap(([target, next]) => {
    const previous = previousValueAt(target.path);
    return areFieldValuesEqual(previous, next)
      ? []
      : [{ path: target.path, labelKey: target.labelKey, previous, next }];
  });
};

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
  warnAboutUnmappedKeys(response);
  const currentMode = currentValues.isUnconsolidated ?? null;
  const nextMode = modeForConsolidation(response.consolidation, currentMode);
  const modeChange = nextMode === currentMode ? undefined : { previous: currentMode, next: nextMode };

  const previousValueAt = (path: string): FieldValue => (modeChange ? null : valueAtPath(currentValues, path));

  const resolvedEntries = attributeRegistry
    .filter(entry => nextMode !== null && entry.isUnconsolidated === nextMode)
    .map(entry => ({ entry, ids: resolveIds(entry, response[entry.apiKey], codelists) }));
  const changes = resolvedEntries.flatMap(({ entry, ids }) => changesForEntry(entry, ids, previousValueAt));
  const hasRecognizedValues = response.consolidation !== undefined || resolvedEntries.some(({ ids }) => ids.length > 0);

  return modeChange ? { changes, hasRecognizedValues, modeChange } : { changes, hasRecognizedValues };
};
