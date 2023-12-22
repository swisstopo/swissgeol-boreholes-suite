import { loginAsAdmin } from "../testHelpers";

describe("Admin login preview tests", () => {
  it("displays correct message when publishing a new welcome message.", () => {
    loginAsAdmin();
    cy.visit("/setting/login");

    // Initial button state
    cy.get('[data-cy="save-welcome-message-button"]').should("not.be.visible");
    cy.get('[data-cy="publish-welcome-message-button"]').should(
      "not.be.visible",
    );

    // Change welcome message and open publish dialog
    cy.get('[data-cy="publish-message-area"]').type("LIONDIONYSUS");

    cy.get('[data-cy="publish-welcome-message-button"]').should(
      "not.be.visible",
    );

    cy.get('[data-cy="save-welcome-message-button"]')
      .should("be.visible")
      .click()
      .should("not.be.visible");

    cy.get('[data-cy="publish-welcome-message-button"]')
      .should("be.visible")
      .click();

    cy.get(".modal p").should(
      "contain",
      "Do you want to publish the welcome message?",
    );
  });
});
