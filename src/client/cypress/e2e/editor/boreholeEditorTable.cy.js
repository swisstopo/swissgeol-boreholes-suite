import { login } from "../../e2e/testHelpers";

describe("Borehole editor table tests", () => {
  it("memorizes the active page when navigating boreholes", () => {
    login("/editor");
    cy.wait("@edit_list");

    // navigate to page 4
    cy.get("a").should("have.class", "item").contains("4").click();
    cy.wait("@edit_list");

    cy.get("tbody").children().eq(0).contains("td", "Giovani").click();
    cy.get('[data-cy="done-menu-item"]').click();
    cy.wait("@edit_list");

    // verify current page is 4
    cy.get("a").should("have.class", "active item").contains("4");
  });

  it("preserves column sorting when navigating through pages", () => {
    login("/editor");

    // sort by name ascending
    cy.contains("th", "Original name").click();
    cy.wait("@edit_list");

    cy.get("tbody").children().eq(0).contains("td", "Aaron");
    cy.get("tbody").children().eq(1).contains("td", "Aaron");
    cy.get("tbody").children().eq(2).contains("td", "Aaron");

    // navigate to page 2
    cy.get("a").should("have.class", "item").contains("2").click();
    cy.wait("@edit_list");

    cy.get("tbody").children().eq(0).contains("td", "Albin");
    cy.get("tbody").children().eq(1).contains("td", "Albina");
    cy.get("tbody").children().eq(2).contains("td", "Alden");
  });
});
