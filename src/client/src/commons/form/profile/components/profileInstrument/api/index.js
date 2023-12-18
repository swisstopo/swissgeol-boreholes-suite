import {
  getProfileLayers,
  createLayer,
  deleteLayer,
  getProfiles,
  createInstrument,
} from "../../../../../../api-lib/index";

import { createStratigraphy } from "../../../../../../api/fetchApiV2";

let stratigraphyId = null;
export const createNewStratigraphy = async (boreholeId, kindId) => {
  await createStratigraphy(boreholeId, kindId).then(response => {
    if (response) {
      stratigraphyId = response.data.id;
    } else {
      alert(response.statusText);
    }
  });

  return stratigraphyId;
};

let profiles = null;

export const getProfile = async (id, kind) => {
  await getProfiles(id, kind)
    .then(response => {
      if (response.data.success) {
        profiles = response.data.data;
      } else {
        alert(response.data.message);
      }
    })
    .catch(error => {
      console.error(error);
    });
  return profiles;
};

let data = [];
export const getData = async id => {
  await getProfileLayers(id, false)
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

let isCreatedInstrument = false;
export const createNewInstrument = async (instrumentId, stratigraphyId) => {
  await createInstrument(instrumentId, stratigraphyId)
    .then(response => {
      if (response.data.success) {
        isCreatedInstrument = true;
      } else {
        alert(response.data.message);
      }
    })
    .catch(error => {
      console.error(error);
    });
  return isCreatedInstrument;
};

let isCreatedLayer = false;
export const createNewLayer = async id => {
  await createLayer(id)
    .then(response => {
      if (response.data.success) {
        isCreatedLayer = true;
      } else {
        alert(response.data.message);
      }
    })
    .catch(error => {
      console.error(error);
    });
  return isCreatedLayer;
};

let isDeleted = false;
export const deletingLayer = async id => {
  await deleteLayer(id)
    .then(response => {
      if (response.data.success) {
        isDeleted = true;
      } else {
        alert(response.data.message);
      }
    })
    .catch(error => {
      console.error(error);
    });
  return isDeleted;
};
