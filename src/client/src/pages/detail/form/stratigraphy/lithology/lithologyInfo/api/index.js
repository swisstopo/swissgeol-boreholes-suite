import { fetchStratigraphy, updateStratigraphy } from "../../../../../../../api/fetchApiV2.ts";

const updateStratigraphyData = async (id, updateFn) => {
  try {
    const stratigraphy = await fetchStratigraphy(id);
    if (!stratigraphy) {
      throw new Error("Failed to get stratigraphy data for update.");
    }

    updateFn(stratigraphy);
    const response = await updateStratigraphy(stratigraphy);
    return !!response;
  } catch (error) {
    alert(error.message);
    return false;
  }
};

export const updateStratigraphyAttribute = async (id, attribute, value) => {
  return updateStratigraphyData(id, stratigraphy => {
    stratigraphy[attribute] = value;
  });
};

export const updateStratigraphyAttributes = async (id, attributeValuePairs) => {
  return updateStratigraphyData(id, stratigraphy => {
    Object.entries(attributeValuePairs).forEach(([attribute, value]) => {
      stratigraphy[attribute] = value;
    });
  });
};
