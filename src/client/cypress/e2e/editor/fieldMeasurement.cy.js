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
import {
  addItem,
  startEditing,
  saveForm,
  deleteItem,
} from "../helpers/buttonHelpers";

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

    // create field measurement
    addItem("addFieldmeasurement");
    cy.wait("@casing_GET");

    setSelect("reliabilityId", 1);
    setInput("startTime", "2012-11-14T12:06");
    setSelect("casingId", 1);
    setSelect("sampleTypeId", 1);
    setSelect("parameterId", 5);
    setInput("value", "77.1045");

    // close editing mask
    saveForm();

    //assert field measurementis displayed
    evaluateDisplayValue("casingName", "casing-1");
    evaluateDisplayValue("field_measurement_sample_type", "Schöpfprobe");
    evaluateDisplayValue("parameter", "Sauerstoffsättigung");
    evaluateDisplayValue("value", "77.1045 %");

    // edit field measurement
    startEditing();
    setSelect("sampleTypeId", 0);
    saveForm();
    evaluateDisplayValue("field_measurement_sample_type", "Pumpprobe");
    evaluateDisplayValue("casingName", "casing-1");

    // delete field measurement
    deleteItem();
    cy.wait("@fieldmeasurement_DELETE");
    cy.get("body").should("not.contain", "Pumpprobe");
  });
});
