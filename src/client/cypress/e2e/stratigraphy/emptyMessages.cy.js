import { goToRouteAndAcceptTerms, newUneditableBorehole, startBoreholeEditing } from "../helpers/testHelpers";

describe("Messages for empty profiles", () => {
  it("Displays correct messages for stratigraphy", () => {
    goToRouteAndAcceptTerms(`/`);

    newUneditableBorehole().as("borehole_id");
    cy.get('[data-cy="stratigraphy-menu-item"]').click();
    cy.get('[data-cy="lithology-menu-item"]').click();
    cy.get('[data-cy="stratigraphy-message"]').should("contain", "No stratigraphy available");
    startBoreholeEditing();
    cy.get('[data-cy="stratigraphy-message"]').should(
      "contain",
      "For the recording of a stratigraphic profile please click the plus symbol at the top left",
    );
  });
});
