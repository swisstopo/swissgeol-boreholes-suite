import { loginAsAdmin, loginAsEditor, returnToOverview } from "../helpers/testHelpers.js";

describe("Borehole editor table tests", () => {
  it("Boreholes are displayed in correct order with admin login", () => {
    loginAsAdmin();
    cy.visit("/");
    cy.get('[data-cy="showTableButton"]').click();

    cy.wait("@edit_list");
    cy.get("div[id=map]").should("be.visible");

    cy.get(".MuiDataGrid-root").should("be.visible");
    cy.get(".loading-indicator").should("not.exist");

    // default soring by name ascending
    cy.get(".MuiDataGrid-row")
      .eq(0)
      .within(() => {
        cy.contains("Aaliyah Casper").should("exist");
      });
    cy.get(".MuiDataGrid-row")
      .eq(1)
      .within(() => {
        cy.contains("Aaliyah Lynch").should("exist");
      });
    cy.get(".MuiDataGrid-row")
      .eq(2)
      .within(() => {
        cy.contains("Aaron Bartell").should("exist");
      });

    // sort by Name descending
    cy.get(".MuiDataGrid-columnHeader").contains("Name").click();
    cy.get(".MuiDataGrid-root").should("be.visible");
    cy.get(".loading-indicator").should("not.exist");

    cy.get(".MuiDataGrid-row")
      .eq(0)
      .within(() => {
        cy.contains("Zena Rath").should("exist");
      });
    cy.get(".MuiDataGrid-row")
      .eq(1)
      .within(() => {
        cy.contains("Zena Mraz").should("exist");
      });
    cy.get(".MuiDataGrid-row")
      .eq(2)
      .within(() => {
        cy.contains("Zena Halvorson").should("exist");
      });

    // sort by borehole length desc
    cy.get(".MuiDataGrid-columnHeader").contains("Borehole length").click();
    cy.get(".MuiDataGrid-columnHeader").contains("Borehole length").click();
    cy.get(".MuiDataGrid-root").should("be.visible");
    cy.get(".loading-indicator").should("not.exist");

    cy.wait("@edit_list");
    cy.get(".MuiDataGrid-row")
      .eq(0)
      .within(() => {
        cy.contains("1998.07").should("exist");
      });
    cy.get(".MuiDataGrid-row")
      .eq(1)
      .within(() => {
        cy.contains("1997.79").should("exist");
      });

    // sort by reference elevation
    cy.get(".MuiDataGrid-columnHeader").contains("Reference elevation").click();

    cy.wait("@edit_list");
    cy.get(".MuiDataGrid-row")
      .eq(0)
      .within(() => {
        cy.contains("3.36").should("exist");
      });
  });

  it("preserves column sorting and active page when navigating", () => {
    loginAsEditor();
    cy.visit("/");
    cy.get('[data-cy="showTableButton"]').click();

    // sort by name descending
    cy.get(".MuiDataGrid-columnHeaderTitle").contains("Name").click();
    cy.wait("@edit_list");

    cy.get(".MuiDataGrid-row")
      .eq(0)
      .within(() => {
        cy.contains("Zena Rath").should("exist");
      });

    // navigate to page 4
    cy.get('[aria-label="next page"]').scrollIntoView().click();
    cy.wait("@edit_list");
    cy.get('[aria-label="next page"]').scrollIntoView().click();
    cy.wait("@edit_list");
    cy.get('[aria-label="next page"]').scrollIntoView().click();
    cy.wait("@edit_list");
    cy.get('[aria-label="next page"]').scrollIntoView().click();
    cy.wait("@edit_list");

    // verify current page is 4
    cy.get(".MuiTablePagination-displayedRows").should("have.text", "401 - 500 of 1627");
    cy.get(".MuiDataGrid-row")
      .eq(0)
      .within(() => {
        cy.contains("Nichole VonRueden").should("exist").click();
      });
    cy.wait("@edit_list");

    // return to list
    returnToOverview();

    // verify current page is still 4
    cy.get('[data-cy="showTableButton"]').click();
    cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
    cy.get(".MuiTablePagination-displayedRows").should("have.text", "401 - 500 of 1627");
    cy.get(".MuiDataGrid-row")
      .eq(0)
      .within(() => {
        cy.contains("Nichole VonRueden").should("exist").click();
      });
  });
});
