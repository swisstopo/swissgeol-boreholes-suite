import { addItem, saveForm } from "../helpers/buttonHelpers.js";
import { setInput, setSelect, toggleMultiSelect } from "../helpers/formHelpers.js";
import {
  BoreholeTab,
  isActiveMenuItem,
  isInactiveBoreholeTab,
  isMenuItemWithContent,
  isMenuItemWithoutContent,
  navigateInSidebar,
  SidebarMenuItem,
} from "../helpers/navigationHelpers.js";
import {
  createBorehole,
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
    navigateInSidebar(SidebarMenuItem.lithology);
    addItem("addStratigraphy");
    cy.wait("@stratigraphy_POST");

    getElementByDataCy("add-layer-icon").click();
    cy.wait("@layer");
    getElementByDataCy("styled-layer-0").should("contain", "0 m MD");
    getElementByDataCy("styled-layer-0").find('[data-testid="ModeEditIcon"]').click();
    cy.wait("@get-layer-by-id");
    setInput("fromDepth", "0");
    setInput("toDepth", "50");
    saveForm();
    cy.wait(["@update-layer", "@layer"]);
    getElementByDataCy("styled-layer-0").should("contain", "50 m MD");

    // Add chronostratigraphy
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
    navigateInSidebar(SidebarMenuItem.completion);
    isActiveMenuItem(SidebarMenuItem.completion, false);
    addItem("addCompletion");
    cy.location().should(location => {
      expect(location.pathname).to.match(/^\/\d+\/completion\/new$/);
    });
    setInput("name", "Compl-1");
    setSelect("kindId", 1);
    saveForm("completion-header");
    cy.wait("@get-completions-by-boreholeId");

    // After adding completion, borehole and with it the side navigation should be updated
    isActiveMenuItem(SidebarMenuItem.completion, true);
    isMenuItemWithContent(SidebarMenuItem.stratigraphy);
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    isMenuItemWithContent(SidebarMenuItem.lithology);
    isMenuItemWithContent(SidebarMenuItem.chronostratigraphy);
    isMenuItemWithContent(SidebarMenuItem.lithostratigraphy);

    navigateInSidebar(SidebarMenuItem.hydrogeology);
    navigateInSidebar(SidebarMenuItem.waterIngress);
    isActiveMenuItem(SidebarMenuItem.waterIngress, false);
    addItem("addWaterIngress");
    cy.wait("@get-casings-by-boreholeId");
    setSelect("quantityId", 2);
    saveForm();
    isMenuItemWithContent(SidebarMenuItem.hydrogeology);
    isActiveMenuItem(SidebarMenuItem.waterIngress, true);

    navigateInSidebar(SidebarMenuItem.groundwaterLevelMeasurement);
    isActiveMenuItem(SidebarMenuItem.groundwaterLevelMeasurement, false);
    addItem("addGroundwaterLevelMeasurement");
    cy.wait("@get-casings-by-boreholeId");
    setSelect("kindId", 2);
    saveForm();
    isActiveMenuItem(SidebarMenuItem.groundwaterLevelMeasurement, true);

    navigateInSidebar(SidebarMenuItem.fieldMeasurement);
    isActiveMenuItem(SidebarMenuItem.fieldMeasurement, false);
    addItem("addFieldMeasurement");
    cy.wait("@get-casings-by-boreholeId");
    setSelect("fieldMeasurementResults.0.sampleTypeId", 0);
    setSelect("fieldMeasurementResults.0.parameterId", 0, 9);
    setInput("fieldMeasurementResults.0.value", "10");
    saveForm();
    isActiveMenuItem(SidebarMenuItem.fieldMeasurement, true);

    navigateInSidebar(SidebarMenuItem.hydrotest);
    isActiveMenuItem(SidebarMenuItem.hydrotest, false);
    addItem("addHydrotest");
    cy.wait("@get-casings-by-boreholeId");
    toggleMultiSelect("testKindId", [3]);
    saveForm();
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
