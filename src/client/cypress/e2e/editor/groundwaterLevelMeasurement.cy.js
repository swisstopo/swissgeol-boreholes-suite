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

describe("Tests for the groundwater level measurement editor.", () => {
  it("Creates, updates and deletes groundwater level measurement", () => {
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
    setInput("fromDepth", "0");
    setInput("toDepth", "10");
    setSelect("kindId", 2);
    setSelect("materialId", 3);
    setInput("dateStart", "2021-01-01");
    setInput("dateFinish", "2021-01-02");
    setInput("innerDiameter", "3");
    setInput("outerDiameter", "4");

    saveForm();
    cy.wait("@casing_GET");

    cy.get('[data-cy="hydrogeology-menu-item"]').click({ force: true });
    cy.get('[data-cy="groundwaterlevelmeasurement-menu-item"]').click({
      force: true,
    });

    // switch to german
    cy.get('[data-cy="menu"]').click({ force: true });
    cy.contains("span", "DE").click({ force: true });

    // create groundwater level measurement
    addItem("addGroundwaterLevelMeasurement");
    cy.wait("@groundwaterlevelmeasurement_GET");

    setSelect("kindId", 2);
    setSelect("reliabilityId", 1);
    setSelect("casingId", 1);
    setInput("startTime", "2012-11-14T12:06");
    setInput("levelM", "789.12");
    setInput("levelMasl", "5.4567");

    // close editing mask
    saveForm();
    evaluateDisplayValue("casingName", "casing-1");
    evaluateDisplayValue("gwlm_kind", "Manometer");
    evaluateDisplayValue("gwlm_levelm", "789.12");
    evaluateDisplayValue("gwlm_levelmasl", "5.4567");
    evaluateDisplayValue("reliability", "fraglich");

    // edit groundwater level measurement
    startEditing();
    setSelect("kindId", 1);
    saveForm();
    evaluateDisplayValue("gwlm_kind", "Drucksonde");
    evaluateDisplayValue("casingName", "casing-1");

    // delete groundwater level measurement
    deleteItem();
    cy.wait("@groundwaterlevelmeasurement_DELETE");
    cy.get("body").should("not.contain", "Drucksonde");
  });
});
