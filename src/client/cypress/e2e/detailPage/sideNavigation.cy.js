import { clickOnRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers.js";
import {
  checkElementColorByDataCy,
  createBackfill,
  createBorehole,
  createCasing,
  createCompletion,
  createFieldMeasurement,
  createGroundwaterLevelMeasurement,
  createHydrotest,
  createInstrument,
  createLithologyLayer,
  createStratigraphy,
  createWateringress,
  getElementByDataCy,
  goToRouteAndAcceptTerms,
  returnToOverview,
  selectInputFile,
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
    checkElementColorByDataCy("location-menu-item", "rgb(153, 25, 30)");
    checkElementColorByDataCy("borehole-menu-item", "rgba(0, 0, 0, 0.87)");
    checkElementColorByDataCy("status-menu-item", "rgba(0, 0, 0, 0.87)");

    // Check borehole content tabs
    getElementByDataCy("borehole-menu-item").click();
    const boreholeContentTabs = ["sections-tab", "geometry-tab"];
    boreholeContentTabs.forEach(item => {
      checkElementColorByDataCy(item, "rgb(130, 142, 154)");
    });

    // Check greyed-out main menu items
    const mainMenuItems = [
      "stratigraphy-menu-item",
      "completion-menu-item",
      "hydrogeology-menu-item",
      "attachments-menu-item",
    ];
    mainMenuItems.forEach(item => {
      checkElementColorByDataCy(item, "rgb(130, 142, 154)");
    });

    // Expand Stratigraphy menu and check its child items
    getElementByDataCy("stratigraphy-menu-item").click();
    ["lithology-menu-item", "chronostratigraphy-menu-item", "lithostratigraphy-menu-item"].forEach(item => {
      checkElementColorByDataCy(item, "rgb(130, 142, 154)");
    });

    // Expand Hydrogeology menu and check its child items
    getElementByDataCy("hydrogeology-menu-item").click();
    cy.wait("@codelist_GET");
    [
      "wateringress-menu-item",
      "groundwaterlevelmeasurement-menu-item",
      "fieldmeasurement-menu-item",
      "hydrotest-menu-item",
    ].forEach(item => {
      checkElementColorByDataCy(item, "rgb(130, 142, 154)");
    });

    // Add stratigraphy and Lithology
    cy.get("@borehole_id").then(boreholeId => {
      createStratigraphy(boreholeId, 3000)
        .as("stratigraphy_id")
        .then(id => {
          createLithologyLayer(id, { isStriae: true });
        });
    });

    // Add chronostratigraphy
    getElementByDataCy("chronostratigraphy-menu-item").click();
    cy.wait("@get-layers-by-profileId");
    cy.wait("@chronostratigraphy_GET");
    getElementByDataCy("add-layer-button").click({ force: true });
    getElementByDataCy("add-layer-button").click({ force: true });
    getElementByDataCy("add-layer-button").click({ force: true });
    cy.wait("@chronostratigraphy_POST");

    // Add lithostratigraphy
    getElementByDataCy("lithostratigraphy-menu-item").click();
    cy.wait("@get-layers-by-profileId");
    cy.wait("@lithostratigraphy_GET");
    getElementByDataCy("add-layer-button").click({ force: true });
    getElementByDataCy("add-layer-button").click({ force: true });
    getElementByDataCy("add-layer-button").click({ force: true });
    cy.wait("@lithostratigraphy_POST");

    // Add completion
    cy.get("@borehole_id").then(boreholeId => {
      createCompletion("Comp-1", boreholeId, 16000002, true).as("completion_id");
    });

    // Check completions content tabs and verify that they are greyed out
    getElementByDataCy("completion-menu-item").click();
    ["completion-content-tab-instrumentation", "completion-content-tab-backfill"].forEach(item => {
      checkElementColorByDataCy(item, "rgb(130, 142, 154)");
    });
    getElementByDataCy("completion-content-tab-backfill").click();
    checkElementColorByDataCy("completion-content-tab-casing", "rgb(130, 142, 154)");

    // Add backfill, instrumentation and casing
    cy.get("@borehole_id").then(boreholeId => {
      cy.get("@completion_id").then(completionId => {
        createCasing("casing-1", boreholeId, completionId, "2021-01-01", "2021-01-02", [
          { fromDepth: 0, toDepth: 10, kindId: 25000103 },
        ]);
        createBackfill(completionId, null, 25000109, 25000102, 0, 10, "Lorem.");
        createInstrument(completionId, null, "Inst-1", 25000212, 25000102, 0, 10, "Lorem.");
      });
    });

    // Add hydro module data
    cy.get("@borehole_id").then(id => {
      createHydrotest(id, "2012-11-14T12:06Z", 15203157, [15203175], null, 0, 10);
      createWateringress(id, "2012-11-14T12:06Z", 15203157, 15203161, null, 0, 10);
      createFieldMeasurement(id, "2012-11-14T12:06Z", 15203157, 15203209, 15203219, 10, null, 0, 10);
      createGroundwaterLevelMeasurement(id, "2012-11-14T12:06Z", 15203157, 15203175, null, 0, 10);
    });

    // Add attachment
    getElementByDataCy("attachments-menu-item").click();
    selectInputFile("SKIPBOX.pdf", "application/pdf");

    // Navigate back to overview and verify enabled items
    getElementByDataCy("location-menu-item").click();
    returnToOverview();
    showTableAndWaitForData();
    clickOnRowWithText("AAA_HIPPOPOTHAMUS");

    // Verify that previously greyed-out items are now enabled
    // Check main menu items
    mainMenuItems.forEach(item => {
      checkElementColorByDataCy(item, "rgba(0, 0, 0, 0.87)");
    });

    // Expand stratigraphy menu and check its child items
    getElementByDataCy("stratigraphy-menu-item").click();
    ["lithology-menu-item", "chronostratigraphy-menu-item", "lithostratigraphy-menu-item"].forEach(item => {
      checkElementColorByDataCy(item, "rgba(0, 0, 0, 0.87)");
    });

    // Expand completion menu and check content tabs
    getElementByDataCy("completion-menu-item").click();
    ["completion-content-tab-instrumentation", "completion-content-tab-backfill"].forEach(item => {
      checkElementColorByDataCy(item, "rgb(28, 40, 52)");
    });
    getElementByDataCy("completion-content-tab-backfill").click();
    checkElementColorByDataCy("completion-content-tab-casing", "rgb(28, 40, 52)");

    // Expand hydrogeology menu and check its child items
    getElementByDataCy("hydrogeology-menu-item").click();
    cy.wait("@codelist_GET");
    [
      "wateringress-menu-item",
      "groundwaterlevelmeasurement-menu-item",
      "fieldmeasurement-menu-item",
      "hydrotest-menu-item",
    ].forEach(item => {
      checkElementColorByDataCy(item, "rgba(0, 0, 0, 0.87)");
    });
  });
});
