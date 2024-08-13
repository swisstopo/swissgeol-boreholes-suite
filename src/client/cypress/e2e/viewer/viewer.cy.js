import { loginAsAdmin, loginAsViewer } from "../helpers/testHelpers";

describe("Viewer tests", () => {
  it("Assures viewer cannot add, edit or delete boreholes", () => {
    loginAsViewer();
    cy.visit("/");

    cy.get('[data-cy="showTableButton"]').click();
    cy.wait("@edit_list");
    cy.get("div[id=map]").should("be.visible");
    cy.get(".MuiDataGrid-root").should("be.visible");
    cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);

    cy.get('[data-cy="import-borehole-button"]').should("have.class", "Mui-disabled");
    cy.get('[data-cy="new-borehole-button"]').should("have.class", "Mui-disabled");

    // click on borehole
    cy.contains(".MuiDataGrid-row", "Aaron Rempel").click();
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
    cy.visit("/");
    cy.get('[data-cy="showTableButton"]').click();
    cy.wait("@edit_list");
    cy.get(".MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root").should("be.visible");

    loginAsViewer();
    cy.visit("/");
    cy.wait("@edit_list");
    cy.get(".MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root").should("not.exist");
  });
});
