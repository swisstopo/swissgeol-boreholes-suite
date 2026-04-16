import { selectLanguage } from "./helpers/testHelpers";

describe("General app tests", () => {
  it("Displays the login page in the correct language", () => {
    // default is english
    cy.session("logged out", () => cy.visit("/"));

    // Fail GET of auth setting to prevent auto login.
    cy.intercept("/api/v2/settings", req => req.destroy());

    cy.visit("/");
    cy.contains("Welcome to");

    // german
    selectLanguage("de");
    cy.contains("Willkommen bei");

    // french
    selectLanguage("fr");
    cy.contains("Bienvenue sur");

    // italian
    selectLanguage("it");
    cy.contains("Benvenuti su");
  });
});
