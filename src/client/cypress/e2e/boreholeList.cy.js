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
    cy.contains("td", "Aaliyah Swaniawski");
    cy.contains("td", "Aaron Christiansen");
    cy.contains("td", "Abagail Keebler");
    cy.contains("td", "Abbey Schamberger");

    // contains date (restriction date)
    cy.contains("td", "09.03.2022");

    // contains total depth
    cy.contains("td", "566.0580250276522");
    cy.contains("td", "1'356.8295898646254");
    cy.contains("td", "500.9678483479506");

    // sort by name descending
    cy.contains("div", "Original name").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "Zula Langosh");
    cy.get("tbody").children().eq(1).contains("td", "Zora Cormier");
    cy.get("tbody").children().eq(2).contains("td", "Zoila Toy");

    // sort by total depth
    cy.contains("div", "Total depth MD [m]").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "5.198657515085609");
    cy.get("tbody").children().eq(1).contains("td", "5.2529545525335495");
    cy.get("tbody").children().eq(2).contains("td", "5.30725158998149");

    cy.contains("div", "Total depth MD [m]").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "1'999.7566677628815");
    cy.get("tbody").children().eq(1).contains("td", "1'999.7023707254336");
    cy.get("tbody").children().eq(2).contains("td", "1'999.6480736879855");

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
    cy.get("tbody").children().eq(0).contains("td", "Quincy O'Connell");
    cy.get("tbody").children().eq(1).contains("td", "Louie Kirlin");
    cy.get("tbody").children().eq(2).contains("td", "Ubaldo Fadel");
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

    cy.get("tbody").children().eq(0).contains("td", "Aaliyah Swaniawski");
    cy.get("tbody").children().eq(1).contains("td", "Aaron Christiansen");
    cy.get("tbody").children().eq(2).contains("td", "Abagail Keebler");

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
    cy.get("tbody").children().eq(0).contains("td", "1'999.6480736879855");
    cy.get("tbody").children().eq(1).contains("td", "1'999.5937766505376");
    cy.get("tbody").children().eq(2).contains("td", "1'999.5394796130897");
  });
});
