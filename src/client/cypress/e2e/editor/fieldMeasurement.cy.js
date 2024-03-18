import {
  createBorehole,
  loginAsAdmin,
  startBoreholeEditing,
  createCompletion,
  createCasing,
  handlePrompt,
} from "../helpers/testHelpers";
import { evaluateDisplayValue, setInput, setSelect } from "../helpers/formHelpers";
import { addItem, startEditing, saveForm, deleteItem } from "../helpers/buttonHelpers";

describe("Tests for the field measurement editor.", () => {
  it("Creates, updates and deletes field measurement", () => {
    // Create borehole with completion and casings
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id =>
        createCompletion("test fieldmeasurement", id, 16000002, true)
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

    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/completion`);
    });
    startBoreholeEditing();

    cy.get('[data-cy="hydrogeology-menu-item"]').click({ force: true });
    cy.get('[data-cy="fieldmeasurement-menu-item"]').click({ force: true });

    // switch to german
    cy.get('[data-cy="menu"]').click({ force: true });
    cy.contains("span", "DE").click({ force: true });

    cy.wait(1000);
    // create field measurement
    addItem("addFieldmeasurement");
    cy.wait("@casing_GET");

    setSelect("reliabilityId", 1);
    setInput("startTime", "2012-11-14T12:06");
    setSelect("casingId", 1);

    // close editing mask
    saveForm();

    //assert field measurementis displayed
    cy.wait("@fieldmeasurement_GET");
    evaluateDisplayValue("casingName", "test fieldmeasurement - casing-1");

    // edit field measurement
    startEditing();
    addItem("addFieldmeasurementResult");
    setSelect("fieldMeasurementResults.0.sampleTypeId", 0);
    setSelect("fieldMeasurementResults.0.parameterId", 0, 9);
    setInput("fieldMeasurementResults.0.value", "10");
    saveForm();
    cy.wait("@fieldmeasurement_GET");

    evaluateDisplayValue("fieldMeasurementResult.0.sampleType", "Pumpprobe");
    evaluateDisplayValue("fieldMeasurementResult.0.parameter", "Temperatur");
    evaluateDisplayValue("fieldMeasurementResult.0.value", "10 °C");

    // delete field measurement
    deleteItem();
    handlePrompt("Wollen Sie diesen Eintrag wirklich löschen?", "Löschen");
    cy.wait("@fieldmeasurement_DELETE");
    cy.get("body").should("not.contain", "Pumpprobe");
  });

  it("sorts fieldmeasurement", () => {
    createBorehole({ "extended.original_name": "INTEADAL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/hydrogeology/fieldmeasurement`);
    });
    startBoreholeEditing();

    addItem("addFieldmeasurement");
    cy.wait("@casing_GET");
    setInput("fromDepthM", 0);
    setInput("toDepthM", 10);
    setSelect("reliabilityId", 1);
    setInput("startTime", "2012-11-14T12:06");
    saveForm();
    cy.wait("@fieldmeasurement_GET");

    cy.wait(1000);
    addItem("addFieldmeasurement");
    cy.wait("@casing_GET");
    setInput("fromDepthM", 0);
    setInput("toDepthM", 12);
    setSelect("reliabilityId", 1);
    setInput("startTime", "2012-11-14T12:06");
    saveForm();
    cy.wait("@fieldmeasurement_GET");

    cy.get('[data-cy="fieldMeasurement-card.0"] [data-cy="todepth-formDisplay"]').contains("10");
    cy.get('[data-cy="fieldMeasurement-card.1"] [data-cy="todepth-formDisplay"]').contains("12");

    cy.get('[data-cy="fieldMeasurement-card.1"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("toDepthM", "8");
    saveForm();
    cy.wait("@fieldmeasurement_GET");
    cy.get('[data-cy="fieldMeasurement-card.0"] [data-cy="todepth-formDisplay"]').contains("8");
    cy.get('[data-cy="fieldMeasurement-card.1"] [data-cy="todepth-formDisplay"]').contains("10");

    cy.get('[data-cy="fieldMeasurement-card.0"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("fromDepthM", "5");
    saveForm();
    cy.wait("@fieldmeasurement_GET");
    cy.get('[data-cy="fieldMeasurement-card.0"] [data-cy="fromdepth-formDisplay"]').contains("0");
    cy.get('[data-cy="fieldMeasurement-card.1"] [data-cy="fromdepth-formDisplay"]').contains("5");
  });
});
