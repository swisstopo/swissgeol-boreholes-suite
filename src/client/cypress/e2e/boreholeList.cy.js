import { loginAsAdmin, loginAsEditor } from "../e2e/testHelpers";

describe("Borehole list tests", () => {
  it("Boreholes are displayed in correct order with editor login", () => {
    cy.intercept("/api/v1/borehole").as("borehole");
    loginAsEditor();

    cy.get("div[id=map]").should("be.visible");

    cy.get("tbody").children().should("have.length", 27);

    // contains names
    cy.contains("td", "Thad Wuckert");
    cy.contains("td", "Michaela Runolfsdottir");
    cy.contains("td", "Ari Turcotte");
    cy.contains("td", "Bertha Crist");
    cy.contains("td", "Braeden Dietrich");

    // contains date (restriction date)
    cy.contains("td", "09.03.2022");

    // contains total depth
    cy.contains("td", "1'549.3226989867737 m");
    cy.contains("td", "1'269.3186613122552 m");
    cy.contains("td", "469.3455791423775 m");

    // sort by name
    cy.contains("div", "Original name").click();
    cy.wait("@borehole");
    let firstRow = cy.get("tbody").children().first();
    let secondRow = cy.get("tbody").children().eq(1);
    let thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "Viviane Goodwin");
    secondRow.contains("td", "Thad Wuckert");
    thirdRow.contains("td", "Savanah Pfannerstill");

    // sort by total depth
    cy.contains("div", "Total depth MD [m]").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);
    firstRow.contains("td", "29.32000720376149 m");
    secondRow.contains("td", "109.33077433581035 m");
    thirdRow.contains("td", "189.3415414678592 m");

    cy.contains("div", "Total depth MD [m]").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);
    firstRow.contains("td", "1'989.34827092539 m");
    secondRow.contains("td", "1'949.3092400717128 m");
    thirdRow.contains("td", "1'829.326736661292 m");

    // sort by drilling date
    cy.contains("div", "End of drilling date").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "02.01.2021");
    secondRow.contains("td", "29.01.2021");
    thirdRow.contains("td", "07.02.2021");

    cy.contains("div", "End of drilling date").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "22.12.2021");
    secondRow.contains("td", "20.12.2021");
    thirdRow.contains("td", "13.12.2021");

    // sort by borehole type (column of original name)
    cy.contains("div", "Borehole type").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "Reta Huel");
    secondRow.contains("td", "Dallin Sawayn");
    thirdRow.contains("td", "Monique Schneider");
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

    firstRow.contains("td", "Ari Turcotte");
    secondRow.contains("td", "Bertha Crist");
    thirdRow.contains("td", "Braeden Dietrich");

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

    firstRow.contains("td", "1'949.3092400717128 m");
    secondRow.contains("td", "1'829.326736661292 m");
    thirdRow.contains("td", "1'749.3159695292431 m");
  });
});
