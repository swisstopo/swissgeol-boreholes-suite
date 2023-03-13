import { downloadFile, fetch } from "./index";

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

export function patchEditorSettings(tree, value, key = null) {
  const payload = {
    type: "EPATCH",
    tree: tree,
    value: value,
  };
  if (key !== null) {
    payload.key = key;
  }
  return fetch("/setting", payload);
}

export function exportDownload(params) {
  return downloadFile("/setting/export/download", params);
}
