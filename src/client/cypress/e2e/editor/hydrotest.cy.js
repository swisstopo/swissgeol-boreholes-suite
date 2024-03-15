import {
  createBorehole,
  createCompletion,
  loginAsAdmin,
  startBoreholeEditing,
  handlePrompt,
} from "../helpers/testHelpers";
import {
  evaluateDisplayValue,
  evaluateInput,
  evaluateSelect,
  evaluateTextarea,
  setInput,
  setSelect,
  toggleMultiSelect,
  evaluateMultiSelect,
} from "../helpers/formHelpers";
import { addItem, startEditing, saveForm, deleteItem } from "../helpers/buttonHelpers";

describe("Tests for the hydrotest editor.", () => {
  it("Creates, updates and deletes hydrotests", () => {
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => createCompletion("testHydrotest", id, 16000002, true))
      .then(response => {
        expect(response).to.have.property("status", 200);
      });
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/completion`);
    });
    startBoreholeEditing();
    cy.get("[data-cy=completion-content-tab-casing]").click();
    cy.wait("@casing_GET");

    addItem("addCasing");
    cy.wait("@codelist_GET");

    setInput("name", "casing-1");
    setInput("dateStart", "2021-01-01");
    setInput("dateFinish", "2021-01-02");
    setInput("casingElements.0.fromDepth", "0");
    setInput("casingElements.0.toDepth", "10");
    setSelect("casingElements.0.kindId", 2);
    setSelect("casingElements.0.materialId", 3);
    setInput("casingElements.0.innerDiameter", "3");
    setInput("casingElements.0.outerDiameter", "4");

    saveForm();
    cy.wait("@casing_GET");

    cy.get('[data-cy="hydrogeology-menu-item"]').click({ force: true });
    cy.get('[data-cy="hydrotest-menu-item"]').click({ force: true });

    // switch to german
    cy.get('[data-cy="menu"]').click({ force: true });
    cy.contains("span", "DE").click({ force: true });

    cy.wait(1000);
    // create hydrotest
    addItem("addHydrotest");
    cy.wait("@casing_GET");

    setSelect("reliabilityId", 1);
    setInput("startTime", "2012-11-14T12:06");
    setSelect("casingId", 1);
    toggleMultiSelect("testKindId", [2]);

    saveForm();
    cy.wait("@hydrotest_GET");
    evaluateDisplayValue("reliability", "fraglich");
    evaluateDisplayValue("casingName", "testHydrotest - casing-1");
    evaluateDisplayValue("hydrotestKind", "Pump-/Injektionsversuch, variable Rate");

    // update hydrotest
    startEditing();

    toggleMultiSelect("flowDirectionId", [1, 0], 3);
    toggleMultiSelect("evaluationMethodId", [1, 0], 4);

    addItem("addHydrotestResult");
    setSelect("hydrotestResults.0.parameterId", 0);

    toggleMultiSelect("testKindId", [2]);
    evaluateMultiSelect("flowDirectionId", []);
    evaluateMultiSelect("evaluationMethodId", []);
    cy.get('[data-cy="hydrotestResult-0"]').should("not.exist");

    toggleMultiSelect("testKindId", [2]);
    toggleMultiSelect("flowDirectionId", [1, 0], 3);
    toggleMultiSelect("evaluationMethodId", [1, 0], 4);
    addItem("addHydrotestResult");
    setSelect("hydrotestResults.0.parameterId", 0, 6);
    setInput("hydrotestResults.0.value", "10");
    setInput("hydrotestResults.0.minValue", "5");
    setInput("hydrotestResults.0.maxValue", "15");
    saveForm();
    cy.wait("@hydrotest_GET");

    evaluateDisplayValue("casingName", "testHydrotest - casing-1");
    evaluateDisplayValue("hydrotestKind", "Pump-/Injektionsversuch, variable Rate");
    evaluateDisplayValue("flowDirection", ["Entnahme", "Injektion"]);
    evaluateDisplayValue("evaluationMethod", ["stationär", "instationär"]);
    evaluateDisplayValue("hydrotestResult.0.parameter", "kf-Wert (gesättigt)");
    evaluateDisplayValue("hydrotestResult.0.value", "10 m/s");
    evaluateDisplayValue("hydrotestResult.0.minValue", "5 m/s");
    evaluateDisplayValue("hydrotestResult.0.maxValue", "15 m/s");

    startEditing();
    setInput("comment", "Lorem.");
    saveForm();
    cy.wait("@hydrotest_GET");
    evaluateDisplayValue("comment", "Lorem.");

    // delete hydrotest
    deleteItem();
    cy.wait("@hydrotest_GET");
    cy.get("body").should("not.contain", "Pump-/Injektionsversuch, variable Rate");
  });

  it("sorts hydrotest", () => {
    createBorehole({ "extended.original_name": "INTEADAL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/hydrogeology/hydrotest`);
    });
    startBoreholeEditing();

    addItem("addHydrotest");
    cy.wait("@casing_GET");
    setInput("fromDepthM", 0);
    setInput("toDepthM", 10);
    setSelect("reliabilityId", 1);
    setInput("startTime", "2012-11-14T12:06");
    toggleMultiSelect("testKindId", [2]);
    saveForm();
    cy.wait("@hydrotest_GET");

    cy.wait(1000);
    addItem("addHydrotest");
    cy.wait("@casing_GET");
    setInput("fromDepthM", 0);
    setInput("toDepthM", 12);
    setSelect("reliabilityId", 1);
    setInput("startTime", "2012-11-14T12:06");
    toggleMultiSelect("testKindId", [2]);
    saveForm();
    cy.wait("@hydrotest_GET");

    cy.get('[data-cy="hydrotest-card.0"] [data-cy="todepth-formDisplay"]').contains("10");
    cy.get('[data-cy="hydrotest-card.1"] [data-cy="todepth-formDisplay"]').contains("12");

    cy.get('[data-cy="hydrotest-card.1"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("toDepthM", "8");
    saveForm();
    cy.wait("@hydrotest_GET");
    cy.get('[data-cy="hydrotest-card.0"] [data-cy="todepth-formDisplay"]').contains("8");
    cy.get('[data-cy="hydrotest-card.1"] [data-cy="todepth-formDisplay"]').contains("10");

    cy.get('[data-cy="hydrotest-card.0"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("fromDepthM", "5");
    saveForm();
    cy.wait("@hydrotest_GET");
    cy.get('[data-cy="hydrotest-card.0"] [data-cy="fromdepth-formDisplay"]').contains("0");
    cy.get('[data-cy="hydrotest-card.1"] [data-cy="fromdepth-formDisplay"]').contains("5");
  });

  it("checks for unsaved changes when switching between cards", () => {
    createBorehole({ "extended.original_name": "INTEADAL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/hydrogeology/hydrotest`);
    });
    startBoreholeEditing();

    // no prompt should be displayed when no card is currently in edit mode
    addItem("addHydrotest");
    cy.wait("@casing_GET");
    setInput("startTime", "2012-11-14T12:06");
    setSelect("reliabilityId", 1);

    // can cancel switching tabs without loosing data
    addItem("addHydrotest");
    handlePrompt("Hydrotest: Unsaved changes", "Cancel");
    evaluateInput("startTime", "2012-11-14T12:06");
    evaluateSelect("reliabilityId", "15203157");
    toggleMultiSelect("testKindId", [2]);

    // can reset new card form
    addItem("addHydrotest");
    handlePrompt("Hydrotest: Unsaved changes", "Reset");
    cy.get('[data-cy="hydrotest-card.0.edit"]').should("exist");

    // can save new card and switch to new card
    setInput("startTime", "2012-11-14T12:06");
    setSelect("reliabilityId", 1);
    toggleMultiSelect("testKindId", [2]);
    addItem("addHydrotest");
    handlePrompt("Hydrotest: Unsaved changes", "Save");
    cy.wait("@hydrotest_GET");
    cy.get('[data-cy="hydrotest-card.0.edit"]').should("exist");
    cy.get('[data-cy="hydrotest-card.1"]').should("exist");

    // can switch cards without prompt if no changes were made
    startEditing();
    setInput("comment", "Lorem.");

    // can cancel switching tabs without loosing data
    addItem("addHydrotest");
    handlePrompt("Hydrotest: Unsaved changes", "Cancel");
    evaluateTextarea("comment", "Lorem.");

    // can reset creating
    addItem("addHydrotest");
    handlePrompt("Hydrotest: Unsaved changes", "Reset");
    evaluateDisplayValue("comment", "-");

    // can save changes in existing card and switch to new card
    startEditing();
    setInput("comment", "Lorem.");
    addItem("addHydrotest");
    handlePrompt("Hydrotest: Unsaved changes", "Save");
    evaluateDisplayValue("comment", "Lorem.");

    // can reset creating and switch to existing card
    setInput("startTime", "2012-11-14T12:06");
    setSelect("reliabilityId", 1);
    startEditing();
    handlePrompt("Hydrotest: Unsaved changes", "Reset");
    cy.get('[data-cy="hydrotest-card.0.edit"]').should("exist");
    cy.get('[data-cy="hydrotest-card.1"]').should("not.exist");

    // can save new card and switch to existing card
    addItem("addHydrotest");
    setInput("startTime", "2013-10-02T14:06");
    setSelect("reliabilityId", 2);
    toggleMultiSelect("testKindId", [3]);
    startEditing();
    handlePrompt("Hydrotest: Unsaved changes", "Save");
    cy.get('[data-cy="hydrotest-card.0.edit"]').should("exist");
    cy.get('[data-cy="hydrotest-card.1"]').should("exist");
  });
});
