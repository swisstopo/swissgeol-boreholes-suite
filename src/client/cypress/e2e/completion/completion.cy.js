import { addItem, cancelEditing, copyItem, deleteItem, saveForm, startEditing } from "../helpers/buttonHelpers";
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
import {
  createBorehole,
  createCompletion,
  goToRouteAndAcceptTerms,
  handlePrompt,
  startBoreholeEditing,
} from "../helpers/testHelpers";

const toggleHeaderOpen = () => {
  cy.get('[data-cy="completion-header-display"]')
    .invoke("attr", "aria-expanded")
    .then(expanded => {
      if (expanded === "false") {
        cy.get('[data-cy="completion-toggle-header"]').click();
      }
    });
};

const createBoreholeWithTwoCompletions = () => {
  return createBorehole({ "extended.original_name": "INTEADAL" }).then(boreholeId => {
    cy.wrap(boreholeId).as("boreholeId");
    createCompletion("Compl-1", boreholeId, 16000002, true).as("completion1Id");
    createCompletion("Compl-2", boreholeId, 16000002, false).as("completion2Id");
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

const assertLocationAndHash = (boreholeId, completionId, hash) => {
  cy.location().should(location => {
    expect(location.pathname).to.eq(`/${boreholeId}/completion/${completionId}`);
    expect(location.hash).to.eq(hash);
  });
};

const assertNewCompletionCreated = boreholeId => {
  assertLocationAndHash(boreholeId, "new", "");
  cy.contains("Not specified").should("be.visible");
};

describe("completion crud tests", () => {
  it("adds, edits, copies and deletes completions", () => {
    createBorehole({ "extended.original_name": "INTEADAL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}/completion`);
    });
    cy.wait("@get-completions-by-boreholeId");
    cy.contains("No completion available");

    startBoreholeEditing();
    cy.wait(500);

    // add completion
    addCompletion();
    assertNewCompletionCreated(id);
    cy.get('[data-cy="addcompletion-button"]').should("be.disabled");
    cy.get('[data-cy="save-button"]').should("be.disabled");
    cy.get('[data-cy="cancel-button"]').should("be.enabled");
    cancelEditing();
    cy.get('[data-cy="addcompletion-button"]').should("be.enabled");
    cy.get('[data-cy="completion-header-tab-0"]').should("not.exist");

    addCompletion();
    assertNewCompletionCreated(id);
    cy.get('[data-cy="addcompletion-button"]').should("be.disabled");

    setInput("name", "Compl-1");
    setSelect("kindId", 1);
    cy.get('[data-cy="save-button"]').should("be.enabled");

    setInput("abandonDate", "2012-11-14");
    setInput("notes", "Lorem.");
    saveChanges();
    cy.wait("@backfill_GET");
    cy.contains("Compl-1");
    cy.get('[data-cy="addcompletion-button"]').should("be.enabled");

    // copy completion
    copyCompletion();
    cy.wait("@get-completions-by-boreholeId");
    cy.contains("Compl-1");
    cy.contains("Compl-1 (Clone)");
    // The casing request is triggered twice; once for the original completion and once for the copied. We have to await
    // both to make sure that the UI has completed loading. Otherwise, the header cannot yet be toggled open.
    cy.wait(["@casing_GET", "@casing_GET", "@backfill_GET", "@backfill_GET"]);

    // edit completion
    startEditHeader();
    setSelect("kindId", 2);
    cancelEditing();
    cy.contains("telescopic");
    startEditHeader();
    setInput("name", "Compl-2");
    toggleCheckbox("isPrimary");
    saveChanges();
    cy.wait("@backfill_GET");
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
    cy.wait(["@get-completions-by-boreholeId", "@backfill_GET", "@backfill_GET"]);
    cy.get('[data-cy="completion-header-tab-1"]').should("not.exist");
    isHeaderTabSelected(0);
    evaluateDisplayValue("mainCompletion", "Yes");
  });

  it("starts and cancels new completion", () => {
    createBoreholeWithTwoCompletions();
    cy.get("@boreholeId").then(boreholeId => {
      cy.get("@completion2Id").then(completion2Id => {
        goToRouteAndAcceptTerms(`/${boreholeId}/completion/${completion2Id}`);
        cy.wait("@get-completions-by-boreholeId");
        startBoreholeEditing();
        cy.wait(500);

        addCompletion();
        assertNewCompletionCreated(boreholeId);
        cancelEditing();
        // last completion should be selected when cancelling adding completion
        isHeaderTabSelected(1);
        assertLocationAndHash(boreholeId, completion2Id, "#casing");
      });
    });
  });

  it("verifies hash for completions", () => {
    createBoreholeWithTwoCompletions();
    cy.get("@boreholeId").then(boreholeId => {
      cy.get("@completion1Id").then(completion1Id => {
        cy.get("@completion2Id").then(completion2Id => {
          goToRouteAndAcceptTerms(`/${boreholeId}/completion/${completion1Id}`);
          assertLocationAndHash(boreholeId, completion1Id, "#casing");
          goToRouteAndAcceptTerms(`/${boreholeId}/completion/${completion2Id}`);
          assertLocationAndHash(boreholeId, completion2Id, "#casing");
          isHeaderTabSelected(1);
          // check hash updates on tab switch
          setContentTab("instrumentation");
          assertLocationAndHash(boreholeId, completion2Id, "#instrumentation");
          setContentTab("backfill");
          assertLocationAndHash(boreholeId, completion2Id, "#backfill");
        });
      });
    });
  });

  it("switches tabs between existing completions", () => {
    createBoreholeWithTwoCompletions();
    cy.get("@boreholeId").then(boreholeId => {
      cy.get("@completion1Id").then(completion1Id => {
        cy.get("@completion2Id").then(completion2Id => {
          goToRouteAndAcceptTerms(`/${boreholeId}/completion/${completion2Id}`);
          assertLocationAndHash(boreholeId, completion2Id, "#casing");
          startBoreholeEditing();
          // existing editing to other existing: no prompt should be displayed when no changes have been made
          startEditHeader();
          cy.wait(500);
          setHeaderTab(0);
          cy.get('[data-cy="prompt"]').should("not.exist");
          isHeaderTabSelected(0);
          assertLocationAndHash(boreholeId, completion1Id, "#casing");

          // existing editing to other existing: tab switching can be canceled in prompt
          startEditHeader();
          setInput("name", "Compl-1 updated");
          setHeaderTab(1);
          handlePrompt("Completion: You have unsaved changes. How would you like to proceed?", "Cancel");
          isHeaderTabSelected(0);
          assertLocationAndHash(boreholeId, completion1Id, "#casing");
          evaluateInput("name", "Compl-1 updated");

          // existing editing to other existing: changes can be reverted in prompt
          setHeaderTab(1);
          handlePrompt("Completion: You have unsaved changes. How would you like to proceed?", "Reset");
          isHeaderTabSelected(1);
          cy.contains("Compl-1");
          assertLocationAndHash(boreholeId, completion2Id, "#casing");

          // existing editing to other existing: changes can be saved in prompt
          startEditHeader();
          setInput("name", "Compl-2 updated");
          setHeaderTab(0);
          handlePrompt("Completion: You have unsaved changes. How would you like to proceed?", "Save");
          cy.wait("@get-completions-by-boreholeId");
          isHeaderTabSelected(0);
          cy.contains("Compl-2 updated");
        });
      });
    });
  });

  it("switches tabs between new and existing completions", () => {
    createBoreholeWithTwoCompletions();
    cy.get("@boreholeId").then(boreholeId => {
      cy.get("@completion1Id").then(completion1Id => {
        cy.get("@completion2Id").then(completion2Id => {
          goToRouteAndAcceptTerms(`/${boreholeId}/completion/${completion2Id}`);
          startBoreholeEditing();

          // new to existing: no prompt should be displayed when no changes have been made
          addCompletion();
          assertNewCompletionCreated(boreholeId);
          cy.get(`[data-cy="name-formInput"]`).click();
          setHeaderTab(0);
          cy.wait("@casing_GET");
          assertLocationAndHash(boreholeId, completion1Id, "#casing");

          // new to existing: save option is disabled if form is invalid
          addCompletion();
          assertNewCompletionCreated(boreholeId);
          setInput("name", "new completion");
          setHeaderTab(0);
          cy.get('[data-cy="prompt"]').find('[data-cy="save-button"]').should("be.disabled");
          handlePrompt("Completion: You have unsaved changes. How would you like to proceed?", "Cancel");

          // new to existing: changes can be reverted in prompt
          setSelect("kindId", 1);
          setHeaderTab(0);
          handlePrompt("Completion: You have unsaved changes. How would you like to proceed?", "Reset");
          cy.wait("@casing_GET");
          assertLocationAndHash(boreholeId, completion1Id, "#casing");
          cy.contains("new completion").should("not.exist");

          // new to existing: changes can be saved in prompt
          addCompletion();
          assertNewCompletionCreated(boreholeId);
          setInput("name", "new completion");
          setSelect("kindId", 1);
          setHeaderTab(0);
          handlePrompt("Completion: You have unsaved changes. How would you like to proceed?", "Save");
          cy.wait("@casing_GET");

          assertLocationAndHash(boreholeId, completion1Id, "#casing");
          cy.contains("new completion").should("be.visible");

          setHeaderTab(2);
          deleteCompletion();
          handlePrompt("Do you really want to delete this completion?", "Delete");
          assertLocationAndHash(boreholeId, completion2Id, "#casing");

          // existing editing to new: no prompt should be displayed when no changes have been made, form should be reset
          setHeaderTab(0);
          cy.wait("@casing_GET");
          isHeaderTabSelected(0);
          assertLocationAndHash(boreholeId, completion1Id, "#casing");
          startEditHeader();
          addCompletion();
          assertNewCompletionCreated(boreholeId);
          evaluateInput("name", "");
          evaluateSelect("kindId", "");
          evaluateInput("abandonDate", "");
          evaluateTextarea("notes", "");

          // existing editing to new: changes can be reverted in prompt
          setHeaderTab(0);
          assertLocationAndHash(boreholeId, completion1Id, "#casing");
          startEditHeader();
          setInput("name", "Reset compl-1");
          addCompletion();
          handlePrompt("Completion: You have unsaved changes. How would you like to proceed?", "Reset");
          assertNewCompletionCreated(boreholeId);
          cy.contains("Reset compl-1").should("not.exist");
          cy.contains("Not specified").should("be.visible"); // title of newly added completion
          isHeaderTabSelected(2);
          // existing editing to new: changes can be saved in prompt

          setHeaderTab(0);
          assertLocationAndHash(boreholeId, completion1Id, "#casing");
          startEditHeader();
          setInput("name", "Reset compl-1");
          addCompletion();
          handlePrompt("Completion: You have unsaved changes. How would you like to proceed?", "Save");
          assertNewCompletionCreated(boreholeId);
          isHeaderTabSelected(2);
          cy.contains("Reset compl-1").should("be.visible");

          // cancel adding new completion: last tab should be selected
          cancelEditing();

          // should update to base url if last completion is deleted
          deleteCompletion();
          handlePrompt("Do you really want to delete this completion?", "Delete");
          assertLocationAndHash(boreholeId, completion1Id, "#casing");
          deleteCompletion();
          handlePrompt("Do you really want to delete this completion?", "Delete");

          cy.location().should(location => {
            expect(location.pathname).to.eq(`/${boreholeId}/completion`);
            expect(location.hash).to.eq("");
          });
        });
      });
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
      goToRouteAndAcceptTerms(`/${id}/completion`);
    });
    cy.wait("@get-completions-by-boreholeId");

    // start editing session
    startBoreholeEditing();

    // cancel switching content tabs
    cy.wait(1000);
    addItem("addcasing");
    cy.wait("@codelist_GET");
    setInput("name", "casing 1", "casing-card.0.edit");
    setInput("casingElements.0.fromDepth", "0");
    setInput("casingElements.0.toDepth", "10");
    setSelect("casingElements.0.kindId", 2);
    setContentTab("instrumentation");
    handlePrompt("Casing: You have unsaved changes. How would you like to proceed?", "Cancel");
    isContentTabSelected("casing");

    // reset when switching content tabs
    setContentTab("instrumentation");
    handlePrompt("Casing: You have unsaved changes. How would you like to proceed?", "Reset");
    isContentTabSelected("instrumentation");
    setContentTab("casing");
    cy.wait("@casing_GET");
    cy.get('[data-cy="casing-card.0"]').should("not.exist");

    // save when switching content tabs
    cy.wait(1000);
    addItem("addcasing");
    cy.wait("@codelist_GET");
    setInput("name", "casing 1", "casing-card.0.edit");
    setInput("casingElements.0.fromDepth", "0");
    setInput("casingElements.0.toDepth", "10");
    setSelect("casingElements.0.kindId", 2);
    setContentTab("backfill");
    handlePrompt("Casing: You have unsaved changes. How would you like to proceed?", "Save");
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
    handlePrompt("Sealing/Backfilling: You have unsaved changes. How would you like to proceed?", "Cancel");
    isHeaderTabSelected(0);
    isContentTabSelected("backfill");

    // reset content changes when switching header tabs
    addCompletion();
    handlePrompt("Sealing/Backfilling: You have unsaved changes. How would you like to proceed?", "Reset");
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
    handlePrompt("Sealing/Backfilling: You have unsaved changes. How would you like to proceed?", "Save");
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
    handlePrompt("Completion: You have unsaved changes. How would you like to proceed?", "Cancel");
    cy.get('[data-cy="prompt"]').should("not.exist");
    isHeaderTabSelected(0);
    isContentTabSelected("instrumentation");
    evaluateInput("fromDepth", "0");
    evaluateInput("toDepth", "10");
    evaluateInput("name", "Compl-1 updated", "completion-header");

    // reset header changes, cancel content changes
    addCompletion();
    handlePrompt("Completion: You have unsaved changes. How would you like to proceed?", "Reset");
    cy.wait(1000);
    handlePrompt("Instrumentation: You have unsaved changes. How would you like to proceed?", "Cancel");
    isHeaderTabSelected(0);
    isContentTabSelected("instrumentation");
    evaluateInput("fromDepth", "0");
    evaluateInput("toDepth", "10");
    evaluateDisplayValue("name", "Compl-1", "completion-header");

    // reset header changes, reset content changes
    startEditHeader();
    setInput("name", "Compl-1 updated", "completion-header");
    addCompletion();
    handlePrompt("Completion: You have unsaved changes. How would you like to proceed?", "Reset");
    cy.wait(1000);
    handlePrompt("Instrumentation: You have unsaved changes. How would you like to proceed?", "Reset");
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
    handlePrompt("Completion: You have unsaved changes. How would you like to proceed?", "Reset");
    cy.wait(1000);
    handlePrompt("Instrumentation: You have unsaved changes. How would you like to proceed?", "Save");
    isHeaderTabSelected(1);
    setHeaderTab(0);
    evaluateDisplayValue("name", "Compl-1", "completion-header");
    setContentTab("instrumentation");
    cy.get('[data-cy="instrumentation-card.0"]').should("be.visible");
    evaluateDisplayValue("notes", "-");

    // save header changes, cancel content changes
    startEditing("instrumentation-card.0");
    cy.wait("@casing_GET");
    setInput("notes", "Lorem.");
    startEditHeader();
    setInput("name", "Compl-1 updated", "completion-header");
    addCompletion();
    handlePrompt("Completion: You have unsaved changes. How would you like to proceed?", "Save");
    cy.wait(1000);
    handlePrompt("Instrumentation: You have unsaved changes. How would you like to proceed?", "Cancel");
    isHeaderTabSelected(0);
    isContentTabSelected("instrumentation");
    evaluateTextarea("notes", "Lorem.");
    evaluateDisplayValue("name", "Compl-1 updated", "completion-header");

    // save header changes, reset content changes
    startEditHeader();
    setInput("name", "Compl-1 updated again", "completion-header");
    addCompletion();
    handlePrompt("Completion: You have unsaved changes. How would you like to proceed?", "Save");
    cy.wait(1000);
    handlePrompt("Instrumentation: You have unsaved changes. How would you like to proceed?", "Reset");
    isHeaderTabSelected(1);
    setHeaderTab(0);
    evaluateDisplayValue("name", "Compl-1 updated again", "completion-header");
    setContentTab("instrumentation");
    cy.wait("@instrumentation_GET");
    evaluateDisplayValue("notes", "-");

    // save header changes, save content changes
    cy.get('[data-cy="instrumentation-card.0"]').should("be.visible");
    evaluateDisplayValue("notes", "-");
    startEditing("instrumentation-card.0");
    cy.wait("@casing_GET");
    setInput("notes", "Lorem.");
    startEditHeader();
    setInput("name", "Compl-1 updated again and again", "completion-header");
    addCompletion();
    handlePrompt("Completion: You have unsaved changes. How would you like to proceed?", "Save");
    cy.wait(1000);
    handlePrompt("Instrumentation: You have unsaved changes. How would you like to proceed?", "Save");
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
        createCompletion("test hash 2", id, 16000002, false).as("completion2_id");
      });

    const forceReload = true;

    cy.get("@borehole_id").then(id => {
      cy.get("@completion1_id").then(completion1Id => {
        // Preserves hash when reloading
        goToRouteAndAcceptTerms(`/${id}/completion/${completion1Id}`);

        assertLocationAndHash(id, completion1Id, "#casing");
        cy.reload(forceReload);
        cy.get('[data-cy="accept-button"]').click();

        assertLocationAndHash(id, completion1Id, "#casing");
        setContentTab("instrumentation");

        assertLocationAndHash(id, completion1Id, "#instrumentation");
        cy.reload(forceReload);
        cy.get('[data-cy="accept-button"]').click();
        assertLocationAndHash(id, completion1Id, "#instrumentation");
        // Resets hash from #instrumentation to #casing when switching to another completion
        cy.wait(1000);
        cy.contains("test hash 2").click({ force: true });
        cy.wait("@get-casings-by-completionId");
        cy.get("@completion2_id").then(completion2Id => {
          assertLocationAndHash(id, completion2Id, "#casing");
        });
      });
    });
  });
});
