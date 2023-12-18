import { createStratigraphy } from "../../../../../../api/fetchApiV2";
import { getProfiles } from "../../../../../../api-lib/index";

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
export const createNewStratigraphy = async (boreholeId, kindId) => {
  await createStratigraphy(boreholeId, kindId).then(response => {
    if (response) {
      createdNewStratigraphy = true;
    } else {
      alert(response.statusText);
    }
  });

  return createdNewStratigraphy;
};
