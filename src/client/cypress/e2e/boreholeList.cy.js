import {
  loginAsAdmin,
  loginAsEditorInViewerMode,
} from "../e2e/helpers/testHelpers";

describe("Borehole list tests", () => {
  it("Boreholes are displayed in correct order with editor login", () => {
    cy.intercept("/api/v1/borehole").as("borehole");
    loginAsEditorInViewerMode();
    cy.visit("/");

    cy.get("div[id=map]").should("be.visible");

    cy.get("tbody").children().should("have.length", 100);

    // sort by name ascending
    cy.contains("div", "Original name")
      .children()
      .first()
      .then($icon => {
        if (!$icon.hasClass("up")) {
          // Sort list ascending
          cy.contains("div", "Original name").click();
        }
      });

    cy.wait("@borehole");

    // contains names
    cy.contains("td", "Aaron Bartell");
    cy.contains("td", "Aaron Kautzer");
    cy.contains("td", "Aaron Rempel");
    cy.contains("td", "Abigail Kihn");

    // contains date (restriction date)
    cy.contains("td", "01.04.2021");

    // contains total depth
    cy.contains("td", "567.0068294587577");
    cy.contains("td", "1'529.783236575212");

    // sort by name descending
    cy.contains("div", "Original name").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "Zena Rath");
    cy.get("tbody").children().eq(1).contains("td", "Zena Mraz");
    cy.get("tbody").children().eq(2).contains("td", "Zena Halvorson");

    // sort by total depth
    cy.contains("div", "Borehole length [m MD]").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "0.362701714207745");
    cy.get("tbody").children().eq(1).contains("td", "0.6502261388349468");
    cy.get("tbody").children().eq(2).contains("td", "2.9397606863359735");

    cy.contains("div", "Borehole length [m MD]").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "1'998.0731671667068");
    cy.get("tbody").children().eq(1).contains("td", "1'997.7856427420795");
    cy.get("tbody").children().eq(2).contains("td", "1'995.4961081945785");

    // sort by drilling date
    cy.contains("div", "End of drilling date").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "01.01.2021");
    cy.get("tbody").children().eq(1).contains("td", "01.01.2021");
    cy.get("tbody").children().eq(2).contains("td", "02.01.2021");

    cy.contains("div", "End of drilling date").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "01.01.2022");
    cy.get("tbody").children().eq(1).contains("td", "01.01.2022");
    cy.get("tbody").children().eq(2).contains("td", "31.12.2021");

    // sort by borehole type (column of original name)
    cy.contains("div", "Borehole type").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "borehole");
    cy.get("tbody").children().eq(1).contains("td", "borehole");
    cy.get("tbody").children().eq(2).contains("td", "borehole");
  });

  it("Boreholes are displayed in correct order with admin login", () => {
    cy.intercept("/api/v1/borehole").as("borehole");
    cy.intercept("/api/v1/borehole/edit").as("editorBorehole");
    loginAsAdmin();
    cy.visit("/editor");

    cy.wait("@editorBorehole");
    cy.get("div[id=map]").should("be.visible");
    cy.get("tbody").children().should("have.length", 100);

    // sort by creation date descending
    cy.contains("th", "Creation date").click();
    cy.wait("@editorBorehole");

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
    cy.wait("@editorBorehole");
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
    cy.wait("@editorBorehole");
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
    cy.wait("@editorBorehole");
    cy.get("tbody").children().eq(0).contains("td", "virtual borehole");
    cy.get("tbody").children().eq(1).contains("td", "virtual borehole");
    cy.get("tbody").children().eq(2).contains("td", "virtual borehole");

    // sort by borehole status
    cy.contains("th", "Borehole status").click();
    cy.wait("@editorBorehole");
    cy.get("tbody").children().eq(0).contains("td", "open, no completion");
    cy.get("tbody").children().eq(1).contains("td", "open, no completion");
    cy.get("tbody").children().eq(2).contains("td", "open, no completion");

    // sort by total depth
    cy.contains("th", "Borehole length").click();
    cy.wait("@editorBorehole");
    cy.get("tbody").children().eq(0).contains("td", "1'998.0731671667068");
    cy.get("tbody").children().eq(1).contains("td", "1'997.7856427420795");
    cy.get("tbody").children().eq(2).contains("td", "1'995.4961081945785");
  });

  it("preserves column sorting and active page when navigating", () => {
    loginAsEditorInViewerMode();
    cy.visit("/");

    // sort by name ascending
    cy.contains("div", "Original name")
      .children()
      .first()
      .then($icon => {
        if (!$icon.hasClass("up")) {
          // Sort list ascending
          cy.contains("div", "Original name").click();
        }
      });

    cy.wait("@borehole");

    cy.get("tbody").children().eq(0).contains("td", "Aaliyah Casper");
    cy.get("tbody").children().eq(1).contains("td", "Aaliyah Lynch");
    cy.get("tbody").children().eq(2).contains("td", "Aaron Bartell");

    // navigate to page 4
    cy.get("a").should("have.class", "item").contains("4").click();
    cy.wait("@borehole");

    cy.get("tbody").children().eq(0).contains("td", "Christine Schuster");
    cy.get("tbody").children().eq(1).contains("td", "Christine Wilderman");
    cy.get("tbody").children().eq(2).contains("td", "Christop Keebler");

    // open first borehole
    cy.get("tbody")
      .children()
      .eq(0)
      .contains("td", "Christine Schuster")
      .click();
    cy.wait("@borehole");

    // verify current page is 4
    cy.get("a").should("have.class", "active item").contains("4");

    // return to list
    cy.get('[data-cy="back-to-list-button"]').click();
    cy.wait("@borehole");

    // verify current page is still 4
    cy.get("a").should("have.class", "active item").contains("4");
    cy.get("tbody").children().eq(0).contains("td", "Christine Schuster");
    cy.get("tbody").children().eq(1).contains("td", "Christine Wilderman");
    cy.get("tbody").children().eq(2).contains("td", "Christop Keebler");
  });
});
