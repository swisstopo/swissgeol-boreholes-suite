import { fetch } from "./index";

// Create a new stratigraphy for the given borehole id
export function createStratigraphy(id, kind = null) {
  return fetch("/borehole/stratigraphy/edit", {
    action: "CREATE",
    id: id,
    kind: kind,
  });
}

export function deleteStratigraphy(id) {
  return fetch("/borehole/stratigraphy/edit", {
    action: "DELETE",
    id: id,
  });
}

// Create a new stratigraphy for the given borehole id
export function addBedrock(id) {
  return fetch("/borehole/stratigraphy/edit", {
    action: "ADDBEDROCK",
    id: id,
  });
}

export function getLayers(id) {
  return fetch("/borehole/stratigraphy/layer", {
    action: "LIST",
    id: id, // stratigrafy id
  });
}

// Create a new layer for the given stratigraphy id
export function createLayer(id) {
  return fetch("/borehole/stratigraphy/layer/edit", {
    action: "CREATE",
    id: id, // stratigraphy id
  });
}

// Create a new instruemnt for the given profile id
export function createInstrument(profile_id, casing_id = null) {
  return fetch("/borehole/stratigraphy/layer/edit", {
    action: "CREATE_INSTRUMENT",
    id: profile_id, // stratigraphy id
    casing: casing_id, // casing id
  });
}

// Create a new stratigraphy for the given borehole id
export function deleteLayer(id, process = 0, value = null) {
  /*
  process:
    - 0 : Just delete the layer
    - 1 : Spread previous level (base depth) to following level (top depth)
    - 2 : Spread following level top value to previous level base value
    - 3 : Adjust manually previous level base value and following
          level top value
  */
  return fetch("/borehole/stratigraphy/layer/edit", {
    action: "DELETE",
    id: id, // layer id,
    then: process,
    value: value,
  });
}

// Create a new stratigraphy for the given borehole id
export function gapLayer(id, process = 0, value = null) {
  /*
  process:
    - 0 : Just delete the layer
    - 1 : Spread previous level (base depth) to following level (top depth)
    - 2 : Spread following level top value to previous level base value
    - 3 : Adjust manually previous level base value and following
          level top value
  */
  return fetch("/borehole/stratigraphy/layer/edit", {
    action: "GAP",
    id: id, // layer id,
    then: process,
    value: value,
  });
}

export function patchLayer(id, field, value) {
  if (field === "layer_lithology_top_bedrock") {
    // Fixes discrepancy between field name in client and API.
    field = "lithology_top_bedrock";
  }
  return fetch("/borehole/stratigraphy/layer/edit", {
    action: "PATCH",
    id: id,
    field: field,
    value: value,
  });
}
