import { getHeight } from "./actions";

import { loadSettings, patchSettings } from "./actions/settings";

import { acceptTerms, draftTerms, getTerms, getTermsDraft, publishTerms } from "./actions/terms";

import { loadUser, setAuthentication, unsetAuthentication } from "./actions/user";

import {
  createBorehole,
  deleteBorehole,
  deleteBoreholes,
  getGeojson,
  loadBorehole,
  loadBoreholes,
  loadEditingBoreholes,
  lockBorehole,
  patchBorehole,
  patchBoreholes,
  unlockBorehole,
  updateBorehole,
} from "./actions/borehole";

import { addIdentifier, removeIdentifier } from "./actions/identifier";

import {
  loadWorkflows,
  patchWorkflow,
  rejectWorkflow,
  resetWorkflow,
  submitWorkflow,
  updateWorkflow,
} from "./actions/workflow";

import { createLayer, deleteLayer, gapLayer } from "./actions/stratigraphy";

import { getProfileLayers } from "./actions/profile";

import { loadDomains, patchCodeConfig } from "./actions/domains";

import { getWms } from "./actions/geoapi";

import store, { configureStore, createReducer, injectReducer } from "./reducers";

export {
  getHeight,
  loadSettings,
  patchSettings,
  acceptTerms,
  draftTerms,
  getTerms,
  getTermsDraft,
  publishTerms,
  setAuthentication,
  unsetAuthentication,
  loadUser,
  loadBorehole,
  updateBorehole,
  loadBoreholes,
  loadEditingBoreholes,
  createBorehole,
  lockBorehole,
  unlockBorehole,
  deleteBorehole,
  deleteBoreholes,
  patchBorehole,
  patchBoreholes,
  getGeojson,
  addIdentifier,
  removeIdentifier,
  loadWorkflows,
  patchWorkflow,
  updateWorkflow,
  submitWorkflow,
  rejectWorkflow,
  resetWorkflow,
  createLayer,
  deleteLayer,
  gapLayer,
  getProfileLayers,
  loadDomains,
  patchCodeConfig,
  getWms,

  // Reducers
  store,
  configureStore,
  createReducer,
  injectReducer,
};
