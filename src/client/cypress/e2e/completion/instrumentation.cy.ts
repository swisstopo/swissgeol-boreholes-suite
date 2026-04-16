import { addItem, cancelEditing, deleteItem, saveForm, startEditing } from "../helpers/buttonHelpers";
import { evaluateDisplayValue, evaluateSelect, setInput, setSelect } from "../helpers/formHelpers";
import {
  createBorehole,
  createCompletion,
  createInstrument,
  createTestCasing,
  goToDetailRouteAndAcceptTerms,
  handlePrompt,
  startBoreholeEditing,
} from "../helpers/testHelpers";

describe("Instrumentation crud tests", () => {
  beforeEach(() => {
    // Create borehole with completion and casing
    createBorehole({ originalName: "INTEADAL" }).as("borehole_id");

    cy.get("@borehole_id").then(id => {
      createCompletion({
        name: "test instruments",
        boreholeId: id,
        kindId: 16000002,
        isPrimary: true,
      }).as("completion_id");
      cy.get("@completion_id").then(completionId => {
        createTestCasing(id, completionId).as("casing1_id");
      });
      // open completion editor
      goToDetailRouteAndAcceptTerms(`/${id}/completion`);
    });

    cy.wait("@completion_GET");

    // start editing session
    startBoreholeEditing();
  });

  it("adds, edits and deletes instrumentations", () => {
    cy.get("[data-cy=completion-content-tab-instrumentation]").click();
    cy.wait("@instrumentation_by_completion_GET");

    // create instrumentation
    addItem("addInstrument");
    cy.wait("@casing_by_completion_GET");

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
    cy.contains("123'456");
    cy.contains("987'654");
    cy.contains("Inst-1");
    cy.contains("Lorem.");
    cy.contains("suction pump");
    cy.contains("inactive");

    // edit instrumentation
    startEditing();

    // We need the casings for the casing name dropdown
    cy.wait("@casing_by_completion_GET");
    setInput("fromDepth", "222");
    setSelect("casingId", 2);

    // close editing mask
    saveForm();
    cy.contains("casing-1");
    cy.contains("222");
    cy.contains("inactive");
    evaluateDisplayValue("casingName", "test instruments - casing-1");

    startEditing();
    cy.wait("@casing_by_completion_GET");
    setSelect("casingId", 1);
    saveForm();
    evaluateDisplayValue("casingName", "open hole");
    startEditing();
    evaluateSelect("casingId", "open hole");
    cancelEditing();

    // delete instrumentation
    deleteItem();
    handlePrompt("Do you really want to delete this entry?", "delete");
    cy.contains("From depth").should("not.exist");
  });

  it("sorts instrumentation", () => {
    cy.get("@completion_id").then(id => {
      cy.get("@casing1_id").then(casingId => {
        createInstrument({
          completionId: id,
          casingId: casingId,
          name: "Inst-1",
          statusId: 25000212,
          kindId: 25000102,
          fromDepth: 0,
          toDepth: 10,
          notes: "Lorem.",
        });
        createInstrument({
          completionId: id,
          casingId: casingId,
          name: "Inst-2",
          statusId: 25000215,
          kindId: 25000100,
          fromDepth: 0,
          toDepth: 12,
          notes: "Lorem.",
        });
      });
    });

    cy.get("[data-cy=completion-content-tab-instrumentation]").click();
    cy.wait("@instrumentation_by_completion_GET");

    cy.get('[data-cy="instrumentation-card.0"] [data-cy="name-formDisplay"]').contains("Inst-1");
    cy.get('[data-cy="instrumentation-card.1"] [data-cy="name-formDisplay"]').contains("Inst-2");

    startEditing("instrumentation-card.1");
    setInput("toDepth", "8");
    saveForm();
    cy.wait("@instrumentation_by_completion_GET");
    cy.get('[data-cy="instrumentation-card.0"] [data-cy="name-formDisplay"]').contains("Inst-2");
    cy.get('[data-cy="instrumentation-card.1"] [data-cy="name-formDisplay"]').contains("Inst-1");

    cy.get('[data-cy="instrumentation-card.0"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("fromDepth", "5");
    saveForm();
    cy.wait("@instrumentation_by_completion_GET");
    cy.get('[data-cy="instrumentation-card.0"] [data-cy="name-formDisplay"]').contains("Inst-1");
    cy.get('[data-cy="instrumentation-card.1"] [data-cy="name-formDisplay"]').contains("Inst-2");
  });
});
