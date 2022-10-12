import editorUser from "../fixtures/editorUser.json";
import adminUser from "../fixtures/adminUser.json";

describe("Bore hole list tests", () => {
  it("Boreholes are displayed in correct order with editor login", () => {
    // Login as editor
    cy.intercept("/api/v1/geoapi/canton").as("geoapi");
    cy.intercept("/api/v1/borehole").as("borehole");

    cy.intercept("/api/v1/user", editorUser);

    cy.visit("/");
    cy.contains("button", "Login").click();
    cy.wait("@geoapi");
    cy.get("div[id=map]").should("be.visible");

    cy.get("tbody").children().should("have.length", 27);

    // contains names
    cy.contains("td", "Bertram Windler");
    cy.contains("td", "Haylee Goodwin");
    cy.contains("td", "Matilde Blick");
    cy.contains("td", "Alfred Franecki");
    cy.contains("td", "Cynthia Denesik");

    // contains date
    cy.contains("td", "23.07.2022");
    cy.contains("td", "26.09.2022");
    cy.contains("td", "13.08.2022");

    // contains terrain elevation
    cy.contains("td", "1768.0555385388693 m");
    cy.contains("td", "49.94531071276651 m");
    cy.contains("td", "669.8451035981277 m");
    cy.contains("td", "1796.1156628076526 m");
    cy.contains("td", "1345.8651450210555 m");

    let firstRow = cy.get("tbody").children().first();
    let secondRow = cy.get("tbody").children().eq(1);
    let thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "Adan Robert");
    secondRow.contains("td", "Alfred Franecki");
    thirdRow.contains("td", "Ara Braun");

    // sort by name
    cy.contains("div", "Original name").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "Troy Hoeger");
    secondRow.contains("td", "Stevie Lebsack");
    thirdRow.contains("td", "Samanta Ondricka");

    // sort by total depth
    cy.contains("div", "Total depth MD [m]").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);
    firstRow.contains("td", "21.885186443983198 m");
    secondRow.contains("td", "687.4034924839639 m");
    thirdRow.contains("td", "106.06555925033315 m");

    cy.contains("div", "Total depth MD [m]").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);
    firstRow.contains("td", "1993.8250621752 m");
    secondRow.contains("td", "1796.1156628076526 m");
    thirdRow.contains("td", "1768.0555385388693 m");

    // sort by drilling date
    cy.contains("div", "End of drilling date").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "12.01.2021");
    secondRow.contains("td", "17.01.2021");
    thirdRow.contains("td", "29.01.2021");

    cy.contains("div", "End of drilling date").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "14.12.2021");
    secondRow.contains("td", "09.11.2021");
    thirdRow.contains("td", "12.10.2021");

    // sort by bore hole type (column of original name)
    cy.contains("div", "Borehole type").click();
    cy.wait("@borehole");
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "Rod Cronin");
    secondRow.contains("td", "Okey Schinner");
    thirdRow.contains("td", "Gilda Runte");
  });

  it("Boreholes are displayed in correct order with admin login", () => {
    // Login as admin
    cy.intercept("/api/v1/geoapi/canton").as("geoapi");

    cy.intercept("/api/v1/user", adminUser);

    cy.visit("/editor");
    cy.contains("button", "Login").click();
    cy.wait("@geoapi");
    cy.get("div[id=map]").should("be.visible");

    // sort by creation date
    cy.contains("th", "Creation date").click();
    let firstRow = cy.get("tbody").children().first();
    let secondRow = cy.get("tbody").children().eq(1);
    let thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "30.04.2021");
    secondRow.contains("td", "01.05.2021");
    thirdRow.contains("td", "03.05.2021");

    cy.contains("th", "Creation date").click();
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "14.11.2021");
    secondRow.contains("td", "13.11.2021");
    thirdRow.contains("td", "12.11.2021");

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

    firstRow.contains("td", "Alfred Franecki");
    secondRow.contains("td", "Ara Braun");
    thirdRow.contains("td", "Bertram Windler");

    // sort by borehole type
    cy.contains("th", "Borehole type").click();
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "other");
    secondRow.contains("td", "trial pit");
    thirdRow.contains("td", "trial pit");

    // sort by borehole status
    cy.contains("th", "Borehole Status").click();
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "open, no completion");
    secondRow.contains("td", "open, no completion");
    thirdRow.contains("td", "decayed");

    // sort by total depth
    cy.contains("th", "Total depth").click();
    firstRow = cy.get("tbody").children().first();
    secondRow = cy.get("tbody").children().eq(1);
    thirdRow = cy.get("tbody").children().eq(2);

    firstRow.contains("td", "1768.0555385388693 m");
    secondRow.contains("td", "1739.995414270086 m");
    thirdRow.contains("td", "1711.9352900013027 m");
  });
});
