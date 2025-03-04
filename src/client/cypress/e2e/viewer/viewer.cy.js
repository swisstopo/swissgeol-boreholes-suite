import { checkRowWithText, clickOnRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers";
import { evaluateInput } from "../helpers/formHelpers";
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
    getElementByDataCy("borehole-menu-item").click();
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
    getElementByDataCy("borehole-menu-item").click({ force: true });
    evaluateInput("total_depth_tvd", "1'913.61");
    getElementByDataCy("sections-tab").click({ force: true });
    cy.contains("No sections available").should("exist");
    getElementByDataCy("geometry-tab").click({ force: true });
    cy.contains("Top view").should("exist");
    getElementByDataCy("stratigraphy-menu-item").click({ force: true });
    getElementByDataCy("lithology-menu-item").click({ force: true });
    cy.contains("Ibrahim Bednar").should("exist");
    getElementByDataCy("chronostratigraphy-menu-item").click({ force: true });
    cy.contains("Phanerozoic").should("exist");
    getElementByDataCy("lithostratigraphy-menu-item").click({ force: true });
    cy.contains("Surbrunnen-Flysch").should("exist");
    getElementByDataCy("completion-menu-item").click({ force: true });
    cy.contains("No completion available").should("exist");
    getElementByDataCy("hydrogeology-menu-item").click({ force: true });
    getElementByDataCy("wateringress-menu-item").click({ force: true });
    cy.contains("No water ingresses available").should("exist");
    getElementByDataCy("groundwaterlevelmeasurement-menu-item").click({ force: true });
    cy.contains("No groundwater measurements available.").should("exist");
    getElementByDataCy("fieldmeasurement-menu-item").click({ force: true });
    cy.contains("No field measurements available.").should("exist");
    getElementByDataCy("hydrotest-menu-item").click({ force: true });
    cy.contains("No hydrotests available").should("exist");
    getElementByDataCy("attachments-menu-item").click({ force: true });
    cy.contains("Uploaded").should("exist");
    getElementByDataCy("status-menu-item").click({ force: true });
    cy.contains("Publication workflow").should("exist");
  });
});
