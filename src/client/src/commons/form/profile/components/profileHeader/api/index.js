import {
  getProfiles,
  createStratigraphy,
} from "../../../../../../api-lib/index";

let data = [];
export const getData = async (id, kind) => {
  await getProfiles(id, kind)
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

let createdNewStratigraphy = false;
export const createNewStratigraphy = async (id, kind) => {
  await createStratigraphy(id, kind)
    .then(response => {
      if (response.data.success) {
        createdNewStratigraphy = true;
      } else {
        alert(response.data.message);
      }
    })
    .catch(function (error) {
      console.error(error);
    });
  return createdNewStratigraphy;
};
