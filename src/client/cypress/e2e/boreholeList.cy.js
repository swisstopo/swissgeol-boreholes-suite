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
    cy.get("tbody").children().eq(0).contains("td", "Viviane Goodwin");
    cy.get("tbody").children().eq(1).contains("td", "Thad Wuckert");
    cy.get("tbody").children().eq(2).contains("td", "Savanah Pfannerstill");

    // sort by total depth
    cy.contains("div", "Total depth MD [m]").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "29.32000720376149 m");
    cy.get("tbody").children().eq(1).contains("td", "109.33077433581035 m");
    cy.get("tbody").children().eq(2).contains("td", "189.3415414678592 m");

    cy.contains("div", "Total depth MD [m]").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "1'989.34827092539 m");
    cy.get("tbody").children().eq(1).contains("td", "1'949.3092400717128 m");
    cy.get("tbody").children().eq(2).contains("td", "1'829.326736661292 m");

    // sort by drilling date
    cy.contains("div", "End of drilling date").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "16.01.2021");
    cy.get("tbody").children().eq(1).contains("td", "23.01.2021");
    cy.get("tbody").children().eq(2).contains("td", "26.01.2021");

    cy.contains("div", "End of drilling date").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "24.12.2021");
    cy.get("tbody").children().eq(1).contains("td", "17.12.2021");
    cy.get("tbody").children().eq(2).contains("td", "07.12.2021");

    // sort by borehole type (column of original name)
    cy.contains("div", "Borehole type").click();
    cy.wait("@borehole");
    cy.get("tbody").children().eq(0).contains("td", "Reta Huel");
    cy.get("tbody").children().eq(1).contains("td", "Dallin Sawayn");
    cy.get("tbody").children().eq(2).contains("td", "Monique Schneider");
  });

  it("Boreholes are displayed in correct order with admin login", () => {
    cy.intercept("/api/v1/borehole").as("borehole");
    cy.intercept("/api/v1/borehole/edit").as("editorBorehole");
    loginAsAdmin("/editor");

    cy.wait("@editorBorehole")
    cy.get("div[id=map]").should("be.visible");
    cy.get("tbody").children().should("have.length", 21);

    // sort by creation date
    cy.contains("th", "Creation date").click();
    cy.wait("@editorBorehole");
    cy.get("tbody").children().eq(0).contains("td", "08.01.2021");
    cy.get("tbody").children().eq(1).contains("td", "19.01.2021");
    cy.get("tbody").children().eq(2).contains("td", "31.01.2021");

    cy.contains("th", "Creation date").click();
    cy.wait("@editorBorehole");
    cy.get("tbody").children().eq(0).contains("td", "04.12.2021");
    cy.get("tbody").children().eq(1).contains("td", "22.11.2021");
    cy.get("tbody").children().eq(2).contains("td", "09.11.2021");

    // sort by creator
    cy.contains("th", "Created by").click();
    cy.wait("@editorBorehole");
    cy.get("tbody").children().eq(0).contains("td", "admin");
    cy.get("tbody").children().eq(1).contains("td", "admin");
    cy.get("tbody").children().eq(2).contains("td", "admin");

    cy.contains("th", "Created by").click();
    cy.wait("@editorBorehole");
    cy.get("tbody").children().eq(0).contains("td", "publisher");
    cy.get("tbody").children().eq(1).contains("td", "publisher");
    cy.get("tbody").children().eq(2).contains("td", "publisher");

    // sort by name
    cy.contains("th", "Original name").click();
    cy.wait("@editorBorehole");
    cy.get("tbody").children().eq(0).contains("td", "Ari Turcotte");
    cy.get("tbody").children().eq(1).contains("td", "Bertha Crist");
    cy.get("tbody").children().eq(2).contains("td", "Braeden Dietrich");

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
    cy.get("tbody").children().eq(0).contains("td", "1'949.3092400717128 m");
    cy.get("tbody").children().eq(1).contains("td", "1'829.326736661292 m");
    cy.get("tbody").children().eq(2).contains("td", "1'749.3159695292431 m");
  });
});
