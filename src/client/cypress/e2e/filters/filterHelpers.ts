import { goToRouteAndAcceptTerms } from "../helpers/testHelpers.ts";

export function removeFirstMultiselectChip(filterKey: string) {
  cy.get(`[data-cy^="filter-chip-${filterKey}-"]`)
    .first()
    .within(() => {
      cy.get("svg").click();
    });
}

export function clickYesNoButton(fieldName: string, option: string) {
  const suffix = option.toLowerCase() === "yes" ? "yes" : option.toLowerCase() === "no" ? "no" : "np";
  cy.dataCy(`${fieldName}-button-${suffix}`).click();
}

// Codelist dropdowns with < 12 options render as toggle buttons. Pick the
// nth visible (enabled) button in render order.
export function clickDomainButtonByIndex(fieldName: string, index: number) {
  cy.get(`[data-cy^="${fieldName}-button-"]`).eq(index).click();
}

// Autocomplete-backed text filters (originalName / projectName / name)
export function setAutocompleteText(fieldName: string, value: string) {
  cy.dataCy(`${fieldName}-formInput`).click();
  cy.focused().clear();
  cy.dataCy(`${fieldName}-formInput`).type(`${value}{enter}`, { delay: 10 });
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
