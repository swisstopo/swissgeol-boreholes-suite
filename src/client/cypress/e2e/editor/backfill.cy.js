import {
  loginAsAdmin,
  createBorehole,
  createCompletion,
  createCasing,
  startBoreholeEditing,
  handlePrompt,
} from "../helpers/testHelpers";
import { evaluateDisplayValue, evaluateSelect, setInput, setSelect } from "../helpers/formHelpers";
import { addItem, startEditing, saveForm, cancelEditing, deleteItem } from "../helpers/buttonHelpers";

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
            ]);
            createCasing("casing-2", id, completionId, "2021-01-03", "2021-01-04", [
              { fromDepth: 5, toDepth: 12, kindId: 25000105 },
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
    cy.get("[data-cy=completion-content-tab-backfill]").click();
    cy.wait("@backfill_GET");
  });

  it("adds, edits and deletes backfills", () => {
    // add new backfill card
    addItem("addBackfill");
    cy.wait("@codelist_GET");

    // fill out form
    setInput("notes", "Lorem.");
    setInput("fromDepth", "123456");
    setInput("toDepth", "987654");
    setSelect("kindId", 2);
    setSelect("materialId", 1);

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

  it("sorts backfill", () => {
    addItem("addBackfill");
    cy.wait("@codelist_GET");
    setInput("notes", "Lorem.");
    setInput("fromDepth", "0");
    setInput("toDepth", "10");
    setSelect("kindId", 2);
    setSelect("materialId", 1);
    setSelect("casingId", 3);
    saveForm();

    cy.wait(500);
    addItem("addBackfill");
    cy.wait("@codelist_GET");
    setInput("notes", "Lorem.");
    setInput("fromDepth", "0");
    setInput("toDepth", "12");
    setSelect("kindId", 2);
    setSelect("materialId", 1);
    setSelect("casingId", 2);
    saveForm();

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
