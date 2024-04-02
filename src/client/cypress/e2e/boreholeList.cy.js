import { loginAsAdmin, loginAsEditor } from "../e2e/helpers/testHelpers";

describe("Borehole list tests", () => {
  it("Boreholes are displayed in correct order with admin login", () => {
    loginAsAdmin();
    cy.visit("/");

    cy.wait("@edit_list");
    cy.get("div[id=map]").should("be.visible");
    cy.get("tbody").children().should("have.length", 100);

    // sort by creation date descending
    cy.contains("th", "Creation date").click();
    cy.wait("@edit_list");

    cy.contains("th", "Creation date")
      .children()
      .first()
      .then($icon => {
        if ($icon.hasClass("up")) {
          // If the list was sorted ascending click again.
          cy.contains("th", "Creation date").click();
        }
      });

    cy.get("tbody").children().eq(0).contains("td", "01.01.2022");
    cy.get("tbody").children().eq(1).contains("td", "31.12.2021");
    cy.get("tbody").children().eq(2).contains("td", "31.12.2021");

    cy.contains("th", "Creation date").click();
    cy.wait("@edit_list");
    cy.get("tbody").children().eq(0).contains("td", "01.01.2021");
    cy.get("tbody").children().eq(1).contains("td", "01.01.2021");
    cy.get("tbody").children().eq(2).contains("td", "01.01.2021");

    // sort by creator descending
    cy.contains("th", "Created by").click();

    cy.contains("th", "Created by")
      .children()
      .first()
      .then($icon => {
        if ($icon.hasClass("up")) {
          // If the list was sorted ascending click again.
          cy.contains("th", "Created by").click();
        }
      });

    cy.get("tbody").children().eq(0).contains("td", "p. user");
    cy.get("tbody").children().eq(1).contains("td", "p. user");
    cy.get("tbody").children().eq(2).contains("td", "p. user");

    cy.contains("th", "Created by").click();
    cy.get("tbody").children().eq(0).contains("td", "A. User");
    cy.get("tbody").children().eq(1).contains("td", "A. User");
    cy.get("tbody").children().eq(2).contains("td", "A. User");

    // sort by name ascending
    cy.contains("th", "Original name").click();
    cy.wait("@edit_list");
    cy.contains("th", "Original name")
      .children()
      .first()
      .then($icon => {
        if ($icon.hasClass("down")) {
          // If the list was sorted descending click again.
          cy.contains("th", "Original name").click();
        }
      });

    cy.get("tbody").children().eq(0).contains("td", "Aaliyah Casper");
    cy.get("tbody").children().eq(1).contains("td", "Aaliyah Lynch");
    cy.get("tbody").children().eq(2).contains("td", "Aaron Bartell");

    // sort by borehole type
    cy.contains("th", "Borehole type").click();
    cy.wait("@edit_list");
    cy.get("tbody").children().eq(0).contains("td", "virtual borehole");
    cy.get("tbody").children().eq(1).contains("td", "virtual borehole");
    cy.get("tbody").children().eq(2).contains("td", "virtual borehole");

    // sort by borehole status
    cy.contains("th", "Borehole status").click();
    cy.wait("@edit_list");
    cy.get("tbody").children().eq(0).contains("td", "open, no completion");
    cy.get("tbody").children().eq(1).contains("td", "open, no completion");
    cy.get("tbody").children().eq(2).contains("td", "open, no completion");

    // sort by total depth
    cy.contains("th", "Borehole length").click();
    cy.wait("@edit_list");
    cy.get("tbody").children().eq(0).contains("td", "1'998.0731671667068");
    cy.get("tbody").children().eq(1).contains("td", "1'997.7856427420795");
    cy.get("tbody").children().eq(2).contains("td", "1'995.4961081945785");
  });

  it("preserves column sorting and active page when navigating", () => {
    loginAsEditor();
    cy.visit("/");

    // sort by name ascending
    cy.contains("th", "Original name").click();
    cy.wait("@edit_list");

    cy.contains("th", "Original name")
      .children()
      .first()
      .then($icon => {
        if (!$icon.hasClass("up")) {
          // Sort list ascending
          cy.contains("th", "Original name").click();
        }
      });

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
    cy.contains("Done").click();
    cy.wait("@edit_list");

    // verify current page is still 4
    cy.get("a").should("have.class", "active item").contains("4");
    cy.get("tbody").children().eq(0).contains("td", "Christine Schuster");
    cy.get("tbody").children().eq(1).contains("td", "Christine Wilderman");
    cy.get("tbody").children().eq(2).contains("td", "Christop Keebler");
  });
});
