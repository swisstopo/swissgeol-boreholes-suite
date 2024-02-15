import { fetch } from "./index";

// Fetch a single profile data
export function getProfile(id) {
  return fetch("/borehole/profile", {
    action: "GET",
    id: id,
  });
}

// Fetches the list of all layers of a specific profile
export function getProfileLayers(id, withValidation = false) {
  return fetch("/borehole/profile/layer", {
    action: "LIST",
    id: id,
    withValidation: withValidation,
  });
}

// Update the attributes of a single layer by its id, field name and value
export function patchProfile(id, field, value) {
  return fetch("/borehole/profile/edit", {
    action: "PATCH",
    id: id,
    field: field,
    value: value,
  });
}
