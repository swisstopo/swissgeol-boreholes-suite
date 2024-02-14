import {
  loginAsAdmin,
  createBorehole,
  startBoreholeEditing,
  createCompletion,
} from "../helpers/testHelpers";
import { setInput, setSelect } from "../helpers/formHelpers";
import {
  addItem,
  startEditing,
  saveForm,
  deleteItem,
} from "../helpers/buttonHelpers";

describe("Instrumentation crud tests", () => {
  it("add, edit and delete instrumentations", () => {
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => createCompletion("test instr.", id, 16000002, true))
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

    // Precondition: Create casing to later link in instrumentation
    cy.get("[data-cy=completion-content-header-tab-casing]").click();
    cy.wait("@casing_GET");

    addItem("addCasing");
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

    saveForm();
    cy.wait("@casing_GET");

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
    setSelect("casingId", 1);

    // close editing mask
    saveForm();
    cy.contains("casing-1");
    cy.contains("222");
    cy.contains("inactive");

    // delete instrumentation
    deleteItem();
    cy.contains("From depth").should("not.exist");
  });
});
