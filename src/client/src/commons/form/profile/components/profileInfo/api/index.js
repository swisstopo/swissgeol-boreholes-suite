import { getProfile } from "../../../../../../api-lib/index";
import {
  fetchStratigraphy,
  updateStratigraphy,
} from "../../../../../../api/fetchApiV2";

let data = [];
export const getData = async id => {
  await getProfile(id)
    .then(response => {
      if (response.data.success) {
        data = response.data.data;
      } else {
        alert(response.data.message);
      }
    })
    .catch(error => {
      console.error(error);
    });

  return data;
};

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
