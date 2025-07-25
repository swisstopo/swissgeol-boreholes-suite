import { checkRowWithText, clickOnRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers";
import { evaluateInput } from "../helpers/formHelpers";
import {
  BoreholeTab,
  navigateInBorehole,
  navigateInSidebar,
  navigateInStratigraphy,
  SidebarMenuItem,
  StratigraphyTab,
} from "../helpers/navigationHelpers.js";
import { getElementByDataCy, loginAsViewer } from "../helpers/testHelpers";

describe("Viewer tests", () => {
  it("Assures viewer cannot add, edit or delete boreholes", () => {
    loginAsViewer();
    showTableAndWaitForData();

    getElementByDataCy("import-borehole-button").should("have.class", "Mui-disabled");
    getElementByDataCy("new-borehole-button").should("have.class", "Mui-disabled");

    // click on borehole
    clickOnRowWithText("Aaron Rempel");
    // // verify all text inputs are readonly on Location tab
    cy.get(".MuiFormControl-root")
      .should("have.length", 24)
      .each(i => {
        cy.wrap(i).should("have.class", "readonly", "readonly");
      });

    // click on Borehole tab
    navigateInSidebar(SidebarMenuItem.borehole);
    // verify all text inputs are readonly on Borehole tab
    cy.get(".MuiFormControl-root")
      .should("have.length", 16)
      .each(i => {
        cy.wrap(i).should("have.class", "readonly", "readonly");
      });

    getElementByDataCy("edit-button").should("not.exist");
  });

  it("Assures viewer can export boreholes as CSV and JSON but no attachments", () => {
    loginAsViewer();
    showTableAndWaitForData();
    checkRowWithText("Aaron Rempel");
    getElementByDataCy("copy-button").should("not.exist");
    getElementByDataCy("bulkediting-button").should("not.exist");
    getElementByDataCy("delete-button").should("not.exist");
    getElementByDataCy("export-button").click();
    getElementByDataCy("csv-button").should("exist");
    getElementByDataCy("json-button").should("exist");
    getElementByDataCy("cancel-button").click();
    clickOnRowWithText("Aaron Rempel");
    getElementByDataCy("edit-button").should("not.exist");
    getElementByDataCy("export-attachments-button").should("not.exist");
    getElementByDataCy("export-button").should("exist");
  });

  it("Assures viewer can click on all borehole menu items and see something", () => {
    loginAsViewer();
    showTableAndWaitForData();
    clickOnRowWithText("Aaron Rempel");
    evaluateInput("originalName", "Aaron Rempel");
    navigateInSidebar(SidebarMenuItem.borehole);
    evaluateInput("total_depth_tvd", "1'913.61");
    navigateInBorehole(BoreholeTab.sections);
    cy.contains("No sections available").should("exist");
    navigateInBorehole(BoreholeTab.geometry);
    cy.contains("Top view").should("exist");
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    cy.contains("Ibrahim Bednar").should("exist");
    navigateInStratigraphy(StratigraphyTab.chronostratigraphy);
    cy.contains("Phanerozoic").should("exist");
    navigateInStratigraphy(StratigraphyTab.lithostratigraphy);
    cy.contains("Surbrunnen-Flysch").should("exist");
    navigateInSidebar(SidebarMenuItem.completion);
    cy.contains("No completion available").should("exist");
    navigateInSidebar(SidebarMenuItem.hydrogeology);
    navigateInSidebar(SidebarMenuItem.waterIngress);
    cy.contains("No water ingresses available").should("exist");
    navigateInSidebar(SidebarMenuItem.groundwaterLevelMeasurement);
    cy.contains("No groundwater measurements available.").should("exist");
    navigateInSidebar(SidebarMenuItem.fieldMeasurement);
    cy.contains("No field measurements available.").should("exist");
    navigateInSidebar(SidebarMenuItem.hydrotest);
    cy.contains("No hydrotests available").should("exist");
    navigateInSidebar(SidebarMenuItem.attachments);
    cy.contains("No profiles available...").should("exist");
    navigateInSidebar(SidebarMenuItem.status);
    cy.contains("Publication workflow").should("exist");
  });
});
