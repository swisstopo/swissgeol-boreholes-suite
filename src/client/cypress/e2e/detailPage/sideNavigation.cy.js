import { addItem, saveForm, saveWithSaveBar } from "../helpers/buttonHelpers.js";
import { setInput, setSelect, toggleMultiSelect } from "../helpers/formHelpers.js";
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
  StratigraphyTab,
} from "../helpers/navigationHelpers.js";
import {
  createBorehole,
  goToDetailRouteAndAcceptTerms,
  selectInputFile,
  startBoreholeEditing,
} from "../helpers/testHelpers";

describe("Test for the detail page side navigation.", () => {
  it("tests if navigation points are greyed out if there is no content", () => {
    // Create a borehole and store its ID
    createBorehole({ originalName: "AAA_HIPPOPOTHAMUS", name: "AAA_HIPPOPOTHAMUS" }).as("borehole_id");

    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}`);
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
    cy.wait("@codelist_GET");
    isInactiveBoreholeTab(BoreholeTab.sections, false);
    isInactiveBoreholeTab(BoreholeTab.geometry, false);

    // Check empty Stratigraphy
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    cy.wait("@getAllAttachments");
    cy.contains("No stratigraphies available...");
    cy.contains("Create empty stratigraphy");

    // Expand Hydrogeology menu and check its child items
    navigateInSidebar(SidebarMenuItem.hydrogeology);
    isMenuItemWithoutContent(SidebarMenuItem.waterIngress);
    isMenuItemWithoutContent(SidebarMenuItem.groundwaterLevelMeasurement);
    isMenuItemWithoutContent(SidebarMenuItem.fieldMeasurement);
    isMenuItemWithoutContent(SidebarMenuItem.hydrotest);

    // Add stratigraphy and Lithology
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    addItem("addEmptyStratigraphy");
    setInput("name", "AUTODESPERADO");
    saveWithSaveBar();
    cy.wait(["@lithology_by_stratigraphyId_GET", "@lithological_description", "@facies_description"]);
    isActiveMenuItem(SidebarMenuItem.stratigraphy, true);

    // Add completion
    navigateInSidebar(SidebarMenuItem.completion);
    isActiveMenuItem(SidebarMenuItem.completion, false);
    cy.wait("@completion_GET");
    cy.contains("No borehole architecture available").should("exist");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    addItem("addCompletion");
    cy.location().should(location => {
      expect(location.pathname).to.match(/^\/\d+\/completion\/new$/);
    });
    setInput("name", "Compl-1");
    setSelect("kindId", 1);
    saveForm("completion-header");
    cy.wait([
      "@completion_GET",
      "@casing_by_completion_GET",
      "@instrumentation_by_completion_GET",
      "@backfill_by_completion_GET",
    ]);

    cy.get(".MuiCircularProgress-root").should("not.exist");

    // After adding completion, borehole and with it the side navigation should be updated
    isActiveMenuItem(SidebarMenuItem.completion, true);
    isMenuItemWithContent(SidebarMenuItem.stratigraphy);
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    isActiveTab(StratigraphyTab.lithology + "-tab");
    isInactiveTab(StratigraphyTab.chronostratigraphy + "-tab");
    isInactiveTab(StratigraphyTab.lithostratigraphy + "-tab");

    navigateInSidebar(SidebarMenuItem.hydrogeology);
    navigateInSidebar(SidebarMenuItem.waterIngress);
    isActiveMenuItem(SidebarMenuItem.waterIngress, false);
    addItem("addWaterIngress");
    cy.wait("@casing_by_borehole_GET");
    setSelect("quantityId", 2);
    saveForm();
    cy.wait(["@wateringress_POST", "@wateringress_GET", "@borehole_by_id"]);
    isMenuItemWithContent(SidebarMenuItem.hydrogeology);
    isActiveMenuItem(SidebarMenuItem.waterIngress, true);

    navigateInSidebar(SidebarMenuItem.groundwaterLevelMeasurement);
    isActiveMenuItem(SidebarMenuItem.groundwaterLevelMeasurement, false);
    addItem("addGroundwaterLevelMeasurement");
    cy.wait("@casing_by_borehole_GET");
    setSelect("kindId", 2);
    saveForm();
    cy.wait(["@groundwaterlevelmeasurement_POST", "@groundwaterlevelmeasurement_GET", "@borehole_by_id"]);
    isActiveMenuItem(SidebarMenuItem.groundwaterLevelMeasurement, true);

    navigateInSidebar(SidebarMenuItem.fieldMeasurement);
    isActiveMenuItem(SidebarMenuItem.fieldMeasurement, false);
    addItem("addFieldMeasurement");
    cy.wait("@casing_by_borehole_GET");
    setSelect("fieldMeasurementResults.0.sampleTypeId", 0);
    setSelect("fieldMeasurementResults.0.parameterId", 0, 9);
    setInput("fieldMeasurementResults.0.value", "10");
    saveForm();
    cy.wait(["@fieldmeasurement_POST", "@fieldmeasurement_GET", "@borehole_by_id"]);
    isActiveMenuItem(SidebarMenuItem.fieldMeasurement, true);

    navigateInSidebar(SidebarMenuItem.hydrotest);
    isActiveMenuItem(SidebarMenuItem.hydrotest, false);
    addItem("addHydrotest");
    cy.wait("@casing_by_borehole_GET");
    toggleMultiSelect("testKindId", [3]);
    cy.wait("@codelist_by_testKindIds_GET");
    saveForm();
    cy.wait(["@hydrotest_POST", "@hydrotest_GET", "@borehole_by_id"]);
    isActiveMenuItem(SidebarMenuItem.hydrotest, true);
    isMenuItemWithContent(SidebarMenuItem.waterIngress);
    isMenuItemWithContent(SidebarMenuItem.groundwaterLevelMeasurement);
    isMenuItemWithContent(SidebarMenuItem.fieldMeasurement);

    // Add attachment
    navigateInSidebar(SidebarMenuItem.attachments);
    selectInputFile("SKIPBOX.pdf", "application/pdf");
    isActiveMenuItem(SidebarMenuItem.attachments, true);
  });
});
