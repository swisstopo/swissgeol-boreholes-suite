import { addItem, deleteItem, saveForm, startEditing } from "../helpers/buttonHelpers";
import { evaluateDisplayValue, evaluateInput, evaluateTextarea, setInput, setSelect } from "../helpers/formHelpers";
import {
  createBorehole,
  createCasing,
  createCompletion,
  goToRouteAndAcceptTerms,
  handlePrompt,
  startBoreholeEditing,
} from "../helpers/testHelpers";

describe("Casing crud tests", () => {
  beforeEach(() => {
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => createCompletion("test casing", id, 16000002, true))
      .as("completion_id")
      .then(response => {
        expect(response).to.be.above(0);
      });

    // open completion editor
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}/completion`);
      cy.wait(["@borehole", "@borehole_by_id"]);
    });

    cy.wait("@get-completions-by-boreholeId");

    // start editing session
    startBoreholeEditing();

    // select casing tab
    cy.get("[data-cy=completion-content-tab-casing]").click();
    cy.wait("@casing_GET");
  });

  it("adds, edits and deletes casings", () => {
    // create casing
    addItem("addcasing");
    cy.get('[data-cy="casingElements.0.delete"]').should("be.disabled");

    setInput("name", "casing-1");
    setInput("dateStart", "2021-01-01");
    setInput("dateFinish", "2021-01-02");
    setInput("notes", "Lorem.");

    setInput("casingElements.0.fromDepth", "0");
    evaluateInput("fromDepth", "0");
    setInput("casingElements.0.toDepth", "10");
    evaluateInput("toDepth", "10");
    setSelect("casingElements.0.kindId", 3);
    setSelect("casingElements.0.materialId", 4);
    setInput("casingElements.0.innerDiameter", "3");
    setInput("casingElements.0.outerDiameter", "4");

    // add casing element and verify fromDepth is set to previous toDepth
    addItem("addcasingelement");
    cy.get('[name="casingElements.1.fromDepth"]').should("have.value", "10");
    cy.get('[data-cy="casingElements.1.delete"]').click();

    saveForm();
    cy.wait("@casing_GET");

    evaluateDisplayValue("name", "casing-1");
    evaluateDisplayValue("fromdepth", "0");
    evaluateDisplayValue("todepth", "10");
    evaluateDisplayValue("dateStartCasing", "01. Jan. 2021");
    evaluateDisplayValue("dateFinishCasing", "02. Jan. 2021");
    evaluateDisplayValue("notes", "Lorem.");
    evaluateDisplayValue("casingElements.0.fromDepth", "0");
    evaluateDisplayValue("casingElements.0.toDepth", "10");
    evaluateDisplayValue("casingElements.0.kindId", "conductor pipe");
    evaluateDisplayValue("casingElements.0.materialId", "steel");
    evaluateDisplayValue("casingElements.0.innerDiameter", "3");
    evaluateDisplayValue("casingElements.0.outerDiameter", "4");

    // update casing
    startEditing();

    setInput("name", "casing-1 updated");
    setSelect("casingElements.0.materialId", 6);

    saveForm();
    evaluateDisplayValue("name", "casing-1 updated");
    evaluateDisplayValue("casingElements.0.materialId", "concrete");
    evaluateDisplayValue("casingElements.0.innerDiameter", "3");

    // delete casing
    // Precondition: instrumentation with reference to casing
    cy.get("[data-cy=completion-content-tab-instrumentation]").click();
    cy.wait("@instrumentation_GET");

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    addItem("addInstrument");
    cy.wait("@casing_GET");

    setInput("notes", "Lorem.");
    setInput("name", "Inst-1");
    setInput("fromDepth", "123456");
    setInput("toDepth", "987654");
    setSelect("kindId", 3);
    setSelect("statusId", 1);
    setSelect("casingId", 2);
    saveForm();
    cy.wait("@instrumentation_GET");
    evaluateDisplayValue("name", "Inst-1");

    cy.get("[data-cy=completion-content-tab-casing]").click();
    cy.wait("@casing_GET");

    deleteItem("casing-card.0");
    handlePrompt("Do you really want to delete this entry?", "Delete");
    cy.wait("@casing_DELETE");
    cy.contains("casing-1 updated").should("not.exist");
    cy.contains("No casing available").should("exist");

    cy.get("[data-cy=completion-content-tab-instrumentation]").click();
    cy.wait("@instrumentation_GET");
    evaluateDisplayValue("casingName", "-");
  });

  it("sorts casings", () => {
    cy.get("@borehole_id").then(id => {
      cy.get("@completion_id").then(completionId => {
        createCasing("casing-1", id, completionId, "2021-01-01", "2021-01-02", [
          { fromDepth: 5, toDepth: 10, kindId: 25000103 },
          { fromDepth: 0, toDepth: 5, kindId: 25000103 },
        ]);
        createCasing("casing-2", id, completionId, "2021-01-01", "2021-01-02", [
          { fromDepth: 0, toDepth: 12, kindId: 25000103 },
        ]);
      });
      goToRouteAndAcceptTerms(`/${id}/completion`);
      cy.wait(["@borehole", "@borehole_by_id"]);
    });

    // casing 1
    evaluateDisplayValue("casingElements.0.fromDepth", "0");
    evaluateDisplayValue("casingElements.0.toDepth", "5");
    evaluateDisplayValue("casingElements.1.fromDepth", "5");
    evaluateDisplayValue("casingElements.1.toDepth", "10");

    // casing 2
    evaluateDisplayValue("casingElements.0.fromDepth", "0");
    evaluateDisplayValue("casingElements.0.toDepth", "12");

    cy.get('[data-cy="casing-card.0"] [data-cy="name-formDisplay"]').contains("casing-1");
    cy.get('[data-cy="casing-card.1"] [data-cy="name-formDisplay"]').contains("casing-2");

    cy.get('[data-cy="casing-card.1"] [data-cy="edit-button"]').click({ force: true });

    setInput("casingElements.0.toDepth", "8");
    saveForm();
    cy.wait("@casing_GET");
    cy.get('[data-cy="casing-card.0"] [data-cy="name-formDisplay"]').contains("casing-2");
    cy.get('[data-cy="casing-card.1"] [data-cy="name-formDisplay"]').contains("casing-1");

    cy.get('[data-cy="casing-card.0"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("casingElements.0.fromDepth", "3");
    saveForm();
    cy.wait("@casing_GET");
    cy.get('[data-cy="casing-card.0"] [data-cy="name-formDisplay"]').contains("casing-1");
    cy.get('[data-cy="casing-card.1"] [data-cy="name-formDisplay"]').contains("casing-2");
  });

  it("checks for unsaved changes when switching between cards", () => {
    addItem("addcasing");
    cy.get('[data-cy="addcasing-button"]').should("be.disabled");
    setInput("name", "casing 1");
    setInput("casingElements.0.fromDepth", "5");
    setInput("casingElements.0.toDepth", "10");
    setSelect("casingElements.0.kindId", 3);
    saveForm();
    cy.wait("@casing_POST");
    evaluateDisplayValue("name", "casing 1");

    cy.get('[data-cy="addcasing-button"]').should("be.enabled");

    // can switch cards without prompt if no changes were made
    startEditing();
    setInput("notes", "Lorem.");

    // can cancel switching tabs without loosing data
    addItem("addcasing");
    handlePrompt("Casing: You have unsaved changes. How would you like to proceed?", "Cancel");
    evaluateTextarea("notes", "Lorem.");

    // can reset creating
    addItem("addcasing");
    handlePrompt("Casing: You have unsaved changes. How would you like to proceed?", "Reset");
    evaluateDisplayValue("notes", "-");

    // can save changes in existing card and switch to new card
    startEditing();
    setInput("notes", "Lorem.");
    addItem("addcasing");
    handlePrompt("Casing: You have unsaved changes. How would you like to proceed?", "Save");
    cy.wait("@casing_PUT");
    evaluateDisplayValue("notes", "Lorem.");

    // can reset creating and switch to existing card
    setInput("name", "casing 2");
    setInput("casingElements.0.fromDepth", "0");
    setInput("casingElements.0.toDepth", "5");
    setSelect("casingElements.0.kindId", 3);
    startEditing();
    handlePrompt("Casing: You have unsaved changes. How would you like to proceed?", "Reset");
    cy.get('[data-cy="casing-card.0.edit"]').should("be.visible");
    cy.get('[data-cy="casing-card.1"]').should("not.exist");

    // can save new card and switch to existing card
    addItem("addcasing");
    setInput("name", "casing 2");
    setInput("casingElements.0.fromDepth", "0");
    setInput("casingElements.0.toDepth", "5");
    setSelect("casingElements.0.kindId", 3);
    startEditing();
    handlePrompt("Casing: You have unsaved changes. How would you like to proceed?", "Save");
    cy.wait("@casing_POST");
    evaluateDisplayValue("name", "casing 2");
    cy.get('[data-cy="casing-card.1.edit"]').should("exist");
    cy.get('[data-cy="casing-card.0"]').should("exist");
  });
});
