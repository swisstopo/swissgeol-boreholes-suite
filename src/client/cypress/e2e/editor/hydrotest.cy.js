import {
  createBorehole,
  createCompletion,
  loginAsAdmin,
  startBoreholeEditing,
} from "../helpers/testHelpers";
import {
  evaluateDisplayValue,
  setInput,
  setSelect,
  toggleMultiSelect,
  evaluateMultiSelect,
} from "../helpers/formHelpers";

describe("Tests for the hydrotest editor.", () => {
  it("Creates, updates and deletes hydrotests", () => {
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => createCompletion("test hydrotest", id, 16000002, true))
      .then(response => {
        expect(response).to.have.property("status", 200);
      });
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/completion`);
    });
    startBoreholeEditing();
    cy.get("[data-cy=completion-content-header-tab-Casing]").click();
    cy.wait("@casing_GET");

    cy.get('[data-cy="addCasing-button"]').click({ force: true });
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

    cy.get('[data-cy="save-button"]').click();
    cy.wait("@casing_GET");

    cy.get('[data-cy="hydrogeology-menu-item"]').click({ force: true });
    cy.get('[data-cy="hydrotest-menu-item"]').click({ force: true });

    // switch to german
    cy.get('[data-cy="menu"]').click({ force: true });
    cy.contains("span", "DE").click({ force: true });

    // create hydrotest
    cy.get('[data-cy="addHydrotest-button"]').click({ force: true });
    cy.wait("@casing_GET");

    setSelect("reliabilityId", 1);
    setInput("startTime", "2012-11-14T12:06");
    setSelect("casingId", 1);
    toggleMultiSelect("testKindId", [2]);

    cy.get('[data-cy="save-button"]').click({ force: true });
    cy.wait("@hydrotest_GET");
    evaluateDisplayValue("reliability", "fraglich");
    evaluateDisplayValue("casingName", "casing-1");
    evaluateDisplayValue("testKind", "Pump-/Injektionsversuch, variable Rate");

    // update hydrotest
    cy.get('[data-cy="edit-button"]').click({ force: true });

    toggleMultiSelect("flowDirectionId", [1, 0], 3);
    toggleMultiSelect("evaluationMethodId", [1, 0], 4);

    cy.get('[data-cy="addHydrotestResult-button"]').click({ force: true });
    setSelect("hydrotestResults.0.parameterId", 0);

    toggleMultiSelect("testKindId", [2]);
    evaluateMultiSelect("flowDirectionId", []);
    evaluateMultiSelect("evaluationMethodId", []);
    cy.get('[data-cy="hydrotestResult-0"]').should("not.exist");

    toggleMultiSelect("testKindId", [2]);
    toggleMultiSelect("flowDirectionId", [1, 0], 3);
    toggleMultiSelect("evaluationMethodId", [1, 0], 4);
    cy.get('[data-cy="addHydrotestResult-button"]').click({ force: true });
    setSelect("hydrotestResults.0.parameterId", 0, 6);
    setInput("hydrotestResults.0.value", "10");
    setInput("hydrotestResults.0.minValue", "5");
    setInput("hydrotestResults.0.maxValue", "15");
    cy.get('[data-cy="save-button"]').click({ force: true });
    cy.wait("@hydrotest_GET");

    evaluateDisplayValue("casingName", "casing-1");
    evaluateDisplayValue("testKind", "Pump-/Injektionsversuch, variable Rate");
    evaluateDisplayValue("flowDirection", ["Entnahme", "Injektion"]);
    evaluateDisplayValue("evaluationMethod", ["stationär", "instationär"]);
    evaluateDisplayValue("hydrotestResult.0.parameter", "kf-Wert (gesättigt)");
    evaluateDisplayValue("hydrotestResult.0.value", "10 m/s");
    evaluateDisplayValue("hydrotestResult.0.minValue", "5 m/s");
    evaluateDisplayValue("hydrotestResult.0.maxValue", "15 m/s");

    // delete hydrotest
    cy.get('[data-cy="delete-button"]').click({ force: true });
    cy.wait("@hydrotest_GET");
    cy.get("body").should(
      "not.contain",
      "Pump-/Injektionsversuch, variable Rate",
    );
  });
});
