import { fetch } from "./index";

// Create a new layer for the given stratigraphy id
export function createLayer(id) {
  return fetch("/borehole/stratigraphy/layer/edit", {
    action: "CREATE",
    id: id, // stratigraphy id
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
