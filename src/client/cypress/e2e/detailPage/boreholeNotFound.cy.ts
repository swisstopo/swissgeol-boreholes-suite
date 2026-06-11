import { goToRouteAndAcceptTerms } from "../helpers/testHelpers";

describe("Borehole not found page", () => {
  it("shows a not found message when navigating to a non-existing borehole", () => {
    goToRouteAndAcceptTerms("/9999999");
    cy.contains("The requested borehole could not be found.").should("be.visible");
    cy.get('[data-cy="backtooverview-button"]').should("be.visible");
    cy.get('[data-cy="backtooverview-button"]').click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
  });
});
