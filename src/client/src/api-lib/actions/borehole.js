import { fetch } from "./index";

export function loadBoreholes(
  page = undefined,
  limit = undefined,
  filter = undefined,
  orderby = null,
  direction = null,
) {
  return fetch("/borehole", {
    type: "LIST",
    page: page,
    limit: limit,
    filter: filter,
    orderby: orderby,
    direction: direction,
  });
}

export function loadEditingBoreholes(
  page = undefined,
  limit = undefined,
  filter = undefined,
  orderby = null,
  direction = null,
  feature_ids = null,
) {
  return fetch("/borehole/edit", {
    type: "LIST",
    page: page,
    limit: limit,
    filter: filter,
    orderby: orderby,
    direction: direction,
    feature_ids: feature_ids,
  });
}

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

export function getGeojson(filter = {}) {
  return fetch("/borehole", {
    action: "GEOJSON",
    filter: filter,
  });
}
