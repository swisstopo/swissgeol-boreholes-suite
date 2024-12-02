import { clickOnRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers";
import { evaluateInput } from "../helpers/formHelpers";
import { loginAsAdmin, loginAsViewer, selectByDataCyAttribute } from "../helpers/testHelpers";

describe("Viewer tests", () => {
  it("Assures viewer cannot add, edit or delete boreholes", () => {
    loginAsViewer();
    showTableAndWaitForData();

    selectByDataCyAttribute("import-borehole-button").should("have.class", "Mui-disabled");
    selectByDataCyAttribute("new-borehole-button").should("have.class", "Mui-disabled");

    // click on borehole
    clickOnRowWithText("Aaron Rempel");
    // verify all text inputs are readonly on Location tab
    cy.get('input[type="text"]')
      .should("have.length", 14)
      .each(i => {
        cy.wrap(i).should("have.attr", "readonly");
      });

    // click on Borehole tab
    selectByDataCyAttribute("borehole-menu-item").click();
    // verify all text inputs are readonly on Borehole tab
    cy.get('input[type="text"]')
      .should("have.length", 6)
      .each(i => {
        cy.wrap(i).should("have.attr", "readonly");
      });

    selectByDataCyAttribute("edit-button").should("not.exist");
  });

  it("Assures viewer can click on all borehole menu items and see something", () => {
    loginAsViewer();
    showTableAndWaitForData();
    clickOnRowWithText("Aaron Rempel");
    evaluateInput("originalName", "Aaron Rempel");

    selectByDataCyAttribute("borehole-menu-item").click({ force: true });
    evaluateInput("total_depth_tvd", "1'913.61");
    selectByDataCyAttribute("sections-tab").click({ force: true });
    cy.contains("No sections available").should("exist");
    selectByDataCyAttribute("geometry-tab").click({ force: true });
    cy.contains("Top view").should("exist");
    selectByDataCyAttribute("stratigraphy-menu-item").click({ force: true });
    selectByDataCyAttribute("lithology-menu-item").click({ force: true });
    cy.contains("Ibrahim Bednar").should("exist");
    selectByDataCyAttribute("chronostratigraphy-menu-item").click({ force: true });
    cy.contains("Phanerozoic").should("exist");
    selectByDataCyAttribute("lithostratigraphy-menu-item").click({ force: true });
    cy.contains("Surbrunnen-Flysch").should("exist");
    selectByDataCyAttribute("completion-menu-item").click({ force: true });
    cy.contains("No completion available").should("exist");
    selectByDataCyAttribute("hydrogeology-menu-item").click({ force: true });
    selectByDataCyAttribute("wateringress-menu-item").click({ force: true });
    cy.contains("No water ingresses available").should("exist");
    selectByDataCyAttribute("groundwaterlevelmeasurement-menu-item").click({ force: true });
    cy.contains("No groundwater measurements available.").should("exist");
    selectByDataCyAttribute("fieldmeasurement-menu-item").click({ force: true });
    cy.contains("No field measurements available.").should("exist");
    selectByDataCyAttribute("hydrotest-menu-item").click({ force: true });
    cy.contains("No hydrotests available").should("exist");
    selectByDataCyAttribute("attachments-menu-item").click({ force: true });
    cy.contains("Uploaded").should("exist");
    selectByDataCyAttribute("status-menu-item").click({ force: true });
    cy.contains("Publication workflow").should("exist");
  });

  it("Assures viewer cannot multiselect boreholes", () => {
    loginAsAdmin();
    showTableAndWaitForData();
    cy.wait("@edit_list");
    cy.get(".MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root").should("be.visible");

    loginAsViewer();
    cy.wait("@edit_list");
    cy.get(".MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root").should("not.exist");
  });
});
