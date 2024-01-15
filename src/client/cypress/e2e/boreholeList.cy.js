import { loginAsAdmin, loginAsEditorInViewerMode } from "../e2e/testHelpers";

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
    cy.contains("td", "Aaron Grimes");
    cy.contains("td", "Aaron Konopelski");
    cy.contains("td", "Aaron Metz");
    cy.contains("td", "Abagail Brown");

    // contains date (restriction date)
    cy.contains("td", "10.11.2022");

    // contains total depth
    cy.contains("td", "1'957.2661798248375");
    cy.contains("td", "1'663.9287349134352");

    // sort by name descending
    cy.contains("div", "Original name").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "Zita Veum");
    cy.get("tbody").children().eq(1).contains("td", "Zita Sauer");
    cy.get("tbody").children().eq(2).contains("td", "Zita Kreiger");

    // sort by total depth
    cy.contains("div", "Borehole length [m MD]").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "0.07517728958054319");
    cy.get("tbody").children().eq(1).contains("td", "0.21360907713585026");
    cy.get("tbody").children().eq(2).contains("td", "0.501133501763052");

    cy.contains("div", "Borehole length [m MD]").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "1'999.7876528649533");
    cy.get("tbody").children().eq(1).contains("td", "1'999.5001284403263");
    cy.get("tbody").children().eq(2).contains("td", "1'999.3616966527707");

    // sort by drilling date
    cy.contains("div", "End of drilling date").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "01.01.2021");
    cy.get("tbody").children().eq(1).contains("td", "01.01.2021");
    cy.get("tbody").children().eq(2).contains("td", "01.01.2021");

    cy.contains("div", "End of drilling date").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "01.01.2022");
    cy.get("tbody").children().eq(1).contains("td", "31.12.2021");
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

    cy.get("tbody").children().eq(0).contains("td", "31.12.2021");
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
    cy.get("tbody").children().eq(2).contains("td", "Aaron Cruickshank");

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
    cy.get("tbody").children().eq(0).contains("td", "1'999.7876528649533");
    cy.get("tbody").children().eq(1).contains("td", "1'999.5001284403263");
    cy.get("tbody").children().eq(2).contains("td", "1'999.3616966527707");
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
    cy.get("tbody").children().eq(2).contains("td", "Aaron Cruickshank");

    // navigate to page 4
    cy.get("a").should("have.class", "item").contains("4").click();
    cy.wait("@borehole");

    cy.get("tbody").children().eq(0).contains("td", "Alfred Sanford");
    cy.get("tbody").children().eq(1).contains("td", "Alfred Upton");
    cy.get("tbody").children().eq(2).contains("td", "Alfreda Block");

    // open first borehole
    cy.get("tbody").children().eq(0).contains("td", "Alfred Sanford").click();
    cy.wait("@borehole");

    // verify current page is 4
    cy.get("a").should("have.class", "active item").contains("4");

    // return to list
    cy.get('[data-cy="back-to-list-button"]').click();
    cy.wait("@borehole");

    // verify current page is still 4
    cy.get("a").should("have.class", "active item").contains("4");
    cy.get("tbody").children().eq(0).contains("td", "Alfred Sanford");
    cy.get("tbody").children().eq(1).contains("td", "Alfred Upton");
    cy.get("tbody").children().eq(2).contains("td", "Alfreda Block");
  });
});
