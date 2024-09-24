import { clickOnRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers";
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
    cy.get('input[type="text"]').each(i => {
      cy.wrap(i).should("have.attr", "readonly");
    });

    // click on Borehole tab
    cy.get('[data-cy="borehole-menu-item"]').click();
    // verify all text inputs are readonly on Borehole tab
    cy.get('input[type="text"]').each(i => {
      cy.wrap(i).should("have.attr", "readonly");
    });

    cy.get('[data-cy="edit-button"]').should("not.exist");
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
