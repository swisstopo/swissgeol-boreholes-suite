import { fetchStratigraphy, Stratigraphy, updateStratigraphy } from "../../../../../../../api/stratigraphy.ts";

export const updateStratigraphyAttributes = async (id: number, attributeValues: Partial<Stratigraphy>) => {
  try {
    const stratigraphy = await fetchStratigraphy(id);
    if (!stratigraphy) {
      throw new Error("Failed to get stratigraphy data for update.");
    }

    Object.assign(stratigraphy, attributeValues);
    const response = await updateStratigraphy(stratigraphy);
    return !!response;
  } catch (error) {
    alert((error as Error).message);
    return false;
  }
};
