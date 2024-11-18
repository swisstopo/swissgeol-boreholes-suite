import { createBaseSelector } from "./testHelpers";

/**
 * Clicks on the save button and waits for borehole update.
 * @param {string} parent (optional) The parent of the button.
 */
export const saveLocationForm = parent => {
  saveForm(parent);
  cy.wait(["@borehole_by_id", "@update-borehole"]);
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
 * Clicks on the export button.
 * @param {string} parent (optional) The parent of the button.
 */
export const exportItem = parent => {
  const selector = createBaseSelector(parent) + '[data-cy="export-button"]';
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
