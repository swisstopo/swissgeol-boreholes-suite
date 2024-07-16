import {
  createBackfill,
  createBorehole,
  createCasing,
  createCompletion,
  handlePrompt,
  loginAsAdmin,
  startBoreholeEditing,
} from "../helpers/testHelpers";
import { evaluateDisplayValue, evaluateSelect, setInput, setSelect } from "../helpers/formHelpers";
import { addItem, cancelEditing, deleteItem, saveForm, startEditing } from "../helpers/buttonHelpers";

describe("Backfill crud tests", () => {
  beforeEach(() => {
    // Create borehole with completion and casings
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id =>
        createCompletion("test backfill", id, 16000002, true)
          .as("completion_id")
          .then(completionId => {
            createCasing("casing-1", id, completionId, "2021-01-01", "2021-01-02", [
              { fromDepth: 0, toDepth: 10, kindId: 25000103 },
            ]).as("casing1_id");
            createCasing("casing-2", id, completionId, "2021-01-03", "2021-01-04", [
              { fromDepth: 5, toDepth: 12, kindId: 25000105 },
            ]).as("casing2_id");
          }),
      );
  });

  it("adds, edits and deletes backfills", () => {
    cy.get("@borehole_id").then(id => {
      loginAsAdmin(`/${id}/completion`);
    });
    cy.wait("@get-completions-by-boreholeId");

    // start editing session
    startBoreholeEditing();
    cy.get("[data-cy=completion-content-tab-backfill]").click();
    cy.wait("@backfill_GET");

    // add new backfill card
    addItem("addBackfill");
    cy.wait("@codelist_GET");

    // fill out form
    setInput("notes", "Lorem.");
    setInput("fromDepth", "123456");
    setInput("toDepth", "987654");
    setSelect("kindId", 3);
    setSelect("materialId", 2);

    // save backfill
    saveForm();

    // check if backfill is saved
    cy.contains("123456");
    cy.contains("987654");
    cy.contains("Lorem.");
    cy.contains("casing plugging");
    cy.contains("filter gravel");

    // edit backfill
    startEditing();
    cy.wait("@casing_GET");

    setInput("fromDepth", "222");
    setSelect("casingId", 2);

    // close editing mask
    saveForm();
    cy.contains("casing-1");
    cy.contains("222");
    cy.contains("inactive");
    evaluateDisplayValue("casingName", "test backfill - casing-1");

    startEditing();
    cy.wait("@casing_GET");
    setSelect("casingId", 1);
    saveForm();
    evaluateDisplayValue("casingName", "open hole");
    startEditing();
    evaluateSelect("casingId", "-1");
    cancelEditing();

    // delete backfill
    deleteItem();
    handlePrompt("Do you really want to delete this entry?", "Delete");
    cy.contains("From depth").should("not.exist");
  });

  it("sorts backfills", () => {
    cy.get("@completion_id").then(id => {
      cy.get("@casing1_id").then(casingId => {
        createBackfill(id, casingId, 25000112, 25000100, 0, 12, "Lorem.");
      });
      cy.get("@casing2_id").then(casingId => {
        createBackfill(id, casingId, 25000109, 25000102, 0, 10, "Lorem.");
      });
    });

    cy.get("@borehole_id").then(id => {
      loginAsAdmin(`/${id}/completion`);
      startBoreholeEditing();
    });
    cy.get("[data-cy=completion-content-tab-backfill]").click();
    cy.wait("@backfill_GET");

    cy.get('[data-cy="backfill-card.0"] [data-cy="todepth-formDisplay"]').contains("12");
    cy.get('[data-cy="backfill-card.1"] [data-cy="todepth-formDisplay"]').contains("10");

    cy.get('[data-cy="backfill-card.0"] [data-cy="edit-button"]').click({
      force: true,
    });
    setSelect("casingId", 3);
    saveForm();

    cy.get('[data-cy="backfill-card.0"] [data-cy="todepth-formDisplay"]').contains("10");
    cy.get('[data-cy="backfill-card.1"] [data-cy="todepth-formDisplay"]').contains("12");

    cy.get('[data-cy="backfill-card.1"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("toDepth", "8");
    saveForm();
    cy.get('[data-cy="backfill-card.0"] [data-cy="todepth-formDisplay"]').contains("8");
    cy.get('[data-cy="backfill-card.1"] [data-cy="todepth-formDisplay"]').contains("10");

    cy.get('[data-cy="backfill-card.0"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("fromDepth", "5");
    saveForm();
    cy.get('[data-cy="backfill-card.0"] [data-cy="fromdepth-formDisplay"]').contains("0");
    cy.get('[data-cy="backfill-card.1"] [data-cy="fromdepth-formDisplay"]').contains("5");
  });
});
