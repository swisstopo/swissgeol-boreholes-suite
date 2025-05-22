import {
  BoreholeTab,
  isActiveMenuItem,
  isActiveTab,
  isInactiveBoreholeTab,
  isInactiveTab,
  isMenuItemWithContent,
  isMenuItemWithoutContent,
  navigateInSidebar,
  SidebarMenuItem,
} from "../helpers/navigationHelpers.js";
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
    isActiveMenuItem(SidebarMenuItem.location, true);
    isMenuItemWithContent(SidebarMenuItem.borehole);
    isMenuItemWithoutContent(SidebarMenuItem.stratigraphy);
    isMenuItemWithoutContent(SidebarMenuItem.completion);
    isMenuItemWithoutContent(SidebarMenuItem.hydrogeology);
    isMenuItemWithoutContent(SidebarMenuItem.attachments);
    isMenuItemWithContent(SidebarMenuItem.status);

    // Check borehole content tabs
    navigateInSidebar(SidebarMenuItem.borehole);
    isInactiveBoreholeTab(BoreholeTab.sections, false);
    isInactiveBoreholeTab(BoreholeTab.geometry, false);

    // Expand Stratigraphy menu and check its child items
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    isMenuItemWithoutContent(SidebarMenuItem.lithology);
    isMenuItemWithoutContent(SidebarMenuItem.chronostratigraphy);
    isMenuItemWithoutContent(SidebarMenuItem.lithostratigraphy);

    // Expand Hydrogeology menu and check its child items
    navigateInSidebar(SidebarMenuItem.hydrogeology);
    isMenuItemWithoutContent(SidebarMenuItem.waterIngress);
    isMenuItemWithoutContent(SidebarMenuItem.groundwaterLevelMeasurement);
    isMenuItemWithoutContent(SidebarMenuItem.fieldMeasurement);
    isMenuItemWithoutContent(SidebarMenuItem.hydrotest);

    // Add stratigraphy and Lithology
    cy.get("@borehole_id").then(boreholeId => {
      createStratigraphy(boreholeId, 3000)
        .as("stratigraphy_id")
        .then(id => {
          createLithologyLayer(id, { isStriae: true });
        });
    });

    // Add chronostratigraphy
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    navigateInSidebar(SidebarMenuItem.chronostratigraphy);
    getElementByDataCy("add-layer-button").click({ force: true });
    getElementByDataCy("add-layer-button").click({ force: true });
    getElementByDataCy("add-layer-button").click({ force: true });
    cy.wait("@chronostratigraphy_POST");

    // Add lithostratigraphy
    navigateInSidebar(SidebarMenuItem.lithostratigraphy);
    getElementByDataCy("add-layer-button").click({ force: true });
    getElementByDataCy("add-layer-button").click({ force: true });
    getElementByDataCy("add-layer-button").click({ force: true });
    cy.wait("@lithostratigraphy_POST");

    // Add completion
    cy.get("@borehole_id").then(boreholeId => {
      createCompletion("Comp-1", boreholeId, 16000002, true).as("completion_id");
    });

    // Check completions content tabs and verify that they are greyed out
    navigateInSidebar(SidebarMenuItem.completion);
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
    navigateInSidebar(SidebarMenuItem.attachments);
    selectInputFile("SKIPBOX.pdf", "application/pdf");

    // Verify that previously greyed-out items are now enabled
    isMenuItemWithContent(SidebarMenuItem.stratigraphy);
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    isMenuItemWithContent(SidebarMenuItem.lithology);
    isMenuItemWithContent(SidebarMenuItem.chronostratigraphy);
    isMenuItemWithContent(SidebarMenuItem.lithostratigraphy);

    isMenuItemWithContent(SidebarMenuItem.completion);

    isMenuItemWithContent(SidebarMenuItem.hydrogeology);
    navigateInSidebar(SidebarMenuItem.hydrogeology);
    isMenuItemWithContent(SidebarMenuItem.waterIngress);
    isMenuItemWithContent(SidebarMenuItem.groundwaterLevelMeasurement);
    isMenuItemWithContent(SidebarMenuItem.fieldMeasurement);
    isMenuItemWithContent(SidebarMenuItem.hydrotest);

    isActiveMenuItem(SidebarMenuItem.attachments, true);

    // Expand completion menu and check content tabs
    navigateInSidebar(SidebarMenuItem.completion);
    isActiveTab("completion-content-tab-casing");
    cy.wait("@get-casings-by-completionId");
    ["completion-content-tab-instrumentation", "completion-content-tab-backfill"].forEach(item => {
      isInactiveTab(item, true);
    });
    getElementByDataCy("completion-content-tab-backfill").click();
    cy.wait("@backfill_GET");
    isInactiveTab("completion-content-tab-casing", true);
  });
});
