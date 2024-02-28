import {
  loginAsAdmin,
  createBorehole,
  createCompletion,
  startBoreholeEditing,
} from "../helpers/testHelpers";
import {
  evaluateDisplayValue,
  evaluateInput,
  setInput,
  setSelect,
} from "../helpers/formHelpers";
import {
  addItem,
  startEditing,
  saveForm,
  deleteItem,
} from "../helpers/buttonHelpers";

describe("Casing crud tests", () => {
  beforeEach(() => {
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => createCompletion("test casing", id, 16000002, true))
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
    cy.get("[data-cy=completion-content-header-tab-casing]").click();
    cy.wait("@casing_GET");
  });

  it("add, edit and delete casings", () => {
    // create casing
    addItem("addCasing");
    cy.wait("@codelist_GET");
    cy.get('[data-cy="casingElements.0.delete"]').should("be.disabled");

    setInput("name", "casing-1");
    setInput("dateStart", "2021-01-01");
    setInput("dateFinish", "2021-01-02");
    setInput("notes", "Lorem.");

    setInput("casingElements.0.fromDepth", "0");
    evaluateInput("fromDepth", "0");
    setInput("casingElements.0.toDepth", "10");
    evaluateInput("toDepth", "10");
    setSelect("casingElements.0.kindId", 2);
    setSelect("casingElements.0.materialId", 3);
    setInput("casingElements.0.innerDiameter", "3");
    setInput("casingElements.0.outerDiameter", "4");

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
    cy.wait("@codelist_GET");

    setInput("name", "casing-1 updated");
    setSelect("casingElements.0.materialId", 5);

    saveForm();
    evaluateDisplayValue("name", "casing-1 updated");
    evaluateDisplayValue("casingElements.0.materialId", "concrete");
    evaluateDisplayValue("casingElements.0.innerDiameter", "3");

    // delete casing
    // Precondition: instrumentation with reference to casing
    cy.get("[data-cy=completion-content-header-tab-instrumentation]").click();
    cy.wait("@instrumentation_GET");

    addItem("addInstrument");
    cy.wait("@casing_GET");

    setInput("notes", "Lorem.");
    setInput("name", "Inst-1");
    setInput("fromDepth", "123456");
    setInput("toDepth", "987654");
    setSelect("kindId", 2);
    setSelect("statusId", 1);
    setSelect("casingId", 1);
    saveForm();

    cy.get("[data-cy=completion-content-header-tab-casing]").click();
    cy.wait("@casing_GET");

    deleteItem();
    cy.wait("@casing_DELETE");
    cy.contains("casing-1 updated").should("not.exist");

    cy.get("[data-cy=completion-content-header-tab-instrumentation]").click();
    cy.wait("@instrumentation_GET");
    evaluateDisplayValue("casingName", "-");
  });

  it("sort casings", () => {
    addItem("addCasing");
    cy.wait("@codelist_GET");
    cy.get('[data-cy="casingElements.0.delete"]').should("be.disabled");

    setInput("name", "casing-1");
    setInput("dateStart", "2021-01-01");
    setInput("dateFinish", "2021-01-02");
    setInput("notes", "Lorem.");

    setInput("casingElements.0.fromDepth", "5");
    evaluateInput("fromDepth", "5");
    setInput("casingElements.0.toDepth", "10");
    evaluateInput("toDepth", "10");
    setSelect("casingElements.0.kindId", 2);
    setSelect("casingElements.0.materialId", 3);
    setInput("casingElements.0.innerDiameter", "3");
    setInput("casingElements.0.outerDiameter", "4");
    saveForm();
    cy.wait("@casing_GET");
    evaluateDisplayValue("casingElements.0.fromDepth", "5");
    evaluateDisplayValue("casingElements.0.toDepth", "10");

    startEditing();
    addItem("addCasingElement");
    cy.get('[data-cy="casingElements.0.delete"]').should("be.enabled");
    cy.get('[data-cy="casingElements.1.delete"]').should("be.enabled");
    setInput("casingElements.1.fromDepth", "0");
    evaluateInput("fromDepth", "0");
    setInput("casingElements.1.toDepth", "5");
    evaluateInput("toDepth", "10");
    setSelect("casingElements.1.kindId", 2);
    setSelect("casingElements.1.materialId", 3);
    setInput("casingElements.1.innerDiameter", "3");
    setInput("casingElements.1.outerDiameter", "4");

    saveForm();
    cy.wait("@casing_GET");

    evaluateDisplayValue("casingElements.0.fromDepth", "0");
    evaluateDisplayValue("casingElements.0.toDepth", "5");
    evaluateDisplayValue("casingElements.1.fromDepth", "5");
    evaluateDisplayValue("casingElements.1.toDepth", "10");

    addItem("addCasing");
    cy.wait("@codelist_GET");
    setInput("name", "casing-2");
    setInput("dateStart", "2021-01-01");
    setInput("dateFinish", "2021-01-02");
    setInput("notes", "Lorem.");

    setInput("casingElements.0.fromDepth", "0");
    setInput("casingElements.0.toDepth", "12");
    setSelect("casingElements.0.kindId", 2);
    setSelect("casingElements.0.materialId", 3);
    setInput("casingElements.0.innerDiameter", "3");
    setInput("casingElements.0.outerDiameter", "4");
    saveForm();
    cy.wait("@casing_GET");

    cy.get('[data-cy="casing-card.0"] [data-cy="name-formDisplay"]').contains(
      "casing-1",
    );
    cy.get('[data-cy="casing-card.1"] [data-cy="name-formDisplay"]').contains(
      "casing-2",
    );

    cy.get('[data-cy="casing-card.1"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("casingElements.0.toDepth", "8");
    saveForm();
    cy.wait("@casing_GET");
    cy.get('[data-cy="casing-card.0"] [data-cy="name-formDisplay"]').contains(
      "casing-2",
    );
    cy.get('[data-cy="casing-card.1"] [data-cy="name-formDisplay"]').contains(
      "casing-1",
    );

    cy.get('[data-cy="casing-card.0"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("casingElements.0.fromDepth", "3");
    saveForm();
    cy.wait("@casing_GET");
    cy.get('[data-cy="casing-card.0"] [data-cy="name-formDisplay"]').contains(
      "casing-1",
    );
    cy.get('[data-cy="casing-card.1"] [data-cy="name-formDisplay"]').contains(
      "casing-2",
    );
  });
});
