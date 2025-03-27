import { createStratigraphy } from "../../../../../../../api/fetchApiV2.ts";

let createdNewStratigraphy = false;
export const createNewStratigraphy = async boreholeId => {
  await createStratigraphy(boreholeId).then(response => {
    if (response) {
      createdNewStratigraphy = true;
    }
  });

  return createdNewStratigraphy;
};
