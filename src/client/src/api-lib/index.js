import { getHeight } from "./actions";

import { loadSettings, patchSettings } from "./actions/settings";

import { acceptTerms, draftTerms, getTerms, getTermsDraft, publishTerms } from "./actions/terms";

import {
  setAuthentication,
  unsetAuthentication,
  loadUser,
} from "./actions/user";

import {
  createWorkgroup,
  enableWorkgroup,
  disableWorkgroup,
  deleteWorkgroup,
  listWorkgroups,
  setRole,
  updateWorkgroup,
} from "./actions/workgroups";

import {
  updateBorehole,
  loadBorehole,
  loadBoreholes,
  getdBoreholeIds,
  loadEditingBoreholes,
  createBorehole,
  lockBorehole,
  unlockBorehole,
  deleteBorehole,
  deleteBoreholes,
  patchBorehole,
  patchBoreholes,
  getGeojson,
} from "./actions/borehole";

import { addIdentifier, removeIdentifier } from "./actions/identifier";

import {
  loadWorkflows,
  patchWorkflow,
  updateWorkflow,
  submitWorkflow,
  rejectWorkflow,
  resetWorkflow,
} from "./actions/workflow";

import { createLayer, deleteLayer, gapLayer } from "./actions/stratigraphy";

import { getProfileLayers } from "./actions/profile";

import { loadDomains, patchCodeConfig } from "./actions/domains";

import { getWms } from "./actions/geoapi";

import store, { injectReducer, configureStore, createReducer } from "./reducers";

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
  createWorkgroup,
  enableWorkgroup,
  disableWorkgroup,
  deleteWorkgroup,
  listWorkgroups,
  setRole,
  updateWorkgroup,
  loadBorehole,
  updateBorehole,
  loadBoreholes,
  loadEditingBoreholes,
  getdBoreholeIds,
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
