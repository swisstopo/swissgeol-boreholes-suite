import { createBaseSelector } from "./testHelpers";

/**
 * Clicks on the save button and waits for borehole update.
 * @param {string} parent (optional) The parent of the button.
 */
export const saveWithSaveBar = parent => {
  cy.dataCy("save-bar-text").should("contain", "Unsaved changes");
  saveForm(parent);

  cy.dataCy("save-bar-text").should("contain", "Changes saved");
  cy.dataCy("save-bar-text").should("not.exist");
};

export const verifyNoUnsavedChanges = () => {
  cy.get('[data-cy="save-button"]').should("be.disabled");
  cy.get('[data-cy="discardchanges-button"]').should("be.disabled");
  cy.contains("Unsaved changes").should("not.exist");
};

export const verifyUnsavedChanges = () => {
  cy.get('[data-cy="save-button"]').should("not.be.disabled");
  cy.get('[data-cy="discardchanges-button"]').should("not.be.disabled");
  cy.contains("Unsaved changes").should("exist");
};

/**
 * Clicks on the save button.
 * @param {string} parent (optional) The parent of the button.
 */
export const saveForm = parent => {
  const selector = createBaseSelector(parent) + '[data-cy="save-button"]';
  cy.get(selector).should("not.be.disabled");
  cy.get(selector).click({ force: true });
};
/**
 * Clicks on the discard button.
 * @param {string} parent (optional) The parent of the button.
 */
export const discardChanges = parent => {
  cy.contains("Unsaved changes");
  const selector = createBaseSelector(parent) + '[data-cy="discardchanges-button"]';
  cy.get(selector).should("not.be.disabled");
  cy.get(selector).click({ force: true });
};

/**
 * Clicks on the edit button.
 * @param {string} parent (optional) The parent of the button.
 */
export const startEditing = parent => {
  const selector = createBaseSelector(parent) + '[data-cy="edit-button"]';
  cy.get(selector).should("not.be.disabled");
  cy.get(selector).click({ force: true });
};

/**
 * Starts editing if editing is not already active, this method can be helpful during test development.
 * @param {string} parent (optional) The parent of the button.
 */

export const startEditingIfInactive = parent => {
  const selector = createBaseSelector(parent) + '[data-cy="edit-button"]';
  cy.get("body").then($body => {
    // Check if the button exists, is visible, and not disabled
    if ($body.find(selector).length && $body.find(selector).is(":visible") && !$body.find(selector).is(":disabled")) {
      cy.get(selector).click({ force: true });
    }
  });
};

/**
 * Clicks on the stop editing button.
 * @param {string} parent (optional) The parent of the button.
 */
export const stopEditing = parent => {
  const selector = createBaseSelector(parent) + '[data-cy="editingstop-button"]';
  cy.get(selector).should("not.be.disabled");
  cy.get(selector).click({ force: true });
};

/**
 * Clicks on the cancel button.
 * @param {string} parent (optional) The parent of the button.
 */
export const cancelEditing = parent => {
  const selector = createBaseSelector(parent) + '[data-cy="cancel-button"]';
  cy.get(selector).should("not.be.disabled");
  cy.get(selector).click({ force: true });
};

/**
 * Clicks on the delete button.
 * @param {string} parent (optional) The parent of the button.
 */
export const deleteItem = parent => {
  const selector = createBaseSelector(parent) + '[data-cy="delete-button"]';
  cy.get(selector).should("not.be.disabled");
  cy.get(selector).click({ force: true });
};

/**
 * Clicks on the Export button.
 * @param {string} parent (optional) The parent of the button.
 */
export const exportItem = parent => {
  const selector = createBaseSelector(parent) + '[data-cy="export-button"]';
  cy.get(selector).should("not.be.disabled");
  cy.get(selector).click({ force: true });
};

/**
 * Clicks on the JSON-export button.
 */
export const exportJsonItem = () => {
  exportFileType("json");
};

/**
 * Clicks on the CSV-export button.
 */
export const exportCSVItem = () => {
  exportFileType("csv");
};

/**
 * Clicks on the ZIP-export button.
 */
export const exportZipItem = () => {
  exportFileType("json + pdf");
};

/**
 * Clicks on the export button corresponding to the provided file type
 */
const exportFileType = fileType => {
  const selector = `[data-cy="${fileType}-button"]`;
  cy.get(selector).should("not.be.disabled");
  cy.get(selector).click({ force: true });
  cy.get(".MuiCircularProgress-root").should("exist");
  cy.get(".MuiCircularProgress-root").should("not.exist");
};
/**
 * Clicks on the copy button.
 * @param {string} parent (optional) The parent of the button.
 */
export const copyItem = parent => {
  const selector = createBaseSelector(parent) + '[data-cy="copy-button"]';
  cy.get(selector).should("not.be.disabled");
  cy.get(selector).click({ force: true });
};

/**
 * Clicks on the add button.
 * @param {string} itemLabel The label name of the button.
 */
export const addItem = itemLabel => {
  cy.get(".MuiCircularProgress-root").should("not.exist");
  const button = () => cy.get(`[data-cy="${itemLabel.toLowerCase()}-button"]`);
  button().scrollIntoView();
  button().should("be.visible");
  button().should("be.enabled");
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);
  button().click({ force: true });
  cy.get(".MuiCircularProgress-root").should("not.exist");
};

export const addStratigraphy = () => {
  cy.dataCy("addStratigraphy-button-select").scrollIntoView();
  cy.dataCy("addStratigraphy-button-select").click();
  cy.dataCy("addEmpty-button-select-item").click();
};
