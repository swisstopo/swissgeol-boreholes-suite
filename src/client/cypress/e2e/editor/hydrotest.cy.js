import {
  createBorehole,
  createCompletion,
  loginAsAdmin,
  startBoreholeEditing,
  createCasing,
} from "../helpers/testHelpers";
import {
  evaluateDisplayValue,
  setInput,
  setSelect,
  toggleMultiSelect,
  evaluateMultiSelect,
} from "../helpers/formHelpers";
import { addItem, startEditing, saveForm, deleteItem } from "../helpers/buttonHelpers";

describe("Tests for the hydrotest editor.", () => {
  it("Creates, updates and deletes hydrotests", () => {
    // Create borehole with completion and casing
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id =>
        createCompletion("test hydrotest", id, 16000002, true)
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

    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/completion`);
    });
    startBoreholeEditing();

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
    evaluateDisplayValue("casingName", "test hydrotest - casing-1");
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

    evaluateDisplayValue("casingName", "test hydrotest - casing-1");
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
});
