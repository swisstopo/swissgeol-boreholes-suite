/** The value of a form field an analysis can write: a codelist id, a list of them, or nothing. */
export type FieldValue = number | number[] | null;

/** One field an analysis changed, addressed by its react-hook-form path. */
export interface FieldChange {
  path: string;
  labelKey: string;
  previous: FieldValue;
  next: FieldValue;
}

/**
 * Whether two field values are the same. Lists are compared element by element in order, because
 * the order a multi select holds is the order the user sees.
 */
export const areFieldValuesEqual = (left: FieldValue, right: FieldValue): boolean => {
  if (Array.isArray(left) || Array.isArray(right)) {
    const leftList = Array.isArray(left) ? left : [];
    const rightList = Array.isArray(right) ? right : [];
    return leftList.length === rightList.length && leftList.every((value, index) => value === rightList[index]);
  }
  return left === right;
};
