import { createBaseSelector } from "./testHelpers";

/**
 * Clicks on the save button and waits for borehole update.
 * @param {string} parent (optional) The parent of the button.
 */
export const saveWithSaveBar = parent => {
  saveForm(parent);
  cy.wait(["@borehole_by_id", "@update-borehole"]);
  cy.contains("Changes saved").should("exist");
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
 */
export const exportItem = () => {
  const selector = '[data-cy="export-button"]';
  cy.get(selector).should("not.be.disabled");
  cy.get(selector).click({ force: true });
};

/**
 * Clicks on the JSON-export button.
 */
export const exportJsonItem = () => {
  const selector = '[data-cy="json-button"]';
  cy.get(selector).should("not.be.disabled");
  cy.get(selector).click({ force: true });
};

/**
 * Clicks on the CSV-export button.
 */
export const exportCSVItem = () => {
  const selector = '[data-cy="csv-button"]';
  cy.get(selector).should("not.be.disabled");
  cy.get(selector).click({ force: true });
};

/**
 * Clicks on the ZIP-export button.
 */
export const exportZipItem = () => {
  const selector = '[data-cy="json + pdf-button"]';
  cy.get(selector).should("not.be.disabled");
  cy.get(selector).click({ force: true });
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
  const button = cy.get(`[data-cy="${itemLabel.toLowerCase()}-button"]`);
  button.scrollIntoView();
  button.should("be.visible");
  button.should("be.enabled");
  button.click({ force: true });
  cy.wait(1000);
  cy.get(".MuiCircularProgress-root").should("not.exist");
};
