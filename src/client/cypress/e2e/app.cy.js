import { loginAsEditorInViewerMode } from "./testHelpers";

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

  it("Displays the current host as app title", () => {
    loginAsEditorInViewerMode();
    cy.get('[data-cy="app-title"]').contains("localhost");
  });
});
