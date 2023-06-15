import {
  getLayerAttributes,
  patchLayer,
} from "../../../../../../api-lib/index";

let data = [];
export const getData = async id => {
  await getLayerAttributes(id)
    .then(response => {
      if (response.data.success) {
        data = response.data.data;
        // Fixes discrepancy between name in client and API.
        data["layer_lithology_top_bedrock"] = data["lithology_top_bedrock"];
        delete data["lithology_top_bedrock"];
      } else {
        alert(response.data.message);
      }
    })
    .catch(error => {
      console.error(error);
    });
  return data;
};

let isSendAttribute = false;
export const sendAttribute = async (id, attribute, value) => {
  await patchLayer(id, attribute, value)
    .then(response => {
      if (response.data.success) {
        isSendAttribute = true;
      } else {
        alert(response.data.message);
        window.location.reload();
      }
    })
    .catch(error => {
      console.error(error);
    });
  return isSendAttribute;
};
