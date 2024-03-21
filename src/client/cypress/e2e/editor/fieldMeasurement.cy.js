import {
  createBorehole,
  loginAsAdmin,
  startBoreholeEditing,
  createCompletion,
  createCasing,
  handlePrompt,
  createFieldMeasurement,
} from "../helpers/testHelpers";
import { evaluateDisplayValue, setInput, setSelect } from "../helpers/formHelpers";
import { addItem, startEditing, saveForm, deleteItem } from "../helpers/buttonHelpers";

beforeEach(() => {
  createBorehole({ "extended.original_name": "INTEADAL" })
    .as("borehole_id")
    .then(id =>
      createCompletion("test fieldmeasurement", id, 16000002, true)
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
});

describe("Tests for the field measurement editor.", () => {
  it("Creates, updates and deletes field measurement", () => {
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/hydrogeology/fieldmeasurement`);

      startBoreholeEditing();
      // switch to german
      cy.get('[data-cy="menu"]').click({ force: true });
      cy.contains("span", "DE").click({ force: true });
      cy.wait(1000);

      // create field measurement
      addItem("addFieldMeasurement");
      cy.wait("@casing_GET");

      setSelect("reliabilityId", 1);
      setInput("startTime", "2012-11-14T12:06");
      setSelect("casingId", 2);
      setSelect("fieldMeasurementResults.0.sampleTypeId", 0);
      setSelect("fieldMeasurementResults.0.parameterId", 0, 9);
      setInput("fieldMeasurementResults.0.value", "10");
      // close editing mask
      saveForm();

      //assert field measurementis displayed
      cy.wait("@fieldmeasurement_GET");
      evaluateDisplayValue("casingName", "casing-1");

      // add another field measurement result
      startEditing();
      cy.wait(500);
      addItem("addFieldMeasurementResult");

      setSelect("fieldMeasurementResults.1.sampleTypeId", 1);
      setSelect("fieldMeasurementResults.1.parameterId", 2, 9);
      setInput("fieldMeasurementResults.1.value", "8.9");
      saveForm();
      cy.wait("@fieldmeasurement_GET");

      evaluateDisplayValue("casingName", "casing-1");
      evaluateDisplayValue("fieldMeasurementResult.0.sampleType", "Pumpprobe");
      evaluateDisplayValue("fieldMeasurementResult.0.parameter", "Temperatur");
      evaluateDisplayValue("fieldMeasurementResult.0.value", "10 °C");
      evaluateDisplayValue("fieldMeasurementResult.1.sampleType", "Schöpfprobe");
      evaluateDisplayValue("fieldMeasurementResult.1.parameter", "elektrische Leitfähigkeit (20 °C)");
      evaluateDisplayValue("fieldMeasurementResult.1.value", "8.9 µS/cm");
      evaluateDisplayValue("reliability", "fraglich");

      // edit field measurement reliability
      startEditing();
      setSelect("reliabilityId", 2);
      saveForm();
      cy.wait("@fieldmeasurement_GET");
      evaluateDisplayValue("reliability", "andere");

      // delete field measurement
      deleteItem();
      handlePrompt("Wollen Sie diesen Eintrag wirklich löschen?", "Löschen");
      cy.wait("@fieldmeasurement_DELETE");
      cy.get("body").should("not.contain", "Pumpprobe");
    });
  });

  it("sorts fieldmeasurement", () => {
    // Create borehole with completion and casings
    cy.get("@borehole_id").then(id => {
      createFieldMeasurement(id, "2012-11-14T12:06Z", 15203157, 15203209, 15203219, 10, null, 0, 10);
      createFieldMeasurement(id, "2012-11-14T12:07Z", 15203157, 15203209, 15203219, 10, null, 0, 12);
      cy.visit(`/editor/${id}/hydrogeology/fieldmeasurement`);

      startBoreholeEditing();
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
});
