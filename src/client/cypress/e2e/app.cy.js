import { loginAsEditor } from "./helpers/testHelpers";

describe("General app tests", () => {
  it("Displays the login page in the correct language", () => {
    // default is english
    cy.session("logged out", () => cy.visit("/"));

    // Fail GET of auth setting to prevent auto login.
    cy.intercept("/api/v2/settings/auth", req => req.destroy());

    cy.visit("/");
    cy.contains("Welcome to");

    // german
    cy.contains("span", "DE").click();
    cy.contains("Willkommen bei");

    // french
    cy.contains("span", "FR").click();
    cy.contains("Bienvenue sur");

    // italian
    cy.contains("span", "IT").click();
    cy.contains("Benvenuti su");
  });

  it("Displays the current host as app title", () => {
    loginAsEditor();
    cy.visit("/");
    cy.get('[data-cy="app-title"]').contains("localhost");
  });
});
