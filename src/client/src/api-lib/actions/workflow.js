import { fetch } from "./index";

export function loadWorkflows(id) {
  return fetch("/workflow/edit", {
    type: "LIST",
    id: id,
  });
}

export function updateWorkflow(field, value) {
  return {
    path: "/workflow/edit",
    type: "UPDATE",
    field: field,
    value: value,
  };
}

export function patchWorkflow(id, field, value) {
  return fetch("/workflow/edit", {
    type: "PATCH",
    id: id,
    field: field,
    value: value,
  });
}

export function submitWorkflow(id, online = false) {
  return fetch("/workflow/edit", {
    type: "SUBMIT",
    id: id,
    online: online,
  });
}

export function rejectWorkflow(id) {
  return fetch("/workflow/edit", {
    type: "REJECT",
    id: id,
  });
}

export function resetWorkflow(id) {
  return fetch("/workflow/edit", {
    type: "RESET",
    id: id,
  });
}
