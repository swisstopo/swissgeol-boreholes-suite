import { loginAsAdmin, loginAsEditorInViewerMode } from "./testHelpers";

describe("General app tests", () => {
  it("Displays the login page in the correct language", () => {
    // default is english
    cy.visit("/");
    cy.contains("Sign in");
    cy.contains("Welcome to");

    // german
    cy.contains("span", "DE").click();
    cy.contains("Sign in");
    cy.contains("Willkommen bei");

    // french
    cy.contains("span", "FR").click();
    cy.contains("Sign in");
    cy.contains("Bienvenue sur");

    // italian
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
