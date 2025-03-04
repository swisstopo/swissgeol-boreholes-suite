import { createBaseSelector, getElementByDataCy } from "./testHelpers";

/**
 * Clicks on the save button and waits for borehole update.
 * @param {string} parent (optional) The parent of the button.
 */
export const saveWithSaveBar = parent => {
  // Count all 'borehole_by_id' requests before save button click to be able to separate requests 'borehole_by_id' requests triggered by the borehole update
  cy.get("@borehole_by_id.all").then(requests => {
    cy.wrap(requests.length).as("countBeforeSaveButton");
    cy.log("'borehole_by_id'-Requests before save button click: " + requests.length);
  });

  getElementByDataCy("save-bar-text").should("contain", "Unsaved changes");
  // Clicks save button
  saveForm(parent);

  // Verify one additional 'borehole_by_id' requests is made and awaited (statusCode 200) before the update request.
  cy.get("@countBeforeSaveButton").then(countBeforeSaveButton => {
    cy.get("@borehole_by_id.all")
      .should("have.length", countBeforeSaveButton + 1)
      .then(() => {
        cy.get(`@borehole_by_id.${countBeforeSaveButton + 1}`)
          .its("response.statusCode")
          .should("equal", 200);
      });
  });

  // Ensure the actual update request is processed
  cy.wait(["@update-borehole"]);
  getElementByDataCy("save-bar-text").should("contain", "Changes saved");
  getElementByDataCy("save-bar-text").should("not.exist");
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
  cy.get(".MuiCircularProgress-root").should("be.visible");
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
