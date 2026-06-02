import { LithologicalDescription } from "../../lithologicalDescription.ts";
import { Lithology } from "../../lithology.ts";

export const findMatchingLithologicalDescription = (
  lithology: Lithology,
  lithologicalDescriptions: LithologicalDescription[],
): LithologicalDescription | undefined => {
  const ids = lithology.depthIds ?? [];
  if (ids.length === 0) return undefined;
  return lithologicalDescriptions.find(ld => {
    const ldIds = ld.depthIds;
    if (!ldIds || ldIds.length === 0) return false;
    return ids.every(id => ldIds.includes(id));
  });
};
