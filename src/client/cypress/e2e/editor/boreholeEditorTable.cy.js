import { login } from "../../e2e/testHelpers";

describe("Borehole editor table tests", () => {
  it("preserves column sorting and active page when navigating", () => {
    login("/editor");

    // sort by name ascending
    cy.contains("th", "Original name").click();
    cy.wait("@edit_list");

    cy.get("tbody").children().eq(0).contains("td", "Aaliyah Casper");
    cy.get("tbody").children().eq(1).contains("td", "Aaliyah Lynch");
    cy.get("tbody").children().eq(2).contains("td", "Aaliyah Pfeffer");

    // navigate to page 2
    cy.get("a").should("have.class", "item").contains("2").click();
    cy.wait("@edit_list");

    cy.get("tbody").children().eq(0).contains("td", "Albin Herzog");
    cy.get("tbody").children().eq(1).contains("td", "Albin Kuhn");
    cy.get("tbody").children().eq(2).contains("td", "Albin Walsh");

    // open first borehole and return to list
    cy.get("tbody").children().eq(0).contains("td", "Albin Herzog").click();
    cy.get('[data-cy="done-menu-item"]').click();
    cy.wait("@edit_list");

    // verify current page is 2
    cy.get("a").should("have.class", "active item").contains("2");
    cy.get("tbody").children().eq(0).contains("td", "Albin Herzog");
    cy.get("tbody").children().eq(1).contains("td", "Albin Kuhn");
    cy.get("tbody").children().eq(2).contains("td", "Albin Walsh");
  });
});
