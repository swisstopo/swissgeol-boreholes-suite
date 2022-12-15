import { fetch, uploadFile } from "./index";

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

export function loadBoreholeIds(filter = undefined) {
  return fetch("/borehole/edit", {
    type: "IDS",
    filter: filter,
  });
}

export function getdBoreholeIds(filter = undefined) {
  return fetch("/borehole/edit", {
    action: "IDS",
    filter: filter,
  });
}

export function loadEditingBoreholes(
  page = undefined,
  limit = undefined,
  filter = undefined,
  orderby = null,
  direction = null,
) {
  return fetch("/borehole/edit", {
    type: "LIST",
    page: page,
    limit: limit,
    filter: filter,
    orderby: orderby,
    direction: direction,
  });
}

export function createBorehole(id = null) {
  return fetch("/borehole/edit", {
    action: "CREATE",
    id: id, // workgroup id
  });
}

export function copyBorehole(boreholeId, workgroupId) {
  return fetch("/borehole/edit", {
    action: "COPY",
    borehole: boreholeId,
    workgroup: workgroupId, // workgroup id
  });
}

export function importBoreholeList(id, file) {
  return uploadFile(
    "/borehole/edit/import",
    {
      action: "IMPORTCSV",
      id: id,
    },
    file,
  );
}

export function lockBorehole(id) {
  return fetch("/borehole/edit", {
    type: "LOCK",
    id: id, // project id
  });
}

export function unlockBorehole(id) {
  return fetch("/borehole/edit", {
    type: "UNLOCK",
    id: id, // project id
  });
}

export function editBorehole(id) {
  return fetch("/borehole/edit", {
    type: "EDIT",
    id: id, // project id
  });
}

export function patchBorehole(id, field, value) {
  return fetch("/borehole/edit", {
    action: "PATCH",
    id: id,
    field: field,
    value: value,
  });
}

export function patchBoreholes(ids, fields) {
  return fetch("/borehole/edit", {
    action: "MULTIPATCH",
    ids: ids,
    fields: fields,
  });
}

export function deleteBorehole(id) {
  return fetch("/borehole/edit", {
    action: "DELETE",
    id: id,
  });
}

export function deleteBoreholes(ids) {
  return fetch("/borehole/edit", {
    action: "DELETELIST",
    ids: ids,
  });
}

export function getBorehole(id) {
  return fetch("/borehole", {
    action: "GET",
    id: id,
  });
}

export function loadBorehole(id) {
  return fetch("/borehole", {
    type: "GET",
    id: id,
  });
}

export function updateBorehole(data) {
  return {
    path: "/borehole",
    type: "UPDATE",
    data: data,
  };
}

export function checkBorehole(attribute, text) {
  return fetch("/borehole/edit", {
    action: "CHECK",
    attribute: attribute,
    text: text,
  });
}

export function getGeojson(filter = {}) {
  // extent filter is not relevant for map features.
  delete filter.extent;
  return fetch("/borehole", {
    action: "GEOJSON",
    filter: filter,
  });
}

export function getBoreholeFiles(id) {
  return fetch("/borehole", {
    action: "LISTFILES",
    id: id,
  });
}

export function getEditorBoreholeFiles(id) {
  return fetch("/borehole/edit", {
    action: "LISTFILES",
    id: id,
  });
}

export function uploadBoreholeAttachment(id, file) {
  return uploadFile(
    "/borehole/edit/files",
    {
      action: "ATTACHFILE",
      id: id,
    },
    file,
  );
}

export function detachFile(id, file_id) {
  return fetch("/borehole/edit/files", {
    action: "DETACHFILE",
    id: id,
    file_id: file_id,
  });
}

export function patchFile(id, fid, field, value) {
  return fetch("/borehole/edit/files", {
    action: "PATCH",
    id: id,
    fid: fid,
    field: field,
    value: value,
  });
}
