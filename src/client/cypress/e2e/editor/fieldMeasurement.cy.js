import {
  createBorehole,
  loginAsAdmin,
  startBoreholeEditing,
  createCompletion,
} from "../helpers/testHelpers";
import {
  evaluateDisplayValue,
  setInput,
  setSelect,
} from "../helpers/formHelpers";

describe("Tests for the field measurement editor.", () => {
  it("Creates, updates and deletes field measurement", () => {
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
    cy.get("[data-cy=completion-content-header-tab-casing]").click();
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
    cy.get('[data-cy="fieldmeasurement-menu-item"]').click({ force: true });

    // switch to german
    cy.get('[data-cy="menu"]').click({ force: true });
    cy.contains("span", "DE").click({ force: true });

    // create field measurement
    cy.get('[data-cy="addFieldmeasurement-button"]').click({
      force: true,
    });
    cy.wait("@fieldmeasurement_GET");

    setSelect("reliabilityId", 1);
    setInput("startTime", "2012-11-14T12:06");
    setSelect("casingId", 1);
    setSelect("sampleTypeId", 1);
    setSelect("parameterId", 5);
    setInput("value", "77.1045");

    // close editing mask
    cy.get('[data-cy="save-button"]').click({ force: true });

    //assert field measurementis displayed
    evaluateDisplayValue("casingName", "casing-1");
    evaluateDisplayValue("field_measurement_sample_type", "Schöpfprobe");
    evaluateDisplayValue("parameter", "Sauerstoffsättigung");
    evaluateDisplayValue("value", "77.1045 %");

    // edit field measurement
    cy.get('[data-cy="edit-button"]').click({ force: true });
    setSelect("sampleTypeId", 0);
    cy.get('[data-cy="save-button"]').click({ force: true });
    evaluateDisplayValue("field_measurement_sample_type", "Pumpprobe");
    evaluateDisplayValue("casingName", "casing-1");

    // delete field measurement
    cy.get('[data-cy="delete-button"]').click({ force: true });
    cy.wait("@fieldmeasurement_DELETE");
    cy.get("body").should("not.contain", "Pumpprobe");
  });
});
