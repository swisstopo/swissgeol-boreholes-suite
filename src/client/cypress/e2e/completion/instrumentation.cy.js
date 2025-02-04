import { addItem, cancelEditing, deleteItem, saveForm, startEditing } from "../helpers/buttonHelpers";
import { evaluateDisplayValue, evaluateSelect, setInput, setSelect } from "../helpers/formHelpers";
import {
  createBorehole,
  createCasing,
  createCompletion,
  createInstrument,
  goToRouteAndAcceptTerms,
  handlePrompt,
  startBoreholeEditing,
} from "../helpers/testHelpers";

describe("Instrumentation crud tests", () => {
  beforeEach(() => {
    // Create borehole with completion and casing
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id =>
        createCompletion("test instruments", id, 16000002, true)
          .as("completion_id")
          .then(completionId => {
            createCasing("casing-1", id, completionId, "2021-01-01", "2021-01-02", [
              { fromDepth: 0, toDepth: 10, kindId: 25000103 },
            ]).as("casing1_id");
          }),
      );

    // open completion editor
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}/completion`);
    });

    cy.wait("@get-completions-by-boreholeId");

    // start editing session
    startBoreholeEditing();
  });

  it("adds, edits and deletes instrumentations", () => {
    cy.get("[data-cy=completion-content-tab-instrumentation]").click();
    cy.wait("@instrumentation_GET");

    // create instrumentation
    addItem("addInstrument");
    cy.wait("@casing_GET");

    // fill out form
    setInput("notes", "Lorem.");
    setInput("name", "Inst-1");
    setInput("fromDepth", "123456");
    setInput("toDepth", "987654");
    setSelect("kindId", 2);
    setSelect("statusId", 1);

    // save instrumentation
    saveForm();

    // check if instrumentation is saved
    cy.contains("123456");
    cy.contains("987654");
    cy.contains("Inst-1");
    cy.contains("Lorem.");
    cy.contains("suction pump");
    cy.contains("inactive");

    // edit instrumentation
    startEditing();

    // We need the casings for the casing name dropdown
    cy.wait("@casing_GET");
    setInput("fromDepth", "222");
    setSelect("casingId", 2);

    // close editing mask
    saveForm();
    cy.contains("casing-1");
    cy.contains("222");
    cy.contains("inactive");
    evaluateDisplayValue("casingName", "test instruments - casing-1");

    startEditing();
    cy.wait("@casing_GET");
    setSelect("casingId", 1);
    saveForm();
    evaluateDisplayValue("casingName", "open hole");
    startEditing();
    evaluateSelect("casingId", "-1");
    cancelEditing();

    // delete instrumentation
    deleteItem();
    handlePrompt("Do you really want to delete this entry?", "Delete");
    cy.contains("From depth").should("not.exist");
  });

  it("sorts instrumentation", () => {
    cy.get("@completion_id").then(id => {
      cy.get("@casing1_id").then(casingId => {
        createInstrument(id, casingId, "Inst-1", 25000212, 25000102, 0, 10, "Lorem.");
        createInstrument(id, casingId, "Inst-2", 25000215, 25000100, 0, 12, "Lorem.");
      });
    });

    cy.get("[data-cy=completion-content-tab-instrumentation]").click();
    cy.wait("@instrumentation_GET");

    cy.get('[data-cy="instrumentation-card.0"] [data-cy="name-formDisplay"]').contains("Inst-1");
    cy.get('[data-cy="instrumentation-card.1"] [data-cy="name-formDisplay"]').contains("Inst-2");

    startEditing("instrumentation-card.1");
    setInput("toDepth", "8");
    saveForm();
    cy.wait("@instrumentation_GET");
    cy.get('[data-cy="instrumentation-card.0"] [data-cy="name-formDisplay"]').contains("Inst-2");
    cy.get('[data-cy="instrumentation-card.1"] [data-cy="name-formDisplay"]').contains("Inst-1");

    cy.get('[data-cy="instrumentation-card.0"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("fromDepth", "5");
    saveForm();
    cy.wait("@instrumentation_GET");
    cy.get('[data-cy="instrumentation-card.0"] [data-cy="name-formDisplay"]').contains("Inst-1");
    cy.get('[data-cy="instrumentation-card.1"] [data-cy="name-formDisplay"]').contains("Inst-2");
  });
});
