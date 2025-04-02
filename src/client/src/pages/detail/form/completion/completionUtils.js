import { parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.ts";

/**
 * Prepares the data of a backfill, instrumentation or casing for submission.
 * @param {any} data The form data to be prepared for submission
 * @param {number} completionId The Id of the completion corresponding to the supplied data.
 * @returns {any} The updated form data
 */
export function prepareEntityDataForSubmit(data, completionId) {
  data.fromDepth = parseFloatWithThousandsSeparator(data.fromDepth);
  data.toDepth = parseFloatWithThousandsSeparator(data.toDepth);
  data.completionId = completionId;
  return data;
}
