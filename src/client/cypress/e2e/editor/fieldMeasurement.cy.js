import { createBorehole, loginAsAdmin, startBoreholeEditing, createCompletion } from "../helpers/testHelpers";
import { evaluateDisplayValue, setInput, setSelect } from "../helpers/formHelpers";
import { addItem, startEditing, saveForm, deleteItem } from "../helpers/buttonHelpers";

describe("Tests for the field measurement editor.", () => {
  it("Creates, updates and deletes field measurement", () => {
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => createCompletion("testFieldmeasurement", id, 16000002, true))
      .then(response => {
        expect(response).to.have.property("status", 200);
      });
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/completion`);
    });
    startBoreholeEditing();
    cy.get("[data-cy=completion-content-header-tab-casing]").click();
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
    evaluateDisplayValue("casingName", "testFieldmeasurement - casing-1");

    // edit field measurement
    startEditing();
    addItem("addFieldMeasurementResult");
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
