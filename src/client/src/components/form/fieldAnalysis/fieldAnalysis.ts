/** The value of a form field an analysis can write: a codelist id, a list of them, or nothing. */
export type FieldValue = number | number[] | null;

/**
 * One field an analysis changed, addressed by its react-hook-form path. The form that owns the
 * analysis can narrow the path to the paths of its own values; the shared components only need it as
 * a string.
 */
export interface FieldChange<TPath extends string = string> {
  path: TPath;
  labelKey: string;
  previous: FieldValue;
  next: FieldValue;
}

const sortedIds = (ids: number[]): number[] => ids.toSorted((a, b) => a - b);

/**
 * Whether two field values are the same. Lists are compared regardless of order, because the API
 * stores them without one. A list never equals a value that is not a list.
 */
export const areFieldValuesEqual = (left: FieldValue, right: FieldValue): boolean => {
  if (Array.isArray(left) !== Array.isArray(right)) return false;
  if (Array.isArray(left) && Array.isArray(right)) {
    const sortedLeft = sortedIds(left);
    const sortedRight = sortedIds(right);
    return sortedLeft.length === sortedRight.length && sortedLeft.every((id, index) => id === sortedRight[index]);
  }
  return left === right;
};
