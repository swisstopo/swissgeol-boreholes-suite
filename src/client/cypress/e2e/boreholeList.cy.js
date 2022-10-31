import { loginAsAdmin, loginAsEditor } from "../e2e/testHelpers";

describe("Borehole list tests", () => {
  it("Boreholes are displayed in correct order with editor login", () => {
    cy.intercept("/api/v1/borehole").as("borehole");
    loginAsEditor();

    cy.get("div[id=map]").should("be.visible");

    cy.get("tbody").children().should("have.length", 27);

    // contains names
    cy.contains("td", "Pat Dickinson");
    cy.contains("td", "Tiana Zieme");
    cy.contains("td", "Aaliyah Klocko");
    cy.contains("td", "Arch Veum");
    cy.contains("td", "Coty Raynor");

    // contains date (restriction date)
    cy.contains("td", "02.12.2022");
    cy.contains("td", "31.05.2022");
    cy.contains("td", "05.06.2022");

    // contains total depth
    cy.contains("td", "1429.5046298902037 m");
    cy.contains("td", "1106.2753354694114 m");
    cy.contains("td", "1301.5534539248576 m");

    let firstRow = cy.get("tbody").children().first();
    let secondRow = cy.get("tbody").children().eq(1);
    let thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "Coty Raynor");
    secondRow.contains("td", "Otto Crist");
    thirdRow.contains("td", "Felton Macejkovic");

    // sort by name
    cy.contains("div", "Original name").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "Zelda Johnson");
    secondRow.contains("td", "Toby Barton");
    thirdRow.contains("td", "Tiana Zieme");

    // sort by total depth
    cy.contains("div", "Total depth MD [m]").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);
    firstRow.contains("td", "8.636276241688186 m");
    secondRow.contains("td", "75.96321873178856 m");
    thirdRow.contains("td", "136.5874522070342 m");

    cy.contains("div", "Total depth MD [m]").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);
    firstRow.contains("td", "1948.0120427664424 m");
    secondRow.contains("td", "1880.6851002763424 m");
    thirdRow.contains("td", "1813.358157786242 m");

    // sort by drilling date
    cy.contains("div", "End of drilling date").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "12.01.2021");
    secondRow.contains("td", "14.01.2021");
    thirdRow.contains("td", "29.01.2021");

    cy.contains("div", "End of drilling date").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "22.12.2021");
    secondRow.contains("td", "18.12.2021");
    thirdRow.contains("td", "14.12.2021");

    // sort by borehole type (column of original name)
    cy.contains("div", "Borehole type").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "Coty Raynor");
    secondRow.contains("td", "Otto Crist");
    thirdRow.contains("td", "Felton Macejkovic");
  });

  it("Boreholes are displayed in correct order with admin login", () => {
    loginAsAdmin("/editor");
    cy.get("div[id=map]").should("be.visible");

    // sort by creation date
    cy.contains("th", "Creation date").click();
    let firstRow = cy.get("tbody").children().first();
    let secondRow = cy.get("tbody").children().eq(1);
    let thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "08.01.2021");
    secondRow.contains("td", "19.01.2021");
    thirdRow.contains("td", "31.01.2021");

    cy.contains("th", "Creation date").click();
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "04.12.2021");
    secondRow.contains("td", "21.11.2021");
    thirdRow.contains("td", "09.11.2021");

    // sort by creator
    cy.contains("th", "Created by").click();
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "admin");
    secondRow.contains("td", "admin");
    thirdRow.contains("td", "admin");

    cy.contains("th", "Created by").click();
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "publisher");
    secondRow.contains("td", "publisher");
    thirdRow.contains("td", "publisher");

    // sort by name
    cy.contains("th", "Original name").click();
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "Aaliyah Klocko");
    secondRow.contains("td", "Antone Terry");
    thirdRow.contains("td", "Arch Veum");

    // sort by borehole type
    cy.contains("th", "Borehole type").click();
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "other");
    secondRow.contains("td", "other");
    thirdRow.contains("td", "other");

    // sort by borehole status
    cy.contains("th", "Borehole Status").click();
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "open, no completion");
    secondRow.contains("td", "open, no completion");
    thirdRow.contains("td", "open, no completion");

    // sort by total depth
    cy.contains("th", "Total depth").click();
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "1948.0120427664424 m");
    secondRow.contains("td", "1813.358157786242 m");
    thirdRow.contains("td", "1685.406981820896 m");
  });
});
