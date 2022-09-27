describe("Search filter tests", () => {
  beforeEach(() => {
    cy.intercept("/api/v1/geoapi/canton").as("geoapi");

    cy.visit("/");
    cy.contains("button", "Enter as viewer").click();
    cy.wait("@geoapi");
  });

  it("has search filters", () => {
    cy.contains("Search filters:");
  });

  it.only("shows the correct dropdowns", () => {
    cy.contains("span", "Location").click();
    cy.contains("Show all fields").children().eq(0).click();
    let restrictionDropdown = cy.contains("label", "Identifier").next();

    restrictionDropdown.click();
    restrictionDropdown
      .find("div[role='option']")
      .should("have.length", 2)
      .should(options => {
        expect(options[0]).to.have.text("Reset");
        expect(options[1]).to.have.text("Unique id");
      });

    cy.contains("span", "Borehole").click();
    let boreholeTypeDropdown = cy.contains("label", "Borehole type").next();

    boreholeTypeDropdown.click();
    boreholeTypeDropdown
      .find("div[role='option']")
      .should("have.length", 5)
      .should(options => {
        expect(options[0]).to.have.text("Reset");
        expect(options[1]).to.have.text("borehole");
        expect(options[2]).to.have.text("penetration test");
        expect(options[3]).to.have.text("trial pit");
        expect(options[4]).to.have.text("other");
      });
  });
});
