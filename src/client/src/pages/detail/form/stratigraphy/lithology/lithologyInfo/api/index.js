import { fetchStratigraphy, updateStratigraphy } from "../../../../../../../api/fetchApiV2.ts";

export const sendProfile = async (id, attribute, value) => {
  let success = false;
  await fetchStratigraphy(id).then(async stratigraphy => {
    if (stratigraphy) {
      stratigraphy[attribute] = value;
      await updateStratigraphy(stratigraphy).then(response => {
        if (response) {
          success = true;
        }
      });
    } else {
      alert("Failed to get stratigraphy data for update.");
    }
  });

  return success;
};
