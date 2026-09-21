import { Codelist } from "../../../../../../api/generated";

export type MatchStrategy = "code" | "text";

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
  value
    .trim()
    .toLowerCase()
    .replace(/_+$/, "")
    .replace(/_/g, "-");

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
