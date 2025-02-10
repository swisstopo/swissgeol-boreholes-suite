import { createLayer, getProfileLayers } from "../../../../../../../api-lib";

let data = [];
export const getData = async id => {
  await getProfileLayers(id, true)
    .then(response => {
      if (response.data.success) {
        data = response.data;
      } else {
        alert(response.data.message);
      }
    })
    .catch(error => {
      console.error(error);
    });

  return data;
};

export const createLayerApi = async id => {
  try {
    const response = await createLayer(id);
    if (response.data.success) {
      return true;
    } else {
      alert(response.data.message);
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};
