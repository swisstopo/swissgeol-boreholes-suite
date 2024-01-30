import {
  loginAsAdmin,
  createBorehole,
  createCompletion,
  startBoreholeEditing,
} from "../helpers/testHelpers";
import {
  evaluateDisplayValue,
  setInput,
  setSelect,
} from "../helpers/formHelpers";

describe("Casing crud tests", () => {
  it("add, edit and delete casings", () => {
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => createCompletion(id, 16000002, true))
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

    // select casing tab
    cy.get("[data-cy=completion-content-header-tab-Casing]").click();
    cy.wait("@casing_GET");

    // create casing
    cy.get('[data-cy="addCasing-button"]').click();
    cy.wait("@codelist_GET");

    setInput("name", "casing-1");
    setInput("fromDepth", "0");
    setInput("toDepth", "10");
    setSelect("kindId", 2);
    setSelect("materialId", 3);
    setInput("dateStart", "2021-01-01");
    setInput("dateFinish", "2021-01-02");
    setInput("innerDiameter", "3");
    setInput("outerDiameter", "4");
    setInput("notes", "Lorem.");

    cy.get('[data-cy="save-icon"]').click();
    cy.wait("@casing_GET");

    evaluateDisplayValue("name", "casing-1");
    evaluateDisplayValue("fromdepth", "0");
    evaluateDisplayValue("todepth", "10");
    evaluateDisplayValue("kindCasingLayer", "conductor pipe");
    evaluateDisplayValue("materialCasingLayer", "steel");
    evaluateDisplayValue("dateStartCasing", "01. Jan. 2021");
    evaluateDisplayValue("dateFinishCasing", "02. Jan. 2021");
    evaluateDisplayValue("casing_inner_diameter", "3");
    evaluateDisplayValue("casing_outer_diameter", "4");
    evaluateDisplayValue("notes", "Lorem.");

    // update casing
    cy.get('[data-cy="edit-icon"]').click();
    cy.wait("@codelist_GET");

    setInput("name", "casing-1 updated");
    setSelect("materialId", 5);

    cy.get('[data-cy="save-icon"]').click({ force: true });
    evaluateDisplayValue("name", "casing-1 updated");
    evaluateDisplayValue("materialCasingLayer", "concrete");
    evaluateDisplayValue("casing_inner_diameter", "3");

    // delete casing
    // Precondition: instrumentation with reference to casing
    cy.get("[data-cy=completion-content-header-tab-Instrumentation]").click();
    cy.wait("@instrumentation_GET");

    cy.get('[data-cy="addInstrument-button"]').click({ force: true });
    cy.wait("@casing_GET");

    setInput("notes", "Lorem.");
    setInput("name", "Inst-1");
    setInput("fromDepth", "123456");
    setInput("toDepth", "987654");
    setSelect("kindId", 2);
    setSelect("statusId", 1);
    setSelect("casingId", 1);
    cy.get('[data-cy="save-icon"]').click({ force: true });

    cy.get("[data-cy=completion-content-header-tab-Casing]").click();
    cy.wait("@casing_GET");

    // cannot delete if connected to instrumentation
    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.wait("@casing_DELETE");
    cy.on("window:alert", txt => {
      expect(txt).to.contains(
        "Cannot delete casing because it is referenced by an instrumentation.",
      );
    });
    cy.on("window:confirm", () => true);

    // can delete if not connected to instrumentation
    cy.get("[data-cy=completion-content-header-tab-Instrumentation]").click();
    cy.wait("@instrumentation_GET");
    cy.get('[data-cy="edit-icon"]').click();
    setSelect("casingId", 0);

    cy.get('[data-cy="save-icon"]').click({ force: true });

    cy.get("[data-cy=completion-content-header-tab-Casing]").click();
    cy.wait("@casing_GET");

    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.wait("@casing_DELETE");
    cy.contains("casing-1 updated").should("not.exist");
  });
});