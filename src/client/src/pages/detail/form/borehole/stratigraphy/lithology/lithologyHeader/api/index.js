import { createStratigraphy } from "../../../../../../../../api/fetchApiV2.js";

let createdNewStratigraphy = false;
export const createNewStratigraphy = async boreholeId => {
  await createStratigraphy(boreholeId).then(response => {
    if (response) {
      createdNewStratigraphy = true;
    }
  });

  return createdNewStratigraphy;
};
