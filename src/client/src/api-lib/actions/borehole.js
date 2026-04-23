import { fetch } from "./index";

export function patchBoreholes(ids, fields) {
  return fetch("/borehole/edit", {
    action: "MULTIPATCH",
    ids: ids,
    fields: fields,
  });
}

export function deleteBoreholes(ids) {
  return fetch("/borehole/edit", {
    action: "DELETELIST",
    ids: ids,
  });
}
