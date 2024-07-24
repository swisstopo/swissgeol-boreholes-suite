import {
  createBorehole,
  createCompletion,
  handlePrompt,
  loginAsAdmin,
  startBoreholeEditing,
} from "../helpers/testHelpers";
import {
  evaluateCheckbox,
  evaluateDisplayValue,
  evaluateInput,
  evaluateSelect,
  evaluateTextarea,
  setInput,
  setSelect,
  toggleCheckbox,
} from "../helpers/formHelpers";
import { addItem, cancelEditing, copyItem, deleteItem, saveForm, startEditing } from "../helpers/buttonHelpers";

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
  addItem("addCompletion");
  cy.wait("@codelist_GET");
};

const startEditHeader = () => {
  toggleHeaderOpen();
  startEditing("completion-header");
};

const saveChanges = () => {
  saveForm("completion-header");
  cy.wait("@get-completions-by-boreholeId");
};

const copyCompletion = () => {
  toggleHeaderOpen();
  copyItem("completion-header");
};

const deleteCompletion = () => {
  toggleHeaderOpen();
  deleteItem("completion-header");
};

const setHeaderTab = index => {
  cy.get('[data-cy="completion-header-tab-' + index + '"]')
    .focus()
    .click({
      force: true,
    });
};

const isHeaderTabSelected = index => {
  cy.get('[data-cy="completion-header-tab-' + index + '"]')
    .invoke("attr", "aria-selected")
    .should("eq", "true");
};

export const setContentTab = tabName => {
  cy.get('[data-cy="completion-content-tab-' + tabName + '"]')
    .focus()
    .click({
      force: true,
    });
};

export const isContentTabSelected = tabName => {
  cy.get('[data-cy="completion-content-tab-' + tabName + '"]')
    .invoke("attr", "aria-selected")
    .should("eq", "true");
};

