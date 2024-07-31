import { fetch } from "./index";

export function addIdentifier(borehole_id, identifier, value) {
  return fetch("/borehole/identifier/edit", {
    action: "ADD",
    id: borehole_id,
    cid: identifier,
    value: value,
  });
}

export function removeIdentifier(borehole_id, identifier) {
  return fetch("/borehole/identifier/edit", {
    action: "REMOVE",
    id: borehole_id,
    cid: identifier,
  });
}
