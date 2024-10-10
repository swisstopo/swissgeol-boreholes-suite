import { fetch } from "./index";

export function loadSettings() {
  return fetch("/setting", {
    type: "GET",
  });
}

export function patchSettings(tree, value, key = null) {
  const payload = {
    type: "PATCH",
    tree: tree,
    value: value,
  };
  if (key !== null) {
    payload.key = key;
  }
  return fetch("/setting", payload);
}
