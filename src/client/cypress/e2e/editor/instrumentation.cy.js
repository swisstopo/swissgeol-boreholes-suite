import {
  loginAsAdmin,
  createBorehole,
  startBoreholeEditing,
  createCompletion,
  createCasing,
} from "../helpers/testHelpers";
import { evaluateDisplayValue, evaluateSelect, setInput, setSelect } from "../helpers/formHelpers";
import { addItem, startEditing, saveForm, cancelEditing, deleteItem } from "../helpers/buttonHelpers";

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
            ]);
          }),
      )
      .then(response => {
        expect(response).to.have.property("status", 200);
      });

    // open completion editor
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/completion`);
    });

    cy.wait("@get-completions-by-boreholeId");

    // start editing session
    startBoreholeEditing();
  });

  it("adds, edits and deletes instrumentations", () => {
    cy.get("[data-cy=completion-content-header-tab-instrumentation]").click();
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
    cy.contains("From depth").should("not.exist");
  });

  it("sorts instrumentation", () => {
    cy.get("[data-cy=completion-content-header-tab-instrumentation]").click();
    cy.wait("@instrumentation_GET");

    addItem("addInstrument");
    cy.wait("@casing_GET");
    setInput("notes", "Lorem.");
    setInput("name", "Inst-1");
    setInput("fromDepth", "0");
    setInput("toDepth", "10");
    setSelect("kindId", 2);
    setSelect("statusId", 1);
    saveForm();
    cy.wait("@instrumentation_GET");

    addItem("addInstrument");
    cy.wait("@casing_GET");
    setInput("notes", "Lorem.");
    setInput("name", "Inst-2");
    setInput("fromDepth", "0");
    setInput("toDepth", "12");
    setSelect("kindId", 2);
    setSelect("statusId", 1);
    saveForm();
    cy.wait("@instrumentation_GET");

    cy.get('[data-cy="instrumentation-card.0"] [data-cy="name-formDisplay"]').contains("Inst-1");
    cy.get('[data-cy="instrumentation-card.1"] [data-cy="name-formDisplay"]').contains("Inst-2");

    cy.get('[data-cy="instrumentation-card.1"] [data-cy="edit-button"]').click({
      force: true,
    });
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
