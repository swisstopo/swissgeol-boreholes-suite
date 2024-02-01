import {
  loginAsAdmin,
  createBorehole,
  createCompletion,
  startBoreholeEditing,
} from "../helpers/testHelpers";
import { setInput, setSelect } from "../helpers/formHelpers";

describe("Backfill crud tests", () => {
  it("add, edit and delete backfills", () => {
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
    cy.get("[data-cy=completion-content-header-tab-Backfill]").click();
    cy.wait("@backfill_GET");

    // add new backfill card
    cy.get('[data-cy="addFilling-button"]').click({ force: true });
    cy.wait("@codelist_GET");

    // fill out form
    setInput("notes", "Lorem.");
    setInput("fromDepth", "123456");
    setInput("toDepth", "987654");
    setSelect("kindId", 2);
    setSelect("materialId", 1);

    // save backfill
    cy.get('[data-cy="save-icon"]').click();

    // check if backfill is saved
    cy.contains("123456");
    cy.contains("987654");
    cy.contains("Lorem.");
    cy.contains("casing plugging");
    cy.contains("filter gravel");

    // edit backfill
    cy.get('[data-cy="edit-icon"]').click({ force: true });
    cy.wait("@codelist_GET");

    setInput("fromDepth", "222");

    // close editing mask
    cy.get('[data-cy="save-icon"]').click({ force: true });
    cy.contains("222");
    cy.contains("inactive");

    // delete backfill
    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.contains("From depth").should("not.exist");
  });
});
