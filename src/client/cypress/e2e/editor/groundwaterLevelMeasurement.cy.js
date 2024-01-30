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

describe("Tests for the groundwater level measurement editor.", () => {
  beforeEach(function () {
    // add new borehole
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => createStratigraphy(id, 3000))
      .then(response => {
        expect(response).to.have.property("status", 200);
      });

    // open groundwater level measurement editor
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`editor/${id}/hydrogeology/groundwaterlevelmeasurement`);
    });

    // start editing session
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");
  });

  it("Creates, updates and deletes groundwater level measurement", () => {
    // switch to german
    cy.get('[data-cy="menu"]').click({ force: true });
    cy.contains("span", "DE").click({ force: true });

    // create groundwater level measurement
    cy.get('[data-cy="add-groundwaterlevelmeasurement-button"]').click({
      force: true,
    });
    cy.wait("@groundwaterlevelmeasurement_GET");

    setSelect("kindId", 2);
    setSelect("reliabilityId", 1);
    setInput("startTime", "2012-11-14T12:06");
    setInput("levelM", "789.12");
    setInput("levelMasl", "5.4567");

    // close editing mask
    cy.get('[data-cy="close-icon"]').click({ force: true });

    evaluateDisplayValue("gwlm_kind", "Manometer");
    evaluateDisplayValue("gwlm_levelm", "789.12");
    evaluateDisplayValue("gwlm_levelmasl", "5.4567");
    evaluateDisplayValue("reliability", "fraglich");

    // edit groundwater level measurement
    cy.get('[data-cy="edit-icon"]').click({ force: true });
    setSelect("kindId", 1);
    cy.get('[data-cy="close-icon"]').click({ force: true });
    evaluateDisplayValue("gwlm_kind", "Drucksonde");

    // delete groundwater level measurement
    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.wait("@groundwaterlevelmeasurement_DELETE");
    cy.get("body").should("not.contain", "Drucksonde");
  });
});
