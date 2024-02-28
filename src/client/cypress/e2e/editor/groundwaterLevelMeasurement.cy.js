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
    cy.get('[data-cy="groundwaterlevelmeasurement-menu-item"]').click({
      force: true,
    });

    // switch to german
    cy.get('[data-cy="menu"]').click({ force: true });
    cy.contains("span", "DE").click({ force: true });

    // create groundwater level measurement
    addItem("addGroundwaterLevelMeasurement");
    cy.wait("@casing_GET");

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

  it("sort groundwaterlevelmeasurement", () => {
    createBorehole({ "extended.original_name": "INTEADAL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/hydrogeology/groundwaterlevelmeasurement`);
    });
    startBoreholeEditing();

    addItem("addGroundwaterLevelMeasurement");
    cy.wait("@casing_GET");
    setInput("fromDepthM", 0);
    setInput("toDepthM", 10);
    setSelect("kindId", 2);
    setSelect("reliabilityId", 1);
    setInput("startTime", "2012-11-14T12:06");
    setInput("levelM", "789.12");
    setInput("levelMasl", "5.4567");
    saveForm();
    cy.wait("@groundwaterlevelmeasurement_GET");

    addItem("addGroundwaterLevelMeasurement");
    cy.wait("@casing_GET");
    setInput("fromDepthM", 0);
    setInput("toDepthM", 12);
    setSelect("kindId", 2);
    setSelect("reliabilityId", 1);
    setInput("startTime", "2012-11-14T12:06");
    setInput("levelM", "789.12");
    setInput("levelMasl", "5.4567");
    saveForm();
    cy.wait("@groundwaterlevelmeasurement_GET");

    cy.get(
      '[data-cy="groundwaterLevelMeasurement-card.0"] [data-cy="todepth-formDisplay"]',
    ).contains("10");
    cy.get(
      '[data-cy="groundwaterLevelMeasurement-card.1"] [data-cy="todepth-formDisplay"]',
    ).contains("12");

    cy.get(
      '[data-cy="groundwaterLevelMeasurement-card.1"] [data-cy="edit-button"]',
    ).click({
      force: true,
    });
    setInput("toDepthM", "8");
    saveForm();
    cy.wait("@groundwaterlevelmeasurement_GET");
    cy.get(
      '[data-cy="groundwaterLevelMeasurement-card.0"] [data-cy="todepth-formDisplay"]',
    ).contains("8");
    cy.get(
      '[data-cy="groundwaterLevelMeasurement-card.1"] [data-cy="todepth-formDisplay"]',
    ).contains("10");

    cy.get(
      '[data-cy="groundwaterLevelMeasurement-card.0"] [data-cy="edit-button"]',
    ).click({
      force: true,
    });
    setInput("fromDepthM", "5");
    saveForm();
    cy.wait("@groundwaterlevelmeasurement_GET");
    cy.get(
      '[data-cy="groundwaterLevelMeasurement-card.0"] [data-cy="fromdepth-formDisplay"]',
    ).contains("0");
    cy.get(
      '[data-cy="groundwaterLevelMeasurement-card.1"] [data-cy="fromdepth-formDisplay"]',
    ).contains("5");
  });
});
