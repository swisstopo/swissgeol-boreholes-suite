import {
  interceptApiCalls,
  newUneditableBorehole,
  deleteBorehole,
  login,
} from "../testHelpers";

describe("Messages for empty profiles", () => {
  beforeEach(() => {
    interceptApiCalls();

    login("/editor");
    newUneditableBorehole().as("borehole_id");
  });

  afterEach(() => {
    // Delete borehole if it was created.
    if (cy.state("aliases")?.borehole_id) {
      cy.get("@borehole_id").then(id => deleteBorehole(id));
    }
  });

  it("Displays correct messages for stratigraphy", () => {
    cy.get('[data-cy="stratigraphy-menu-item"]').click();
    cy.get('[data-cy="stratigraphy-message"]').should(
      "contain",
      "No stratigraphy available",
    );
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");
    cy.get('[data-cy="stratigraphy-message"]').should(
      "contain",
      "For the recording of a stratigraphic profile please click the plus symbol at the top left",
    );
  });

  it("Displays correct messages for instrumentation", () => {
    cy.get('[data-cy="completion-menu-item"]').click();
    cy.get('[data-cy="instrument-menu-item"]').click();

    cy.get('[data-cy="instrument-message"]').should(
      "contain",
      "No instrumentation available",
    );
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");
    cy.get('[data-cy="instrument-message"]').should(
      "contain",
      "For the recording of an instrument please click the plus symbol at the top left",
    );
  });

  it("Displays correct messages for casing", () => {
    cy.get('[data-cy="completion-menu-item"]').click();
    cy.get('[data-cy="casing-menu-item"]').click();
    cy.get('[data-cy="casing-message"]').should(
      "contain",
      "No casing available",
    );
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");
    cy.get('[data-cy="casing-message"]').should(
      "contain",
      "For the recording of a casing profile please click the plus symbol at the top left",
    );
  });

  it("Displays correct messages for backfill", () => {
    cy.get('[data-cy="completion-menu-item"]').click();
    cy.get('[data-cy="filling-menu-item"]').click();
    cy.get('[data-cy="backfill-message"]').should(
      "contain",
      "No backfill available",
    );
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");
    cy.get('[data-cy="backfill-message"]').should(
      "contain",
      "For the recording of a backfill please click the plus symbol at the top left",
    );
  });
});
