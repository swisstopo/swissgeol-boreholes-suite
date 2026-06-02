import { parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.ts";

interface EntityWithDepth {
  fromDepth?: number | string | null;
  toDepth?: number | string | null;
  completionId?: number;
}

/**
 * Prepares the data of a backfill, instrumentation or casing for submission.
 * @param data The form data to be prepared for submission
 * @param completionId The Id of the completion corresponding to the supplied data.
 * @returns The updated form data
 */
export function prepareEntityDataForSubmit<T extends EntityWithDepth>(data: T, completionId: number): T {
  data.fromDepth = parseFloatWithThousandsSeparator(data.fromDepth);
  data.toDepth = parseFloatWithThousandsSeparator(data.toDepth);
  data.completionId = completionId;
  return data;
}
