import { goToRouteAndAcceptTerms } from "../helpers/testHelpers";

describe("Error boundaries", () => {
  it("shows a not found message when navigating to a non-existing borehole", () => {
    goToRouteAndAcceptTerms("/9999999");
    cy.contains("The requested borehole could not be found.").should("be.visible");
    cy.get('[data-cy="backtooverview-button"]').should("be.visible");
    cy.get('[data-cy="backtooverview-button"]').click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.get('[data-cy="boreholes-number-preview"]').should("be.visible");
  });

  it("shows a not found message when navigating to a borehole with a non-numeric id", () => {
    goToRouteAndAcceptTerms("/abc");
    cy.contains("The requested page could not be found.").should("be.visible");
    cy.get('[data-cy="backtooverview-button"]').should("be.visible");
    cy.get('[data-cy="backtooverview-button"]').click();
    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.get('[data-cy="boreholes-number-preview"]').should("be.visible");
  });

  it("shows a not found message when navigating to a borehole with an id exceeding Int32 range", () => {
    goToRouteAndAcceptTerms("/146246425545464");
    cy.contains("The requested page could not be found.").should("be.visible");
    cy.get('[data-cy="backtooverview-button"]').should("be.visible");
  });

  it("shows a generic error message when the detail page encounters an unexpected error", () => {
    cy.intercept("/api/v2/borehole/*", { forceNetworkError: true }).as("boreholeFail");
    goToRouteAndAcceptTerms("/1000000");
    cy.contains("Something went wrong while accessing the detail page for the requested borehole.").should(
      "be.visible",
    );
    cy.get('[data-cy="retry-button"]').should("be.visible");
  });
});
