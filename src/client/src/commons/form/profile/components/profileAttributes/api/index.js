import { patchLayer } from "../../../../../../api-lib/index";

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
