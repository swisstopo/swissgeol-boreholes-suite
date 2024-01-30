import {
  createBorehole,
  createStratigraphy,
  loginAsAdmin,
} from "../helpers/testHelpers";
import {
  evaluateDisplayValue,
  setInput,
  setSelect,
} from "../helpers/formHelpers";

describe("Tests for the field measurement editor.", () => {
  beforeEach(function () {
    // add new borehole
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => createStratigraphy(id, 3000))
      .then(response => {
        expect(response).to.have.property("status", 200);
      });

    // open field measurement editor
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`editor/${id}/hydrogeology/fieldmeasurement`);
    });

    // start editing session
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");
  });

  it("Creates, updates and deletes field measurement", () => {
    // switch to german
    cy.get('[data-cy="menu"]').click({ force: true });
    cy.contains("span", "DE").click({ force: true });

    // create field measurement
    cy.get('[data-cy="add-fieldmeasurement-button"]').click({
      force: true,
    });
    cy.wait("@fieldmeasurement_GET");

    setSelect("reliabilityId", 1);
    setInput("startTime", "2012-11-14T12:06");
    setSelect("sampleTypeId", 1);
    setSelect("parameterId", 5);
    setInput("value", "77.1045");

    // close editing mask
    cy.get('[data-cy="close-icon"]').click({ force: true });

    //assert field measurementis displayed
    evaluateDisplayValue("field_measurement_sample_type", "Schöpfprobe");
    evaluateDisplayValue("parameter", "Sauerstoffsättigung");
    evaluateDisplayValue("value", "77.1045 %");

    // edit field measurement
    cy.get('[data-cy="edit-icon"]').click({ force: true });
    setSelect("sampleTypeId", 0);
    cy.get('[data-cy="close-icon"]').click({ force: true });
    evaluateDisplayValue("field_measurement_sample_type", "Pumpprobe");

    // delete field measurement
    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.wait("@fieldmeasurement_DELETE");
    cy.get("body").should("not.contain", "Pumpprobe");
  });
});