describe("completion crud tests", () => {
  it("adds, edits, copies and deletes completions", () => {
    createBorehole({ "extended.original_name": "INTEADAL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/${id}/completion`);
    });
    cy.wait("@get-completions-by-boreholeId");
    cy.contains("No completion available");

    startBoreholeEditing();
    cy.wait(500);

    // add completion
    addCompletion();
    cy.get('[data-cy="addCompletion-button"]').should("be.disabled");
    cy.contains("Not specified");
    cy.get('[data-cy="save-button"]').should("be.disabled");
    cy.get('[data-cy="cancel-button"]').should("be.enabled");
    cancelEditing();
    cy.get('[data-cy="addCompletion-button"]').should("be.enabled");
    cy.get('[data-cy="completion-header-tab-0"]').should("not.exist");

    addCompletion();
    cy.get('[data-cy="addCompletion-button"]').should("be.disabled");

    setInput("name", "Compl-1");
    setSelect("kindId", 2);
    cy.get('[data-cy="save-button"]').should("be.enabled");

    setInput("abandonDate", "2012-11-14");
    setInput("notes", "Lorem.");
    saveChanges();
    cy.contains("Compl-1");
    cy.get('[data-cy="addCompletion-button"]').should("be.enabled");

    // copy completion
    copyCompletion();
    cy.wait("@get-completions-by-boreholeId");
    cy.contains("Compl-1");
    cy.contains("Compl-1 (Clone)");

    // edit completion
    startEditHeader();
    setSelect("kindId", 3);
    cancelEditing();
    cy.contains("telescopic");
    startEditHeader();
    setInput("name", "Compl-2");
    toggleCheckbox("isPrimary");
    saveChanges();
    cy.contains("Compl-2");
    startEditHeader();
    evaluateCheckbox("isPrimary", "true");
    cancelEditing();

    // delete completion
    deleteCompletion();
    handlePrompt("Do you really want to delete this completion?", "Cancel");
    cy.contains("Compl-2");
    deleteCompletion();
    handlePrompt("Do you really want to delete this completion?", "Delete");
    cy.wait("@get-completions-by-boreholeId");
    cy.get('[data-cy="completion-header-tab-1"]').should("not.exist");
    isHeaderTabSelected(0);
    evaluateDisplayValue("mainCompletion", "Yes");
  });

  it("switches tabs", () => {
    var boreholeId;
    createBorehole({ "extended.original_name": "INTEADAL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      boreholeId = id;
      loginAsAdmin();
      cy.visit(`/${id}/completion`);
    });
    cy.wait("@get-completions-by-boreholeId");
    cy.contains("No completion available");

    // start editing session
    startBoreholeEditing();
    cy.wait(500);

    // update url on cancel
    addCompletion();
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/new`);
      expect(location.hash).to.eq("");
    });
    cancelEditing();
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion`);
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
      expect(location.pathname).to.eq(`/${boreholeId}/completion/${completion1Id}`);
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
      expect(location.pathname).to.eq(`/${boreholeId}/completion/${completion2Id}`);
      expect(location.hash).to.eq("#casing");
    });
    isHeaderTabSelected(1);

    // check hash updates on tab switch
    setContentTab("instrumentation");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/${completion2Id}`);
      expect(location.hash).to.eq("#instrumentation");
    });
    setContentTab("backfill");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/${completion2Id}`);
      expect(location.hash).to.eq("#backfill");
    });

    // switch tabs
    // existing editing to other existing: no prompt should be displayed when no changes have been made
    startEditHeader();
    cy.wait(500);
    setHeaderTab(0);
    cy.get('[data-cy="prompt"]').should("not.exist");
    isHeaderTabSelected(0);
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/${completion1Id}`);
      expect(location.hash).to.eq("#casing");
    });

    // existing editing to other existing: tab switching can be canceled in prompt
    startEditHeader();
    setInput("name", "Compl-1 updated");
    setHeaderTab(1);
    handlePrompt("Completion: Unsaved changes", "Cancel");
    isHeaderTabSelected(0);
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/${completion1Id}`);
      expect(location.hash).to.eq("#casing");
    });
    evaluateInput("name", "Compl-1 updated");

    // existing editing to other existing: changes can be reverted in prompt
    setHeaderTab(1);
    handlePrompt("Completion: Unsaved changes", "Reset");
    isHeaderTabSelected(1);
    cy.contains("Compl-1");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/${completion2Id}`);
      expect(location.hash).to.eq("#casing");
    });

    // existing editing to other existing: changes can be saved in prompt
    startEditHeader();
    setInput("name", "Compl-2 updated");
    setHeaderTab(0);
    handlePrompt("Completion: Unsaved changes", "Save");
    cy.wait("@get-completions-by-boreholeId");
    isHeaderTabSelected(0);
    cy.contains("Compl-2 updated");

    // new to existing: no prompt should be displayed when no changes have been made
    addCompletion();
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/new`);
      expect(location.hash).to.eq("");
    });
    cy.get(`[data-cy="name-formInput"]`).click();
    setHeaderTab(0);
    cy.wait("@casing_GET");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/${completion1Id}`);
      expect(location.hash).to.eq("#casing");
    });

    // new to existing: save option is disabled if form is invalid
    addCompletion();
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/new`);
      expect(location.hash).to.eq("");
    });
    setInput("name", "new completion");
    setHeaderTab(0);
    cy.get('[data-cy="prompt-button-Save"]').should("be.disabled");
    handlePrompt("Completion: Unsaved changes", "Cancel");

    // new to existing: changes can be reverted in prompt
    setSelect("kindId", 1);
    setHeaderTab(0);
    handlePrompt("Completion: Unsaved changes", "Reset");
    cy.wait("@casing_GET");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/${completion1Id}`);
      expect(location.hash).to.eq("#casing");
    });
    cy.contains("new completion").should("not.exist");

    // new to existing: changes can be saved in prompt
    addCompletion();
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/new`);
      expect(location.hash).to.eq("");
    });
    setInput("name", "new completion");
    setSelect("kindId", 1);
    setHeaderTab(0);
    handlePrompt("Completion: Unsaved changes", "Save");
    cy.wait("@casing_GET");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/${completion1Id}`);
      expect(location.hash).to.eq("#casing");
    });
    cy.contains("new completion").should("be.visible");

    setHeaderTab(2);
    deleteCompletion();
    handlePrompt("Do you really want to delete this completion?", "Delete");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/${completion2Id}`);
      expect(location.hash).to.eq("#casing");
    });

    // existing editing to new: no prompt should be displayed when no changes have been made, form should be reset
    setHeaderTab(0);
    cy.wait("@casing_GET");
    isHeaderTabSelected(0);
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/${completion1Id}`);
      expect(location.hash).to.eq("#casing");
    });
    startEditHeader();
    addCompletion();
    evaluateInput("name", "");
    evaluateSelect("kindId", "");
    evaluateInput("abandonDate", "");
    evaluateTextarea("notes", "");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/new`);
      expect(location.hash).to.eq("");
    });

    // existing editing to new: changes can be reverted in prompt
    setHeaderTab(0);
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/${completion1Id}`);
      expect(location.hash).to.eq("#casing");
    });
    startEditHeader();
    setInput("name", "Reset compl-1");
    addCompletion();
    handlePrompt("Completion: Unsaved changes", "Reset");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/new`);
      expect(location.hash).to.eq("");
    });
    cy.contains("Reset compl-1").should("not.exist");

    // existing editing to new: changes can be saved in prompt
    setHeaderTab(0);
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/${completion1Id}`);
      expect(location.hash).to.eq("#casing");
    });
    startEditHeader();
    setInput("name", "Reset compl-1");
    addCompletion();
    handlePrompt("Completion: Unsaved changes", "Save");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/new`);
      expect(location.hash).to.eq("");
    });
    cy.contains("Reset compl-1").should("be.visible");

    // cancel adding new completion: last tab should be selected
    cancelEditing();
    isHeaderTabSelected(1);
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/${completion2Id}`);
      expect(location.hash).to.eq("#casing");
    });

    // should update to base url if last completion is deleted
    deleteCompletion();
    handlePrompt("Do you really want to delete this completion?", "Delete");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion/${completion1Id}`);
      expect(location.hash).to.eq("#casing");
    });
    deleteCompletion();
    handlePrompt("Do you really want to delete this completion?", "Delete");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/completion`);
      expect(location.hash).to.eq("");
    });
  });

  it("checks completion content validation", () => {
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => createCompletion("Compl-1", id, 16000001, true))
      .then(response => {
        expect(response).to.be.above(0);
      });

    // open completion editor
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/${id}/completion`);
    });
    cy.wait("@get-completions-by-boreholeId");

    // start editing session
    startBoreholeEditing();

    // cancel switching content tabs
    cy.wait(1000);
    addItem("addCasing");
    cy.wait("@codelist_GET");
    setInput("name", "casing 1", "casing-card.0.edit");
    setInput("casingElements.0.fromDepth", "0");
    setInput("casingElements.0.toDepth", "10");
    setSelect("casingElements.0.kindId", 2);
    setContentTab("instrumentation");
    handlePrompt("Casing: Unsaved changes", "Cancel");
    isContentTabSelected("casing");

    // reset when switching content tabs
    setContentTab("instrumentation");
    handlePrompt("Casing: Unsaved changes", "Reset");
    isContentTabSelected("instrumentation");
    setContentTab("casing");
    cy.wait("@casing_GET");
    cy.get('[data-cy="casing-card.0"]').should("not.exist");

    // save when switching content tabs
    cy.wait(1000);
    addItem("addCasing");
    cy.wait("@codelist_GET");
    setInput("name", "casing 1", "casing-card.0.edit");
    setInput("casingElements.0.fromDepth", "0");
    setInput("casingElements.0.toDepth", "10");
    setSelect("casingElements.0.kindId", 2);
    setContentTab("backfill");
    handlePrompt("Casing: Unsaved changes", "Save");
    isContentTabSelected("backfill");
    setContentTab("casing");
    cy.contains("casing 1").should("be.visible");

    // cancel switching header tabs when content changes are present
    setContentTab("backfill");
    cy.wait("@backfill_GET");
    cy.wait(1000);
    addItem("addBackfill");
    cy.wait("@casing_GET");
    setInput("fromDepth", 0);
    setInput("toDepth", 10);
    setSelect("kindId", 1);
    setSelect("materialId", 1);

    addCompletion();
    handlePrompt("Sealing/Backfilling: Unsaved changes", "Cancel");
    isHeaderTabSelected(0);
    isContentTabSelected("backfill");

    // reset content changes when switching header tabs
    addCompletion();
    handlePrompt("Sealing/Backfilling: Unsaved changes", "Reset");
    isHeaderTabSelected(1);
    cancelEditing();
    setContentTab("backfill");
    cy.wait("@backfill_GET");
    cy.get('[data-cy="backfill-card.0"]').should("not.exist");

    // save content changes when switching header tabs
    cy.wait(1000);
    addItem("addBackfill");
    cy.wait("@casing_GET");
    setInput("fromDepth", 0);
    setInput("toDepth", 10);
    setSelect("kindId", 1);
    setSelect("materialId", 1);
    addCompletion();
    handlePrompt("Sealing/Backfilling: Unsaved changes", "Save");
    isHeaderTabSelected(1);
    cancelEditing();
    setContentTab("backfill");
    cy.wait("@backfill_GET");
    cy.get('[data-cy="backfill-card.0"]').should("be.visible");

    // cancel header changes, no prompt should be displayed for content changes because tab switching was already canceled
    setContentTab("instrumentation");
    cy.wait("@instrumentation_GET");
    cy.wait(1000);
    addItem("addInstrument");
    cy.wait("@casing_GET");
    setInput("fromDepth", "0");
    setInput("toDepth", "10");
    setInput("name", "Inst-1");
    setSelect("kindId", 2);
    setSelect("statusId", 1);

    startEditHeader();
    setInput("name", "Compl-1 updated", "completion-header");
    addCompletion();
    handlePrompt("Completion: Unsaved changes", "Cancel");
    cy.get('[data-cy="prompt"]').should("not.exist");
    isHeaderTabSelected(0);
    isContentTabSelected("instrumentation");
    evaluateInput("fromDepth", "0");
    evaluateInput("toDepth", "10");
    evaluateInput("name", "Compl-1 updated", "completion-header");

    // reset header changes, cancel content changes
    addCompletion();
    handlePrompt("Completion: Unsaved changes", "Reset");
    cy.wait(1000);
    handlePrompt("Instrumentation: Unsaved changes", "Cancel");
    isHeaderTabSelected(0);
    isContentTabSelected("instrumentation");
    evaluateInput("fromDepth", "0");
    evaluateInput("toDepth", "10");
    evaluateDisplayValue("name", "Compl-1", "completion-header");

    // reset header changes, reset content changes
    startEditHeader();
    setInput("name", "Compl-1 updated", "completion-header");
    addCompletion();
    handlePrompt("Completion: Unsaved changes", "Reset");
    cy.wait(1000);
    handlePrompt("Instrumentation: Unsaved changes", "Reset");
    isHeaderTabSelected(1);
    setHeaderTab(0);
    evaluateDisplayValue("name", "Compl-1", "completion-header");
    setContentTab("instrumentation");
    cy.wait("@instrumentation_GET");
    cy.get('[data-cy="instrumentation-card.0"]').should("not.exist");

    //reset header changes, save content changes
    cy.wait(1000);
    addItem("addInstrument");
    cy.wait("@casing_GET");
    setInput("fromDepth", "0");
    setInput("toDepth", "10");
    setInput("name", "Inst-1");
    setSelect("kindId", 2);
    setSelect("statusId", 1);
    startEditHeader();
    setInput("name", "Compl-1 updated", "completion-header");
    addCompletion();
    handlePrompt("Completion: Unsaved changes", "Reset");
    cy.wait(1000);
    handlePrompt("Instrumentation: Unsaved changes", "Save");
    isHeaderTabSelected(1);
    setHeaderTab(0);
    evaluateDisplayValue("name", "Compl-1", "completion-header");
    setContentTab("instrumentation");
    cy.get('[data-cy="instrumentation-card.0"]').should("be.visible");

    // save header changes, cancel content changes
    startEditing("instrumentation-card.0");
    cy.wait("@casing_GET");
    setInput("notes", "Lorem.");
    startEditHeader();
    setInput("name", "Compl-1 updated", "completion-header");
    addCompletion();
    handlePrompt("Completion: Unsaved changes", "Save");
    cy.wait(1000);
    handlePrompt("Instrumentation: Unsaved changes", "Cancel");
    isHeaderTabSelected(0);
    isContentTabSelected("instrumentation");
    evaluateTextarea("notes", "Lorem.");
    evaluateDisplayValue("name", "Compl-1 updated", "completion-header");

    // save header changes, reset content changes
    startEditHeader();
    setInput("name", "Compl-1 updated again", "completion-header");
    addCompletion();
    handlePrompt("Completion: Unsaved changes", "Save");
    cy.wait(1000);
    handlePrompt("Instrumentation: Unsaved changes", "Reset");
    isHeaderTabSelected(1);
    setHeaderTab(0);
    evaluateDisplayValue("name", "Compl-1 updated again", "completion-header");
    setContentTab("instrumentation");
    cy.wait("@instrumentation_GET");
    evaluateDisplayValue("notes", "-");

    // save header changes, save content changes
    cy.get('[data-cy="instrumentation-card.0"]').should("be.visible");
    startEditing("instrumentation-card.0");
    cy.wait("@casing_GET");
    setInput("notes", "Lorem.");
    startEditHeader();
    setInput("name", "Compl-1 updated again and again", "completion-header");
    addCompletion();
    handlePrompt("Completion: Unsaved changes", "Save");
    cy.wait(1000);
    handlePrompt("Instrumentation: Unsaved changes", "Save");
    isHeaderTabSelected(1);
    setHeaderTab(0);
    evaluateDisplayValue("name", "Compl-1 updated again and again", "completion-header");
    setContentTab("instrumentation");
    evaluateDisplayValue("notes", "Lorem.");
  });

  it("checks if hash is preserved when reloading", () => {
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => {
        createCompletion("test hash 1", id, 16000002, true).as("completion1_id");
        createCompletion("test hash 2", id, 16000002, true).as("completion2_id");
      });

    const forceReload = true;

    cy.get("@borehole_id").then(id => {
      cy.get("@completion1_id").then(completion1Id => {
        // Preserves hash when reloading
        cy.visit(`/${id}/completion/${completion1Id}`);
        cy.location().should(location => {
          expect(location.hash).to.eq("#casing");
        });
        cy.reload(forceReload);
        cy.location().should(location => {
          expect(location.pathname).to.eq(`/${id}/completion/${completion1Id}`);
          expect(location.hash).to.eq("#casing");
        });
        setContentTab("instrumentation");
        cy.location().should(location => {
          expect(location.pathname).to.eq(`/${id}/completion/${completion1Id}`);
          expect(location.hash).to.eq("#instrumentation");
        });
        cy.reload(forceReload);
        cy.location().should(location => {
          expect(location.pathname).to.eq(`/${id}/completion/${completion1Id}`);
          expect(location.hash).to.eq("#instrumentation");
        });
        // Resets hash from #instrumentation to #casing when switching to another completion
        cy.contains("test hash 2").click();
        cy.wait("@get-casings-by-completionId");
        cy.get("@completion2_id").then(completion2Id => {
          cy.location().should(location => {
            expect(location.pathname).to.eq(`/${id}/completion/${completion2Id}`);
            expect(location.hash).to.eq("#casing");
          });
        });
      });
    });
  });
});
