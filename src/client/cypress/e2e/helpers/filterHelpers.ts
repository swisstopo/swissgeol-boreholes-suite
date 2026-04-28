import { goToRouteAndAcceptTerms } from "../helpers/testHelpers.ts";

export function removeFirstMultiselectChip(filterKey: string) {
  cy.get(`[data-cy^="filter-chip-${filterKey}-"]`)
    .first()
    .within(() => {
      cy.get("svg").click();
    });
}

export function clickYesNoButton(fieldName: string, option: string) {
  const lowered = option.toLowerCase();
  const suffix = lowered === "yes" || lowered === "no" ? lowered : "np";
  cy.dataCy(`${fieldName}-button-${suffix}`).click();
}

// Codelist dropdowns with < 10 options render as toggle buttons. Pick the
// nth visible (enabled) button in render order.
export function clickDomainButtonByIndex(fieldName: string, index: number) {
  cy.get(`[data-cy^="${fieldName}-button-"]`).eq(index).scrollIntoView();
  cy.get(`[data-cy^="${fieldName}-button-"]`).eq(index).click();
}

// Autocomplete-backed text filters (originalName / projectName / name)
export function setAutocompleteText(fieldName: string, value: string) {
  cy.dataCy(`${fieldName}-formInput`).click();
  cy.focused().clear();
  cy.dataCy(`${fieldName}-formInput`).type(value, { delay: 10 });
  cy.get(`[data-cy^="${fieldName}-suggestion-"]`).should("have.length.at.least", 1);
  cy.get(`[data-cy^="${fieldName}-suggestion-"]`).first().click();
}

export function openFilter(filterTitle: string) {
  goToRouteAndAcceptTerms("/");
  cy.wait("@borehole_filter");
  cy.dataCy("show-filter-button").click();
  cy.contains(filterTitle).click();
}

export function checkFilterChipExistsAndRemove(filterName: string) {
  cy.dataCy(`filter-chip-${filterName}`).should("exist");
  cy.dataCy(`filter-chip-${filterName}`).within(() => {
    cy.get("svg").click();
  });
  cy.dataCy(`filter-chip-${filterName}`).should("not.exist");
}
