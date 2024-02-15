import { createStratigraphy } from "../../../../../../api/fetchApiV2";

let createdNewStratigraphy = false;
export const createNewStratigraphy = async (boreholeId, kindId) => {
  await createStratigraphy(boreholeId, kindId).then(response => {
    if (response) {
      createdNewStratigraphy = true;
    }
  });

  return createdNewStratigraphy;
};
