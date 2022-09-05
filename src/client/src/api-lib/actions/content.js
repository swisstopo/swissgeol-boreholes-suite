import { fetch } from "./index";

export function getContent(name) {
  return fetch("/content", {
    action: "GET",
    name: name,
  });
}

export function getContentDraft(name) {
  return fetch("/content/admin", {
    action: "GET",
    name: name,
  });
}

export function draftContent(name, content) {
  return fetch("/content/admin", {
    action: "DRAFT",
    name: name,
    content: content,
  });
}

export function publishContent(name) {
  return fetch("/content/admin", {
    action: "PUBLISH",
    name: name,
  });
}
