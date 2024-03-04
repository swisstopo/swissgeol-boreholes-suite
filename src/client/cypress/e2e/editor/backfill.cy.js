import { loginAsAdmin, createBorehole, createCompletion, startBoreholeEditing } from "../helpers/testHelpers";
import { setInput, setSelect } from "../helpers/formHelpers";
import { addItem, startEditing, saveForm, deleteItem } from "../helpers/buttonHelpers";

describe("Backfill crud tests", () => {
  beforeEach(() => {
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => createCompletion("test backfill", id, 16000002, true))
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

    // select backfill tab
    cy.get("[data-cy=completion-content-header-tab-backfill]").click();
    cy.wait("@backfill_GET");
  });

  it("add, edit and delete backfills", () => {
    // add new backfill card
    addItem("addFilling");
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
    cy.wait("@codelist_GET");

    setInput("fromDepth", "222");

    // close editing mask
    saveForm();
    cy.contains("222");
    cy.contains("inactive");

    // delete backfill
    deleteItem();
    cy.contains("From depth").should("not.exist");
  });

  it("sort backfill", () => {
    addItem("addFilling");
    cy.wait("@codelist_GET");
    setInput("notes", "Lorem.");
    setInput("fromDepth", "0");
    setInput("toDepth", "10");
    setSelect("kindId", 2);
    setSelect("materialId", 1);
    saveForm();

    cy.wait(1000);
    addItem("addFilling");
    cy.wait("@codelist_GET");
    setInput("notes", "Lorem.");
    setInput("fromDepth", "0");
    setInput("toDepth", "12");
    setSelect("kindId", 2);
    setSelect("materialId", 1);
    saveForm();

    cy.get(
      '[data-cy="backfill-card.0"] [data-cy="todepth-formDisplay"]',
    ).contains("10");
    cy.get(
      '[data-cy="backfill-card.1"] [data-cy="todepth-formDisplay"]',
    ).contains("12");

    cy.get('[data-cy="backfill-card.1"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("toDepth", "8");
    saveForm();
    cy.get(
      '[data-cy="backfill-card.0"] [data-cy="todepth-formDisplay"]',
    ).contains("8");
    cy.get(
      '[data-cy="backfill-card.1"] [data-cy="todepth-formDisplay"]',
    ).contains("10");

    cy.get('[data-cy="backfill-card.0"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("fromDepth", "5");
    saveForm();
    cy.get(
      '[data-cy="backfill-card.0"] [data-cy="fromdepth-formDisplay"]',
    ).contains("0");
    cy.get(
      '[data-cy="backfill-card.1"] [data-cy="fromdepth-formDisplay"]',
    ).contains("5");
  });
});
