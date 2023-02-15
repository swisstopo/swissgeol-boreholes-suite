import { loginAsAdmin, loginAsEditorInViewerMode } from "./testHelpers";

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

  it("Correctly navigates back and forth from settings", () => {
    // correctly navigate back to viewer mode
    loginAsAdmin();
    cy.get('[data-cy="menu"]').click();
    cy.get('[data-cy="settings-list-item"]').click();
    cy.contains("h3", "Done").click();
    cy.contains("span", "Viewer");

    // correctly navigate back to editor mode
    cy.get('[data-cy="menu"]').click();
    cy.get('[data-cy="editor-list-item"]').click();
    cy.get('[data-cy="menu"]').click();
    cy.get('[data-cy="settings-list-item"]').click();
    cy.contains("h3", "Done").click();
    cy.contains("span", "Editor");
  });
});
