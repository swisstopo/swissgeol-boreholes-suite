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
    cy.contains("td", "Aaliyah Ebert");
    cy.contains("td", "Aaron O'Hara");
    cy.contains("td", "Abagail Boyer");
    cy.contains("td", "Abdullah Johns");
    cy.contains("td", "Abigale Leannon");

    // contains date (restriction date)
    cy.contains("td", "03.10.2022");

    // contains total depth
    cy.contains("td", "1'060.4425068294827 m");
    cy.contains("td", "987.026608077356 m");
    cy.contains("td", "946.7183989224576 m");

    // sort by name descending
    cy.contains("div", "Original name").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "Zula Thiel");
    cy.get("tbody").children().eq(1).contains("td", "Zula Hand");
    cy.get("tbody").children().eq(2).contains("td", "Zula Hand");

    // sort by total depth
    cy.contains("div", "Total depth MD [m]").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "15.928386718001397 m");
    cy.get("tbody").children().eq(1).contains("td", "16.06297586861205 m");
    cy.get("tbody").children().eq(2).contains("td", "16.197565019222704 m");

    cy.contains("div", "Total depth MD [m]").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "1'989.213681774779 m");
    cy.get("tbody").children().eq(1).contains("td", "1'989.0790926241684 m");
    cy.get("tbody").children().eq(2).contains("td", "1'988.9445034735577 m");

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
    cy.get("tbody").children().eq(0).contains("td", "Zelma Heathcote");
    cy.get("tbody").children().eq(1).contains("td", "Santos Funk");
    cy.get("tbody").children().eq(2).contains("td", "Mina Reynolds");
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
    cy.get("tbody").children().eq(1).contains("td", "01.01.2022");
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

    cy.get("tbody").children().eq(0).contains("td", "Aaron Durgan");
    cy.get("tbody").children().eq(1).contains("td", "Aaron O'Hara");
    cy.get("tbody").children().eq(2).contains("td", "Abagail Boyer");

    // sort by borehole type
    cy.contains("th", "Borehole type").click();
    cy.wait("@editorBorehole");
    cy.get("tbody").children().eq(0).contains("td", "other");
    cy.get("tbody").children().eq(1).contains("td", "other");
    cy.get("tbody").children().eq(2).contains("td", "other");

    // sort by borehole status
    cy.contains("th", "Borehole Status").click();
    cy.wait("@editorBorehole");
    cy.get("tbody").children().eq(0).contains("td", "open, no completion");
    cy.get("tbody").children().eq(1).contains("td", "open, no completion");
    cy.get("tbody").children().eq(2).contains("td", "open, no completion");

    // sort by total depth
    cy.contains("th", "Total depth").click();
    cy.wait("@editorBorehole");
    cy.get("tbody").children().eq(0).contains("td", "1'989.213681774779 m");
    cy.get("tbody").children().eq(1).contains("td", "1'989.0790926241684 m");
    cy.get("tbody").children().eq(2).contains("td", "1'988.9445034735577 m");
  });
});
