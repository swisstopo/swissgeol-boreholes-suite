import { goToRouteAndAcceptTerms } from "../helpers/testHelpers";

const goBackToOverviewAndVerifyNavigation = () => {
  cy.dataCy("backtooverview-button").click();
  cy.url().should("eq", Cypress.config().baseUrl + "/");
  cy.dataCy("boreholes-number-preview").should("be.visible");
};

const verifyNotFoundPageWithNavigation = (route: string, expectedMessage: string) => {
  goToRouteAndAcceptTerms(route);
  cy.contains(expectedMessage).should("be.visible");
  goBackToOverviewAndVerifyNavigation();
};

describe("Error boundaries", () => {
  it("shows a not found message for a non-existing borehole and navigates back", () => {
    verifyNotFoundPageWithNavigation("/9999999", "The requested borehole could not be found.");
  });

  it("shows a not found message for a non-numeric id and navigates back", () => {
    verifyNotFoundPageWithNavigation("/abc", "The requested page could not be found.");
  });

  it("shows a not found message for an id exceeding Int32 range", () => {
    goToRouteAndAcceptTerms("/146246425545464");
    cy.contains("The requested page could not be found.").should("be.visible");
    goBackToOverviewAndVerifyNavigation();
  });

  it("shows a generic error message when the detail page encounters an unexpected error", () => {
    cy.intercept("/api/v2/borehole/*", { forceNetworkError: true }).as("boreholeFail");
    goToRouteAndAcceptTerms("/1000000");
    cy.contains("Something went wrong while accessing the detail page for the requested borehole.").should(
      "be.visible",
    );
    cy.dataCy("retry-button").should("be.visible");
  });
});
