import { fetch } from "./index";

export function acceptTerms(idTes) {
  return fetch("/terms", {
    type: "ACCEPT",
    id_tes: idTes,
  });
}

export function draftTerms(terms) {
  return fetch("/terms/admin", {
    action: "DRAFT",
    terms: terms,
  });
}

export function getTerms() {
  return fetch("/terms", {
    action: "GET",
  });
}

export function getTermsDraft() {
  return fetch("/terms/admin", {
    action: "GET",
  });
}

export function publishTerms() {
  return fetch("/terms/admin", {
    action: "PUBLISH",
  });
}
