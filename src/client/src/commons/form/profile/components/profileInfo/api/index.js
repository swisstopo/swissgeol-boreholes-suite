import { getProfile, patchProfile } from '../../../../../../lib/index';

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

let isSendProfile = false;
export const sendProfile = async (id, attribute, value) => {
  await patchProfile(id, attribute, value)
    .then(response => {
      if (response.data.success) {
        isSendProfile = true;
      } else {
        alert(response.data.message);
      }
    })
    .catch(function (error) {
      console.error(error);
    });

  return isSendProfile;
};
