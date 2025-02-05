import license from "../../fixtures/license.json";
import { goToRouteAndAcceptTerms } from "../helpers/testHelpers.js";

describe("Admin about page tests", () => {
  it("shows version information linking the corresponding release on GitHub.", () => {
    goToRouteAndAcceptTerms("/setting#about");

    cy.get('[data-cy="version"]')
      .should("contain", "0.0.99+dev")
      .should("have.attr", "href", "https://github.com/swisstopo/swissgeol-boreholes-suite/releases/tag/v0.0.99");
  });

  it("shows license information (with fixtures)", () => {
    cy.intercept("/license.json", license);
    goToRouteAndAcceptTerms("/setting#about");
    cy.get('[data-cy^="credits-"]').should("have.length", 2);
    cy.get('[data-cy="credits-example-js@0.0.999"]').should("contain", "example-js (Version 0.0.999)");
    cy.get('[data-cy="credits-example-react@0.0.111"]').should("contain", "example-react (Version 0.0.111)");
  });

  it("shows license information (without fixtures)", () => {
    goToRouteAndAcceptTerms("/setting#about");
    cy.get('[data-cy^="credits-"]').should("have.length.above", 0);
  });
});
