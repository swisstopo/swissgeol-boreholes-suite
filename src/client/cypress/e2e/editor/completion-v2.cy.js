import {
  createBorehole,
  startBoreholeEditing,
  loginAsAdmin,
  openDropdown,
  selectDropdownOption,
} from "../testHelpers";

const toggleHeaderOpen = () => {
  cy.get('[data-cy="completion-header-display"]')
    .invoke("attr", "aria-expanded")
    .then(expanded => {
      if (expanded === "false") {
        cy.get('[data-cy="completion-toggle-header"]').click();
      }
    });
};

const addCompletion = () => {
  cy.get('[data-cy="add-completion-button"]').click();
};

const startEditing = () => {
  toggleHeaderOpen();
  cy.get('[data-cy="edit-button"]').click();
};

const cancelEditing = () => {
  cy.get('[data-cy="cancel-button"]').click();
};

const saveChanges = () => {
  cy.get('[data-cy="save-button"]').click();
  cy.wait("@get-completions-by-boreholeId");
};

const copyCompletion = () => {
  toggleHeaderOpen();
  cy.get('[data-cy="copy-button"]').click();
};

const deleteCompletion = () => {
  toggleHeaderOpen();
  cy.get('[data-cy="delete-button"]').click();
};

const setTextfield = (selector, text) => {
  cy.get(selector)
    .click()
    .then(() => {
      cy.focused().clear();
      cy.get(selector).type(text, {
        delay: 10,
      });
    });
};

const setName = name => {
  setTextfield('[data-cy="completion-name-textfield"]', name);
};

const setAbandonDate = date => {
  setTextfield('[data-cy="completion-abandon-date-textfield"]', date);
};

const setNotes = notes => {
  setTextfield('[data-cy="completion-notes-textfield"]', notes);
};

const setKindId = index => {
  openDropdown("completion-kind-id-select");
  selectDropdownOption(index);
};

const setIsPrimary = () => {
  cy.get('[data-cy="completion-is-primary-checkbox"]').click();
};

const checkIsPrimary = isPrimary => {
  var checked = isPrimary ? "true" : "false";
  cy.get('[data-cy="completion-is-primary-checkbox"]')
    .invoke("attr", "aria-disabled")
    .should("eq", checked);
};

const setTab = index => {
  cy.get('[data-cy="completion-header-tab-' + index + '"]').click();
};

const isTabSelected = index => {
  cy.get('[data-cy="completion-header-tab-' + index + '"]')
    .invoke("attr", "aria-selected")
    .should("eq", "true");
};

const handlePrompt = (title, action) => {
  cy.get('[data-cy="prompt"]').should("exist");
  cy.contains(title);
  cy.get('[data-cy="prompt-button-' + action + '"]').click();
};

describe("completion crud tests", () => {
  it("add, edit, copy and delete completions", () => {
    createBorehole({ "extended.original_name": "INTEADAL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/completion/v2`);
    });
    cy.wait("@get-completions-by-boreholeId");
    cy.contains("No completion available");

    startBoreholeEditing();

    // add completion
    addCompletion();
    cy.contains("Not specified");
    cy.get('[data-cy="save-button"]').should("be.disabled");
    cy.get('[data-cy="cancel-button"]').should("be.enabled");
    cancelEditing();
    cy.get('[data-cy="completion-header-tab-0"]').should("not.exist");

    addCompletion();
    setName("Compl-1");
    setKindId(2);
    cy.get('[data-cy="save-button"]').should("be.enabled");

    setAbandonDate("2012-11-14T12:06");
    setNotes("Lorem.");
    saveChanges();
    cy.contains("Compl-1");

    // copy completion
    copyCompletion();
    cy.wait("@get-completions-by-boreholeId");
    cy.contains("Compl-1");
    cy.contains("Compl-1 (Clone)");

    // edit completion
    startEditing();
    setKindId(1);
    cancelEditing();
    cy.contains("telescopic");
    startEditing();
    setName("Compl-2");
    setIsPrimary();
    saveChanges();
    cy.contains("Compl-2");
    startEditing();
    checkIsPrimary(true);
    cancelEditing();

    // delete completion
    deleteCompletion();
    handlePrompt("Do you really want to delete this completion?", "cancel");
    cy.contains("Compl-2");
    deleteCompletion();
    handlePrompt("Do you really want to delete this completion?", "delete");
    cy.wait("@get-completions-by-boreholeId");
    cy.get('[data-cy="completion-header-tab-1"]').should("not.exist");
    isTabSelected(0);
    cy.get('[data-cy="completion-is-primary-value"]').should("contain", "Yes");
  });

  it("switch tabs", () => {
    createBorehole({ "extended.original_name": "INTEADAL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/completion/v2`);
    });
    cy.wait("@get-completions-by-boreholeId");
    cy.contains("No completion available");

    // start editing session
    startBoreholeEditing();

    // add completions
    addCompletion();
    setName("Compl-1");
    setKindId(1);
    saveChanges();
    addCompletion();
    setName("Compl-2");
    setKindId(1);
    saveChanges();
    isTabSelected(1);

    //switch tabs
    startEditing();
    setTab(0);
    cy.get('[data-cy="prompt"]').should("not.exist");
    isTabSelected(0);

    startEditing();
    setName("Compl-1 updated");
    setTab(1);
    handlePrompt("Unsaved changes", "cancel");
    isTabSelected(0);
    cy.contains("Compl-1 updated");
    setTab(1);
    handlePrompt("Unsaved changes", "reset");
    isTabSelected(1);
    cy.contains("Compl-1");

    startEditing();
    setName("Compl-2 updated");
    setTab(0);
    handlePrompt("Unsaved changes", "save");
    cy.wait("@get-completions-by-boreholeId");
    isTabSelected(0);
    cy.contains("Compl-2 updated");
  });
});
