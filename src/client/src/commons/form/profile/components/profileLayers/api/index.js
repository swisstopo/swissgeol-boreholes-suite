import { getProfileLayers, createLayer } from '@ist-supsi/bmsjs';

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

let isCreateLayer = false;
export const createLayerApi = async id => {
  await createLayer(id)
    .then(response => {
      if (response.data.success) {
        isCreateLayer = true;
      } else {
        alert(response.data.message);
      }
    })
    .catch(error => {
      console.error(error);
    });
  return isCreateLayer;
};
