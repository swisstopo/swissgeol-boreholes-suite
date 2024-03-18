import { loginAsAdmin, loginAsEditorInViewerMode } from "./helpers/testHelpers";

describe("General app tests", () => {
  it("Displays the login page in the correct language", () => {
    // default is english
    cy.session("logged out", () => cy.visit("/"));

    // Fail get of auth setting to previent auto login.
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
    loginAsEditorInViewerMode();
    cy.visit("/");
    cy.get('[data-cy="app-title"]').contains("localhost");
  });

  it("Correctly navigates back and forth from settings", () => {
    // correctly navigate back to viewer mode
    loginAsAdmin();
    cy.visit("/");
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
