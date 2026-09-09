import { buildConsentCookieValue, CONSENT_COOKIE_NAME } from "../../src/term/consentCookie.ts";
import { loginAsAdmin, selectLanguage, toMockSubjectId } from "./helpers/testHelpers";

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

  it("Persists the consent choice so the disclaimer does not reappear on reload", () => {
    loginAsAdmin();
    // Start from a clean state so the dialog renders on the first visit.
    cy.clearCookie(CONSENT_COOKIE_NAME);

    cy.visit("/");
    cy.dataCy("accept-button").click();
    cy.dataCy("accept-button").should("not.exist");

    cy.getCookie(CONSENT_COOKIE_NAME)
      .should("exist")
      .then(cookie => {
        expect(cookie!.value).to.equal(buildConsentCookieValue(toMockSubjectId("admin"), true));
      });

    cy.reload();
    cy.dataCy("accept-button").should("not.exist");
  });
});
