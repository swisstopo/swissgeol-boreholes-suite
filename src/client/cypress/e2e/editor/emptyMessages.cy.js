import { newUneditableBorehole } from "../helpers/testHelpers";

describe("Messages for empty profiles", () => {
  beforeEach(() => {
    newUneditableBorehole().as("borehole_id");
  });

  it("Displays correct messages for stratigraphy", () => {
    cy.get('[data-cy="stratigraphy-menu-item"]').click();
    cy.get('[data-cy="lithology-menu-item"]').click();
    cy.get('[data-cy="stratigraphy-message"]').should("contain", "No stratigraphy available");
    cy.get('[data-cy="edit-button"]').click();
    cy.wait("@edit_lock");
    cy.get('[data-cy="stratigraphy-message"]').should(
      "contain",
      "For the recording of a stratigraphic profile please click the plus symbol at the top left",
    );
  });
});
