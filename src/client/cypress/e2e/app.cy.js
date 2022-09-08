describe("General app tests", () => {
  it("Displays the login page in english by default", () => {
    cy.visit("/");
    cy.contains("Sign in");
    cy.contains("Welcome to");
  });

  it("Displays the login page in german", () => {
    cy.visit("/");
    cy.contains("span", "DE").click();
    cy.contains("Sign in");
    cy.contains("Willkommen bei");
  });

  it("Displays the login page in french", () => {
    cy.visit("/");
    cy.contains("span", "FR").click();
    cy.contains("Sign in");
    cy.contains("Bienvenue sur");
  });

  it("Displays the login page in italian", () => {
    cy.visit("/");
    cy.contains("span", "IT").click();
    cy.contains("Sign in");
    cy.contains("Benvenuti su");
  });

  it("Can enter app as viewer", () => {
    cy.intercept("/api/v1/geoapi/canton").as("geoapi");

    cy.visit("/");
    cy.contains("button", "Enter as viewer").click();
    cy.wait("@geoapi");

    cy.get("div[id=map]").should("be.visible");
    cy.contains("span", " Viewer");
  });
});
