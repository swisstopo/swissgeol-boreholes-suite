import { addItem, saveForm } from "../helpers/buttonHelpers.js";
import { clickOnRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers.js";
import { setInput, setSelect } from "../helpers/formHelpers.js";
import {
  createBorehole,
  createFieldMeasurement,
  createGroundwaterLevelMeasurement,
  createHydrotest,
  createWateringress,
  goToRouteAndAcceptTerms,
  returnToOverview,
  startBoreholeEditing,
} from "../helpers/testHelpers";

describe("Test for the detail page side navigation.", () => {
  it("tests if navigation points are greyed out if there is no content", () => {
    // Create a borehole and store its ID
    createBorehole({ "extended.original_name": "AAA_HIPPOPOTHAMUS", "custom.alternate_name": "AAA_HIPPOPOTHAMUS" }).as(
      "borehole_id",
    );

    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}`);
      startBoreholeEditing();
    });

    // Check that some menu items are enabled (not greyed out)
    cy.get('[data-cy="location-menu-item"]').should("have.css", "color", "rgb(153, 25, 30)");
    cy.get('[data-cy="borehole-menu-item"]').should("have.css", "color", "rgba(0, 0, 0, 0.87)");
    cy.get('[data-cy="status-menu-item"]').should("have.css", "color", "rgba(0, 0, 0, 0.87)");

    // Check greyed-out main menu items
    const mainMenuItems = ["stratigraphy-menu-item", "completion-menu-item", "hydrogeology-menu-item"];

    mainMenuItems.forEach(item => {
      cy.get(`[data-cy="${item}"]`).should("have.css", "color", "rgb(130, 142, 154)");
    });

    // Expand Stratigraphy menu and check its child items
    cy.get('[data-cy="stratigraphy-menu-item"]').click();
    ["lithology-menu-item", "chronostratigraphy-menu-item", "lithostratigraphy-menu-item"].forEach(item => {
      cy.get(`[data-cy="${item}"]`).should("have.css", "color", "rgb(130, 142, 154)");
    });

    // Expand Hydrogeology menu and check its child items
    cy.get('[data-cy="hydrogeology-menu-item"]').click();
    [
      "wateringress-menu-item",
      "groundwaterlevelmeasurement-menu-item",
      "fieldmeasurement-menu-item",
      "hydrotest-menu-item",
    ].forEach(item => {
      cy.get(`[data-cy="${item}"]`).should("have.css", "color", "rgb(130, 142, 154)");
    });

    // Add stratigraphy and Lithology
    cy.get("@borehole_id").then(boreholeId => {
      createStratigraphy(boreholeId, 3000)
        .as("stratigraphy_id")
        .then(id => {
          createLithologyLayer(id, { isStriae: true });
        });
    });

    // Add Chronostratigraphy
    cy.get(`[data-cy="chronostratigraphy-menu-item"]`).click();
    cy.wait("@get-layers-by-profileId");
    cy.wait("@chronostratigraphy_GET");
    cy.get('[data-cy="add-layer-button"]').click({ force: true });
    cy.get('[data-cy="add-layer-button"]').click({ force: true });
    cy.get('[data-cy="add-layer-button"]').click({ force: true });
    cy.wait("@chronostratigraphy_POST");
    cy.wait("@layer");

    // Add Lithostratigraphy
    cy.get(`[data-cy="lithostratigraphy-menu-item"]`).click();
    cy.wait("@get-layers-by-profileId");
    cy.wait("@lithostratigraphy_GET");
    cy.get('[data-cy="add-layer-button"]').click({ force: true });
    cy.get('[data-cy="add-layer-button"]').click({ force: true });
    cy.get('[data-cy="add-layer-button"]').click({ force: true });
    cy.wait("@lithostratigraphy_POST");
    cy.wait("@layer");

    // Add Completion
    cy.get('[data-cy="completion-menu-item"]').click();
    addItem("addCompletion");
    cy.wait("@codelist_GET");
    setInput("name", "Compl-1");
    setSelect("kindId", 1);
    saveForm("completion-header");
    cy.wait("@get-completions-by-boreholeId");

    // Add Hydro module data
    cy.get("@borehole_id").then(id => {
      createHydrotest(id, "2012-11-14T12:06Z", 15203157, [15203175], null, 0, 10);
      createWateringress(id, "2012-11-14T12:06Z", 15203157, 15203161, null, 0, 10);
      createFieldMeasurement(id, "2012-11-14T12:06Z", 15203157, 15203209, 15203219, 10, null, 0, 10);
      createGroundwaterLevelMeasurement(id, "2012-11-14T12:06Z", 15203157, 15203175, null, 0, 10);
    });

    // Navigate back to overview and verify enabled items
    cy.get('[data-cy="location-menu-item"]').click();
    returnToOverview();
    showTableAndWaitForData();
    clickOnRowWithText("AAA_HIPPOPOTHAMUS");

    // Verify that previously greyed-out items are now enabled
    // Check main menu items
    mainMenuItems.forEach(item => {
      cy.get(`[data-cy="${item}"]`).should("have.css", "color", "rgba(0, 0, 0, 0.87)");
    });

    // Expand Stratigraphy menu and check its child items
    cy.get('[data-cy="stratigraphy-menu-item"]').click();
    ["lithology-menu-item", "chronostratigraphy-menu-item", "lithostratigraphy-menu-item"].forEach(item => {
      cy.get(`[data-cy="${item}"]`).should("have.css", "color", "rgba(0, 0, 0, 0.87)");
    });

    // Expand Hydrogeology menu and check its child items
    cy.get('[data-cy="hydrogeology-menu-item"]').click();
    [
      "wateringress-menu-item",
      "groundwaterlevelmeasurement-menu-item",
      "fieldmeasurement-menu-item",
      "hydrotest-menu-item",
    ].forEach(item => {
      cy.get(`[data-cy="${item}"]`).should("have.css", "color", "rgba(0, 0, 0, 0.87)");
    });
  });
});
