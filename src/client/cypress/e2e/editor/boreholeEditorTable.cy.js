import { loginAsAdmin } from "../../e2e/helpers/testHelpers";

describe("Borehole editor table tests", () => {
  it("preserves column sorting and active page when navigating", () => {
    loginAsAdmin();
    cy.visit("/");

    // sort by name ascending
    cy.contains("th", "Original name").click();
    cy.wait("@edit_list");

    cy.get("tbody").children().eq(0).contains("td", "Aaliyah Casper");
    cy.get("tbody").children().eq(1).contains("td", "Aaliyah Lynch");
    cy.get("tbody").children().eq(2).contains("td", "Aaron Bartell");

    // navigate to page 2
    cy.get("a").should("have.class", "item").contains("2").click();
    cy.wait("@edit_list");

    cy.get("tbody").children().eq(0).contains("td", "Andres Miller");
    cy.get("tbody").children().eq(1).contains("td", "Andres Renner");
    cy.get("tbody").children().eq(2).contains("td", "Angus Leuschke");

    // open first borehole and return to list
    cy.get("tbody").children().eq(0).contains("td", "Andres Miller").click();
    cy.get('[data-cy="done-menu-item"]').click();
    cy.wait("@edit_list");

    // verify current page is 2
    cy.get("a").should("have.class", "active item").contains("2");
    cy.get("tbody").children().eq(0).contains("td", "Andres Miller");
    cy.get("tbody").children().eq(1).contains("td", "Andres Renner");
    cy.get("tbody").children().eq(2).contains("td", "Angus Leuschke");
  });
});
