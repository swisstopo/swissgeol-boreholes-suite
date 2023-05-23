import { loginAsAdmin, loginAsEditorInViewerMode } from "../e2e/testHelpers";

describe("Borehole list tests", () => {
  it("Boreholes are displayed in correct order with editor login", () => {
    cy.intercept("/api/v1/borehole").as("borehole");
    loginAsEditorInViewerMode();

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
    cy.contains("td", "Aaron Konopelski");
    cy.contains("td", "Aaron Metz");
    cy.contains("td", "Abagail Hirthe");

    // contains date (restriction date)
    cy.contains("td", "10.11.2022");

    // contains total depth
    cy.contains("td", "1'957.2661798248375");
    cy.contains("td", "1'662.640205427371");
    cy.contains("td", "1'662.640205427371");

    // sort by name descending
    cy.contains("div", "Original name").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "Zita Sauer");
    cy.get("tbody").children().eq(1).contains("td", "Zita Hegmann");
    cy.get("tbody").children().eq(2).contains("td", "Zita Emard");

    // sort by total depth
    cy.contains("div", "Borehole length [m MD]").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "0.501133501763052");
    cy.get("tbody").children().eq(1).contains("td", "1.0761823510174557");
    cy.get("tbody").children().eq(2).contains("td", "1.5021385631999646");

    cy.contains("div", "Borehole length [m MD]").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "1'999.7876528649533");
    cy.get("tbody").children().eq(1).contains("td", "1'999.3616966527707");
    cy.get("tbody").children().eq(2).contains("td", "1'999.212604015699");

    // sort by drilling date
    cy.contains("div", "End of drilling date").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "01.01.2021");
    cy.get("tbody").children().eq(1).contains("td", "01.01.2021");
    cy.get("tbody").children().eq(2).contains("td", "01.01.2021");

    cy.contains("div", "End of drilling date").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "31.12.2021");
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
    loginAsAdmin("/editor");

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

    cy.get("tbody").children().eq(0).contains("td", "publisher");
    cy.get("tbody").children().eq(1).contains("td", "publisher");
    cy.get("tbody").children().eq(2).contains("td", "publisher");

    cy.contains("th", "Created by").click();
    cy.get("tbody").children().eq(0).contains("td", "admin");
    cy.get("tbody").children().eq(1).contains("td", "admin");
    cy.get("tbody").children().eq(2).contains("td", "admin");

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
    cy.get("tbody").children().eq(2).contains("td", "Aaliyah Pfeffer");

    // sort by borehole type
    cy.contains("th", "Borehole type").click();
    cy.wait("@editorBorehole");
    cy.get("tbody").children().eq(0).contains("td", "not specified");
    cy.get("tbody").children().eq(1).contains("td", "not specified");
    cy.get("tbody").children().eq(2).contains("td", "not specified");

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
    cy.get("tbody").children().eq(1).contains("td", "1'999.3616966527707");
    cy.get("tbody").children().eq(2).contains("td", "1'999.212604015699");
  });

  it("preserves column sorting and active page when navigating", () => {
    loginAsEditorInViewerMode();

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
    cy.get("tbody").children().eq(2).contains("td", "Aaliyah Pfeffer");

    // navigate to page 4
    cy.get("a").should("have.class", "item").contains("4").click();
    cy.wait("@borehole");

    cy.get("tbody").children().eq(0).contains("td", "Arch McKenzie");
    cy.get("tbody").children().eq(1).contains("td", "Arch Reichel");
    cy.get("tbody").children().eq(2).contains("td", "Archibald Bergnaum");

    // open first borehole
    cy.get("tbody").children().eq(0).contains("td", "Arch McKenzie").click();
    cy.wait("@borehole");

    // verify current page is 4
    cy.get("a").should("have.class", "active item").contains("4");

    // return to list
    cy.get('[data-cy="back-to-list-button"]').click();
    cy.wait("@borehole");

    // verify current page is still 4
    cy.get("a").should("have.class", "active item").contains("4");
    cy.get("tbody").children().eq(0).contains("td", "Arch McKenzie");
    cy.get("tbody").children().eq(1).contains("td", "Arch Reichel");
    cy.get("tbody").children().eq(2).contains("td", "Archibald Bergnaum");
  });
});
