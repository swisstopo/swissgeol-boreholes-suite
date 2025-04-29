import { goToRouteAndAcceptTerms } from "../helpers/testHelpers.js";

describe("Tests the publication workflow.", () => {
  it("Displays DEV workflow when feature flag is set", () => {
    goToRouteAndAcceptTerms(`/1000908/status`);
    // displays legacy workflow form by default
    cy.contains("h4", "Publication workflow").should("exist");
    goToRouteAndAcceptTerms(`/1000908/status?dev=true`);
    cy.contains("h4", "Publication workflow").should("not.exist");
    cy.contains("p", "Workflow DEV").should("exist");
  });
});
