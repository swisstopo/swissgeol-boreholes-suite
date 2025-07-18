import { addItem, deleteItem, saveForm, startEditing } from "../helpers/buttonHelpers";
import {
  evaluateDisplayValue,
  evaluateMultiSelect,
  evaluateTextarea,
  setInput,
  setSelect,
  toggleMultiSelect,
} from "../helpers/formHelpers";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers.js";
import {
  createBorehole,
  createCasing,
  createCompletion,
  createHydrotest,
  goToDetailRouteAndAcceptTerms,
  handlePrompt,
  selectLanguage,
  startBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for the hydrotest editor.", () => {
  it("Creates, updates and deletes hydrotests", () => {
    // Create borehole with completion and casing
    createBorehole({ originalName: "INTEADAL" })
      .as("borehole_id")
      .then(id =>
        createCompletion("test hydrotest", id, 16000002, true)
          .as("completion_id")
          .then(completionId => {
            createCasing("casing-1", id, completionId, "2021-01-01", "2021-01-02", [
              { fromDepth: 0, toDepth: 10, kindId: 25000103 },
            ]);
          }),
      );

    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}`);
      cy.wait(["@borehole"]);
    });
    startBoreholeEditing();

    navigateInSidebar(SidebarMenuItem.hydrogeology);
    navigateInSidebar(SidebarMenuItem.hydrotest);

    selectLanguage("de");

    // create hydrotest
    addItem("addHydrotest");
    cy.wait("@casing_by_borehole_GET");

    setSelect("reliabilityId", 2);
    setInput("startTime", "2012-11-14T12:06");
    setSelect("casingId", 2);
    toggleMultiSelect("testKindId", [3]);

    saveForm();
    cy.wait("@hydrotest_GET");
    evaluateDisplayValue("reliability", "fraglich");
    evaluateDisplayValue("casingName", "test hydrotest - casing-1");
    evaluateDisplayValue("hydrotestKind", "Pump-/Injektionsversuch, variable Rate");

    // update hydrotest
    startEditing();

    toggleMultiSelect("flowDirectionId", [2, 1], 4);
    toggleMultiSelect("evaluationMethodId", [2, 1], 5);

    addItem("addHydrotestResult");
    setSelect("hydrotestResults.0.parameterId", 1);

    toggleMultiSelect("testKindId", [3]);
    evaluateMultiSelect("flowDirectionId", []);
    evaluateMultiSelect("evaluationMethodId", []);
    cy.get('[data-cy="hydrotestResult-0"]').should("not.exist");

    toggleMultiSelect("testKindId", [3]);
    toggleMultiSelect("flowDirectionId", [2, 1], 4);
    toggleMultiSelect("evaluationMethodId", [2, 1], 5);
    addItem("addHydrotestResult");
    setSelect("hydrotestResults.0.parameterId", 0, 6);
    setInput("hydrotestResults.0.value", "10.781676"); // should round to 3 decimals
    setInput("hydrotestResults.0.minValue", "0.00005251154"); // should display in scientific notation with 3 decimals
    setInput("hydrotestResults.0.maxValue", "0.00000012"); /// should display in scientific notation with 1 decimal
    saveForm();
    cy.wait("@hydrotest_GET");

    evaluateDisplayValue("casingName", "test hydrotest - casing-1");
    evaluateDisplayValue("hydrotestKind", "Pump-/Injektionsversuch, variable Rate");
    evaluateDisplayValue("flowDirection", ["Entnahme", "Injektion"]);
    evaluateDisplayValue("evaluationMethod", ["stationär", "instationär"]);
    evaluateDisplayValue("hydrotestResult.0.parameter", "kf-Wert (gesättigt)");
    evaluateDisplayValue("hydrotestResult.0.value", "10.782 m/s");
    evaluateDisplayValue("hydrotestResult.0.minValue", "5.251 x 10-5 m/s");
    evaluateDisplayValue("hydrotestResult.0.maxValue", "1.2 x 10-7 m/s");

    startEditing();
    setInput("comment", "Lorem.");
    saveForm();
    cy.wait("@hydrotest_GET");
    evaluateDisplayValue("comment", "Lorem.");

    // delete hydrotest
    deleteItem();
    handlePrompt("Wollen Sie diesen Eintrag wirklich löschen?", "delete");
    cy.wait("@hydrotest_GET");
    cy.get("body").should("not.contain", "Pump-/Injektionsversuch, variable Rate");
  });

  it("sorts hydrotest", () => {
    createBorehole({ originalName: "INTEADAL" })
      .as("borehole_id")
      .then(id => {
        createHydrotest(id, "2012-11-14T12:06Z", 15203157, [15203175], null, 0, 10);
        createHydrotest(id, "2012-11-14T12:07Z", 15203157, [15203174], null, 0, 12);
        goToDetailRouteAndAcceptTerms(`/${id}/hydrogeology/hydrotest`);
        cy.wait(["@borehole"]);
      });
    startBoreholeEditing();

    cy.get('[data-cy="hydrotest-card.0"] [data-cy="todepth-formDisplay"]').contains("10");
    cy.get('[data-cy="hydrotest-card.1"] [data-cy="todepth-formDisplay"]').contains("12");

    cy.get('[data-cy="hydrotest-card.1"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("toDepthM", "8");
    saveForm();
    cy.wait("@hydrotest_PUT");
    cy.wait("@hydrotest_GET");
    cy.get('[data-cy="hydrotest-card.0"] [data-cy="todepth-formDisplay"]').contains("8");
    cy.get('[data-cy="hydrotest-card.1"] [data-cy="todepth-formDisplay"]').contains("10");

    cy.get('[data-cy="hydrotest-card.0"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("fromDepthM", "5");
    saveForm();
    cy.wait("@hydrotest_PUT");
    cy.wait("@hydrotest_GET");
    cy.get('[data-cy="hydrotest-card.0"] [data-cy="fromdepth-formDisplay"]').contains("0");
    cy.get('[data-cy="hydrotest-card.1"] [data-cy="fromdepth-formDisplay"]').contains("5");
  });

  it("checks for unsaved changes when switching between cards", () => {
    createBorehole({ originalName: "INTEADAL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}/hydrogeology/hydrotest`);
      cy.wait(["@borehole"]);
    });
    startBoreholeEditing();
    cy.wait("@hydrotest_GET");

    cy.get('[data-cy="addhydrotest-button"]').should("not.be.disabled");
    addItem("addHydrotest");
    cy.get('[data-cy="addhydrotest-button"]').should("be.disabled");
    setInput("startTime", "2012-11-14T12:06");
    setSelect("reliabilityId", 2);
    toggleMultiSelect("testKindId", [3]);
    saveForm();
    cy.get('[data-cy="addhydrotest-button"]').should("be.enabled");

    startEditing();
    setInput("comment", "Lorem.");

    // can cancel switching tabs without loosing data
    addItem("addHydrotest");
    handlePrompt("Hydrotest: You have unsaved changes. How would you like to proceed?", "cancel");
    evaluateTextarea("comment", "Lorem.");

    // can reset creating
    addItem("addHydrotest");
    handlePrompt("Hydrotest: You have unsaved changes. How would you like to proceed?", "reset");
    evaluateDisplayValue("comment", "-");

    // can save changes in existing card and switch to new card
    startEditing();
    setInput("comment", "Lorem.");
    addItem("addHydrotest");
    handlePrompt("Hydrotest: You have unsaved changes. How would you like to proceed?", "save");
    evaluateDisplayValue("comment", "Lorem.");

    // can reset creating and switch to existing card
    setInput("startTime", "2012-11-14T12:06");
    setSelect("reliabilityId", 3);
    startEditing();
    handlePrompt("Hydrotest: You have unsaved changes. How would you like to proceed?", "reset");
    cy.get('[data-cy="hydrotest-card.0.edit"]').should("be.visible");
    cy.get('[data-cy="hydrotest-card.1"]').should("not.exist");

    // can save new card and switch to existing card
    addItem("addHydrotest");
    setInput("startTime", "2013-10-02T14:06");
    setSelect("reliabilityId", 2);
    toggleMultiSelect("testKindId", [4]);
    startEditing();
    handlePrompt("Hydrotest: You have unsaved changes. How would you like to proceed?", "save");
    cy.get('[data-cy="hydrotest-card.0.edit"]').should("exist");
    cy.get('[data-cy="hydrotest-card.1"]').should("exist");
  });
});
