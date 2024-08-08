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
    cy.get(".MuiDataGrid-row").should("have.length", 100);

    // sort by Name descending
    cy.get(".MuiDataGrid-columnHeader").contains("Name").click();

    cy.get(".MuiDataGrid-row")
      .eq(0) // index is 0-based, so eq(1) is the second row
      .within(() => {
        cy.contains("Aaliyah Casper").should("exist");
      });
    cy.get(".MuiDataGrid-row")
      .eq(1) // index is 0-based, so eq(1) is the second row
      .within(() => {
        cy.contains("Aaliyah Lynch").should("exist");
      });
    cy.get(".MuiDataGrid-row")
      .eq(2) // index is 0-based, so eq(1) is the second row
      .within(() => {
        cy.contains("Aaron Bartell").should("exist");
      });

    // sort by borehole type
    cy.contains("th", "Borehole type").click();
    cy.wait("@edit_list");
    cy.get("tbody").children().eq(0).contains("td", "virtual borehole");
    cy.get("tbody").children().eq(1).contains("td", "virtual borehole");
    cy.get("tbody").children().eq(2).contains("td", "virtual borehole");

    // sort by borehole status
    cy.contains("th", "Drilling purpose").click();
    cy.wait("@edit_list");
    cy.get(".MuiDataGrid-virtualScrollerRenderZone").children().eq(0).contains("td", "open, no completion");
    cy.get("tbody").children().eq(1).contains("td", "open, no completion");
    cy.get("tbody").children().eq(2).contains("td", "open, no completion");

    // sort by total depth
    cy.contains("th", "Borehole length [m MD]").click();
    cy.wait("@edit_list");
    cy.get("tbody").children().eq(0).contains("td", "1'998.0731671667068");
    cy.get("tbody").children().eq(1).contains("td", "1'997.7856427420795");
    cy.get("tbody").children().eq(2).contains("td", "1'995.4961081945785");
  });

  it("preserves column sorting and active page when navigating", () => {
    loginAsEditor();
    cy.visit("/");
    cy.get('[data-cy="showTableButton"]').click();

    // sort by name ascending
    cy.contains("th", "Name").click();
    cy.wait("@edit_list");

    cy.wait("@edit_list");

    cy.get("tbody").children().eq(0).contains("td", "Aaliyah Casper");
    cy.get("tbody").children().eq(1).contains("td", "Aaliyah Lynch");
    cy.get("tbody").children().eq(2).contains("td", "Aaron Bartell");

    // navigate to page 4
    cy.get("a").should("have.class", "item").contains("4").click();
    cy.wait("@edit_list");

    cy.get("tbody").children().eq(0).contains("td", "Christine Schuster");
    cy.get("tbody").children().eq(1).contains("td", "Christine Wilderman");
    cy.get("tbody").children().eq(2).contains("td", "Christop Keebler");

    // verify current page is 4
    cy.get("a").should("have.class", "active item").contains("4");

    // open first borehole
    cy.get("tbody").children().eq(0).contains("td", "Christine Schuster").click();
    cy.wait("@edit_list");

    // return to list
    returnToOverview();

    // verify current page is still 4
    cy.get('[data-cy="showTableButton"]').click();
    cy.get("a").should("have.class", "active item").contains("4");
    cy.get("tbody").children().eq(0).contains("td", "Christine Schuster");
    cy.get("tbody").children().eq(1).contains("td", "Christine Wilderman");
    cy.get("tbody").children().eq(2).contains("td", "Christop Keebler");
  });
});
