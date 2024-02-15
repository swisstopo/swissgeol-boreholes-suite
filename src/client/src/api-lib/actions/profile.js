import { fetch } from "./index";

// Fetches the list of all layers of a specific profile
export function getProfileLayers(id, withValidation = false) {
  return fetch("/borehole/profile/layer", {
    action: "LIST",
    id: id,
    withValidation: withValidation,
  });
}
