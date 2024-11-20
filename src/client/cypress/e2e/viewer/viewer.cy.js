import { clickOnRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers";
import { evaluateInput } from "../helpers/formHelpers";
import { loginAsAdmin, loginAsViewer } from "../helpers/testHelpers";

describe("Viewer tests", () => {
  it("Assures viewer cannot add, edit or delete boreholes", () => {
    loginAsViewer();
    showTableAndWaitForData();

    cy.get('[data-cy="import-borehole-button"]').should("have.class", "Mui-disabled");
    cy.get('[data-cy="new-borehole-button"]').should("have.class", "Mui-disabled");

    // click on borehole
    clickOnRowWithText("Aaron Rempel");
    // verify all text inputs are readonly on Location tab
    cy.get('input[type="text"]')
      .should("have.length", 14)
      .each(i => {
        cy.wrap(i).should("have.attr", "readonly");
      });

    // click on Borehole tab
    cy.get('[data-cy="borehole-menu-item"]').click();
    // verify all text inputs are readonly on Borehole tab
    cy.get('input[type="text"]')
      .should("have.length", 6)
      .each(i => {
        cy.wrap(i).should("have.attr", "readonly");
      });

    cy.get('[data-cy="edit-button"]').should("not.exist");
  });

  it("Assures viewer can click on all borehole menu items and see something", () => {
    loginAsViewer();
    showTableAndWaitForData();
    clickOnRowWithText("Aaron Rempel");
    evaluateInput("originalName", "Aaron Rempel");

    cy.get('[data-cy="borehole-menu-item"]').click({ force: true });
    evaluateInput("total_depth_tvd", "1'913.61");
    cy.get('[data-cy="sections-tab"]').click({ force: true });
    cy.contains("No sections available").should("exist");
    cy.get('[data-cy="geometry-tab"]').click({ force: true });
    cy.contains("Top view").should("exist");
    cy.get('[data-cy="stratigraphy-menu-item"]').click({ force: true });
    cy.get('[data-cy="lithology-menu-item"]').click({ force: true });
    cy.contains("Ibrahim Bednar").should("exist");
    cy.get('[data-cy="chronostratigraphy-menu-item"]').click({ force: true });
    cy.contains("Phanerozoic").should("exist");
    cy.get('[data-cy="lithostratigraphy-menu-item"]').click({ force: true });
    cy.contains("Surbrunnen-Flysch").should("exist");
    cy.get('[data-cy="completion-menu-item"]').click({ force: true });
    cy.contains("No completion available").should("exist");
    cy.get('[data-cy="hydrogeology-menu-item"]').click({ force: true });
    cy.get('[data-cy="wateringress-menu-item"]').click({ force: true });
    cy.contains("No water ingresses available").should("exist");
    cy.get('[data-cy="groundwaterlevelmeasurement-menu-item"]').click({ force: true });
    cy.contains("No groundwater measurements available.").should("exist");
    cy.get('[data-cy="fieldmeasurement-menu-item"]').click({ force: true });
    cy.contains("No field measurements available.").should("exist");
    cy.get('[data-cy="hydrotest-menu-item"]').click({ force: true });
    cy.contains("No hydrotests available").should("exist");
    cy.get('[data-cy="attachments-menu-item"]').click({ force: true });
    cy.contains("Uploaded").should("exist");
    cy.get('[data-cy="status-menu-item"]').click({ force: true });
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
