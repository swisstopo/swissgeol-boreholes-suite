import {
  createBorehole,
  startBoreholeEditing,
  loginAsAdmin,
  handlePrompt,
} from "../helpers/testHelpers";
import {
  setInput,
  evaluateInput,
  evaluateTextarea,
  setSelect,
  evaluateSelect,
  toggleCheckbox,
  evaluateCheckbox,
  evaluateDisplayValue,
} from "../helpers/formHelpers";

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
  cy.get('[data-cy="add-completion-button"]').click({
    force: true,
  });
  cy.wait("@codelist_GET");
};

const startEditing = () => {
  toggleHeaderOpen();
  cy.get('[data-cy="edit-button"]').click({
    force: true,
  });
};

const cancelEditing = () => {
  cy.get('[data-cy="cancel-button"]').click({
    force: true,
  });
};

const saveChanges = () => {
  cy.get('[data-cy="save-button"]').click({
    force: true,
  });
  cy.wait("@get-completions-by-boreholeId");
};

const copyCompletion = () => {
  toggleHeaderOpen();
  cy.get('[data-cy="copy-button"]').click({
    force: true,
  });
};

const deleteCompletion = () => {
  toggleHeaderOpen();
  cy.get('[data-cy="delete-button"]').click({
    force: true,
  });
};

const setTab = index => {
  cy.get('[data-cy="completion-header-tab-' + index + '"]')
    .focus()
    .click({
      force: true,
    });
};

const isTabSelected = index => {
  cy.get('[data-cy="completion-header-tab-' + index + '"]')
    .invoke("attr", "aria-selected")
    .should("eq", "true");
};

