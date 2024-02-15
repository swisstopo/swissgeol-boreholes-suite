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
