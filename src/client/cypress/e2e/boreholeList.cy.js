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
    cy.contains("td", "Aaliyah Baumbach");
    cy.contains("td", "Aaron Kuhlman");
    cy.contains("td", "Abagail Hintz");
    cy.contains("td", "Abdullah Powlowski");

    // contains date (restriction date)
    cy.contains("td", "24.06.2022");

    // contains total depth
    cy.contains("td", "1'877.0624342733354 m");
    cy.contains("td", "1'836.754225118437 m");
    cy.contains("td", "1'803.6465355212085 m");

    // sort by name descending
    cy.contains("div", "Original name").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "Zula Mills");
    cy.get("tbody").children().eq(1).contains("td", "Zula Crona");
    cy.get("tbody").children().eq(2).contains("td", "Zula Crona");

    // sort by total depth
    cy.contains("div", "Total depth MD [m]").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "0.0058989971903613755 m");
    cy.get("tbody").children().eq(1).contains("td", "0.1404881478010156 m");
    cy.get("tbody").children().eq(2).contains("td", "0.27507729841166983 m");

    cy.contains("div", "Total depth MD [m]").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "1'999.6694261206637 m");
    cy.get("tbody").children().eq(1).contains("td", "1'999.534836970053 m");
    cy.get("tbody").children().eq(2).contains("td", "1'999.4002478194423 m");

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
    cy.get("tbody").children().eq(0).contains("td", "Keshaun Dach");
    cy.get("tbody").children().eq(1).contains("td", "Dean Daniel");
    cy.get("tbody").children().eq(2).contains("td", "Tierra Lynch");
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

    cy.get("tbody").children().eq(0).contains("td", "Aaliyah Kuhlman");
    cy.get("tbody").children().eq(1).contains("td", "Aaron Waters");
    cy.get("tbody").children().eq(2).contains("td", "Abagail Hintz");

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
    cy.get("tbody").children().eq(0).contains("td", "1'999.6694261206637 m");
    cy.get("tbody").children().eq(1).contains("td", "1'999.534836970053 m");
    cy.get("tbody").children().eq(2).contains("td", "1'999.4002478194423 m");
  });
});