describe("completion crud tests", () => {
  it("add, edit, copy and delete completions", () => {
    createBorehole({ "extended.original_name": "INTEADAL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/completion`);
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
    setInput("name", "Compl-1");
    setSelect("kindId", 1);
    cy.get('[data-cy="save-button"]').should("be.enabled");

    setInput("abandonDate", "2012-11-14");
    setInput("notes", "Lorem.");
    saveChanges();
    cy.contains("Compl-1");

    // copy completion
    copyCompletion();
    cy.wait("@get-completions-by-boreholeId");
    cy.contains("Compl-1");
    cy.contains("Compl-1 (Clone)");

    // edit completion
    startEditing();
    setSelect("kindId", 1);
    cancelEditing();
    cy.contains("telescopic");
    startEditing();
    setInput("name", "Compl-2");
    toggleCheckbox("isPrimary");
    saveChanges();
    cy.contains("Compl-2");
    startEditing();
    evaluateCheckbox("isPrimary", true);
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
    evaluateDisplayValue("mainCompletion", "Yes");
  });

  it("switch tabs", () => {
    var boreholeId;
    createBorehole({ "extended.original_name": "INTEADAL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      boreholeId = id;
      loginAsAdmin();
      cy.visit(`/editor/${id}/completion`);
    });
    cy.wait("@get-completions-by-boreholeId");
    cy.contains("No completion available");

    // start editing session
    startBoreholeEditing();

    // update url on cancel
    addCompletion();
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/editor/${boreholeId}/completion/new`);
      expect(location.hash).to.eq("");
    });
    cancelEditing();
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/editor/${boreholeId}/completion`);
      expect(location.hash).to.eq("");
    });

    // add completions
    addCompletion();
    setInput("name", "Compl-1");
    setSelect("kindId", 1);
    saveChanges();
    var completion1Id;
    cy.location().should(location => {
      completion1Id = location.pathname.split("/").pop();
      expect(location.pathname).to.eq(
        `/editor/${boreholeId}/completion/${completion1Id}`,
      );
      expect(location.hash).to.eq("#casing");
    });
    addCompletion();
    setInput("name", "Compl-2");
    setSelect("kindId", 1);
    saveChanges();
    var completion2Id;
    cy.location().should(location => {
      completion2Id = location.pathname.split("/").pop();
      expect(completion1Id).to.not.eq(completion2Id);
      expect(location.pathname).to.eq(
        `/editor/${boreholeId}/completion/${completion2Id}`,
      );
      expect(location.hash).to.eq("#casing");
    });
    isTabSelected(1);

    // check hash updates on tab switch
    cy.get("[data-cy=completion-content-header-tab-Instrumentation]").click();
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        `/editor/${boreholeId}/completion/${completion2Id}`,
      );
      expect(location.hash).to.eq("#instrumentation");
    });
    cy.get("[data-cy=completion-content-header-tab-Backfill]").click();
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        `/editor/${boreholeId}/completion/${completion2Id}`,
      );
      expect(location.hash).to.eq("#backfill");
    });

    // switch tabs
    // existing editing to other existing: no prompt should be displayed when no changes have been made
    startEditing();
    setTab(0);
    cy.get('[data-cy="prompt"]').should("not.exist");
    isTabSelected(0);
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        `/editor/${boreholeId}/completion/${completion1Id}`,
      );
      expect(location.hash).to.eq("#casing");
    });

    // existing editing to other existing: tab switching can be canceled in prompt
    startEditing();
    setInput("name", "Compl-1 updated");
    setTab(1);
    handlePrompt("Unsaved changes", "cancel");
    isTabSelected(0);
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        `/editor/${boreholeId}/completion/${completion1Id}`,
      );
      expect(location.hash).to.eq("#casing");
    });
    evaluateInput("name", "Compl-1 updated");

    // existing editing to other existing: changes can be reverted in prompt
    setTab(1);
    handlePrompt("Unsaved changes", "reset");
    isTabSelected(1);
    cy.contains("Compl-1");
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        `/editor/${boreholeId}/completion/${completion2Id}`,
      );
      expect(location.hash).to.eq("#casing");
    });

    // existing editing to other existing: changes can be saved in prompt
    startEditing();
    setInput("name", "Compl-2 updated");
    setTab(0);
    handlePrompt("Unsaved changes", "save");
    cy.wait("@get-completions-by-boreholeId");
    isTabSelected(0);
    cy.contains("Compl-2 updated");

    // new to existing: no prompt should be displayed when no changes have been made
    addCompletion();
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/editor/${boreholeId}/completion/new`);
      expect(location.hash).to.eq("");
    });
    cy.get(`[data-cy="name-formInput"]`).click();
    setTab(0);
    cy.wait("@casing_GET");
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        `/editor/${boreholeId}/completion/${completion1Id}`,
      );
      expect(location.hash).to.eq("#casing");
    });

    // new to existing: save option is disabled if form is invalid
    addCompletion();
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/editor/${boreholeId}/completion/new`);
      expect(location.hash).to.eq("");
    });
    setInput("name", "new completion");
    setTab(0);
    cy.get('[data-cy="prompt-button-save"]').should("be.disabled");
    handlePrompt("Unsaved changes", "cancel");

    // new to existing: changes can be reverted in prompt
    setSelect("kindId", 1);
    setTab(0);
    handlePrompt("Unsaved changes", "reset");
    cy.wait("@casing_GET");
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        `/editor/${boreholeId}/completion/${completion1Id}`,
      );
      expect(location.hash).to.eq("#casing");
    });
    cy.contains("new completion").should("not.exist");

    // new to existing: changes can be saved in prompt
    addCompletion();
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/editor/${boreholeId}/completion/new`);
      expect(location.hash).to.eq("");
    });
    setInput("name", "new completion");
    setSelect("kindId", 1);
    setTab(0);
    handlePrompt("Unsaved changes", "save");
    cy.wait("@casing_GET");
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        `/editor/${boreholeId}/completion/${completion1Id}`,
      );
      expect(location.hash).to.eq("#casing");
    });
    cy.contains("new completion").should("exist");

    setTab(2);
    deleteCompletion();
    handlePrompt("Do you really want to delete this completion?", "delete");

    // existing editing to new: no prompt should be displayed when no changes have been made, form should be reset
    setTab(0);
    startEditing();
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        `/editor/${boreholeId}/completion/${completion1Id}`,
      );
      expect(location.hash).to.eq("#casing");
    });
    cy.get(`[data-cy="name-formInput"]`).click();
    addCompletion();
    evaluateInput("name", "");
    evaluateSelect("kindId", "");
    evaluateInput("abandonDate", "");
    evaluateTextarea("notes", "");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/editor/${boreholeId}/completion/new`);
      expect(location.hash).to.eq("");
    });

    // existing editing to new: changes can be reverted in prompt
    setTab(0);
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        `/editor/${boreholeId}/completion/${completion1Id}`,
      );
      expect(location.hash).to.eq("#casing");
    });
    startEditing();
    setInput("name", "Reset compl-1");
    addCompletion();
    handlePrompt("Unsaved changes", "reset");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/editor/${boreholeId}/completion/new`);
      expect(location.hash).to.eq("");
    });
    cy.contains("Reset compl-1").should("not.exist");

    // existing editing to new: changes can be saved in prompt
    setTab(0);
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        `/editor/${boreholeId}/completion/${completion1Id}`,
      );
      expect(location.hash).to.eq("#casing");
    });
    startEditing();
    setInput("name", "Reset compl-1");
    addCompletion();
    handlePrompt("Unsaved changes", "save");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/editor/${boreholeId}/completion/new`);
      expect(location.hash).to.eq("");
    });
    cy.contains("Reset compl-1").should("exist");

    // cancel adding new completion: last tab should be selected
    cancelEditing();
    isTabSelected(1);
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        `/editor/${boreholeId}/completion/${completion2Id}`,
      );
      expect(location.hash).to.eq("#casing");
    });

    // should update to base url if last completion is deleted
    deleteCompletion();
    handlePrompt("Do you really want to delete this completion?", "delete");
    cy.location().should(location => {
      expect(location.pathname).to.eq(
        `/editor/${boreholeId}/completion/${completion1Id}`,
      );
      expect(location.hash).to.eq("#casing");
    });
    deleteCompletion();
    handlePrompt("Do you really want to delete this completion?", "delete");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/editor/${boreholeId}/completion`);
      expect(location.hash).to.eq("");
    });
  });
});
