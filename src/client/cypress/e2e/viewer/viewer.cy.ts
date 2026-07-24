import { checkRowWithText, clickOnRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers";
import { evaluateInput } from "../helpers/formHelpers";
import {
  BoreholeTab,
  navigateInBorehole,
  navigateInSidebar,
  navigateInStratigraphy,
  SidebarMenuItem,
  StratigraphyTab,
} from "../helpers/navigationHelpers";
import { loginAsViewer } from "../helpers/testHelpers";

describe("Viewer tests", () => {
  it("Assures viewer cannot add, edit or delete boreholes", () => {
    loginAsViewer();
    showTableAndWaitForData();

    cy.dataCy("import-borehole-button").should("have.class", "Mui-disabled");
    cy.dataCy("new-borehole-button").should("have.class", "Mui-disabled");

    // click on borehole
    clickOnRowWithText("Addie Blick");
    // // verify all text inputs are readonly on Location tab
    cy.get(".MuiFormControl-root")
      .should("have.length", 15)
      .each(i => {
        cy.wrap(i).should("have.class", "readonly", "readonly");
      });

    // click on Borehole tab
    navigateInSidebar(SidebarMenuItem.borehole);
    // verify all text inputs are readonly on Borehole tab
    cy.get(".MuiFormControl-root")
      .should("have.length", 23)
      .each(i => {
        cy.wrap(i).should("have.class", "readonly", "readonly");
      });

    cy.dataCy("edit-button").should("not.exist");
  });

  it("Assures viewer can export boreholes as CSV and JSON including attachments", () => {
    loginAsViewer();
    showTableAndWaitForData();
    checkRowWithText("Addie Blick");
    cy.dataCy("copy-button").should("not.exist");
    cy.dataCy("bulkediting-button").should("not.exist");
    cy.dataCy("delete-button").should("not.exist");
    cy.dataCy("export-button").click();
    cy.dataCy("csv-button").should("exist");
    cy.dataCy("json-button").should("exist");
    cy.dataCy("exportjsonprofile-button").should("exist");
    cy.dataCy("cancel-button").click();
    clickOnRowWithText("Addie Blick");
    cy.dataCy("edit-button").should("not.exist");
    cy.dataCy("export-button").click();
    cy.dataCy("csv-button").should("exist");
    cy.dataCy("json-button").should("exist");
    cy.dataCy("exportjsonprofile-button").should("exist");
  });

  it("Assures viewer can click on all borehole menu items and see something", () => {
    loginAsViewer();
    showTableAndWaitForData();
    clickOnRowWithText("Aisha Thiel");
    navigateInSidebar(SidebarMenuItem.borehole);
    evaluateInput("originalName", "Aisha Thiel");
    navigateInBorehole(BoreholeTab.sections);
    cy.contains("Section name").should("exist");
    navigateInBorehole(BoreholeTab.geometry);
    cy.contains("Top view").should("exist");
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    cy.wait("@lithology_by_stratigraphyId_GET");
    navigateInStratigraphy(StratigraphyTab.chronostratigraphy);
    navigateInStratigraphy(StratigraphyTab.lithostratigraphy);
    navigateInSidebar(SidebarMenuItem.completion);
    cy.wait("@completion_GET");
    cy.contains("Completion date: start").should("exist");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    // Todo reanable and fix flakiness https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2390
    // navigateInSidebar(SidebarMenuItem.hydrogeology);
    // navigateInSidebar(SidebarMenuItem.waterIngress);
    // cy.contains("No water ingresses available").should("exist");
    // navigateInSidebar(SidebarMenuItem.groundwaterLevelMeasurement);
    // cy.contains("No groundwater measurements available.").should("exist");
    // navigateInSidebar(SidebarMenuItem.fieldMeasurement);
    // cy.contains("No field measurements available.").should("exist");
    // navigateInSidebar(SidebarMenuItem.hydrotest);
    // cy.contains("No hydrotests available").should("exist");
    navigateInSidebar(SidebarMenuItem.attachments);
    cy.contains("ADP.pdf").should("exist");
    cy.dataCy("status-menu-item").should("not.exist"); // viewer cannot see status menu item
  });
});
