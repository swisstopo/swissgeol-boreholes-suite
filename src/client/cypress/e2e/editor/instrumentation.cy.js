import {
  loginAsViewer,
  createBorehole,
  createAndEditBoreholeAsAdmin,
} from "../testHelpers";

describe("Instrumentation tests", () => {
  it("Displays correct 'No Instumentation' message when logged in as viewer and no stratigraphies are defined", () => {
    createBorehole({ "extended.original_name": "A1_Borehole" });
    loginAsViewer("/editor");

    // Select borehole A1_Borehole
    cy.get("tbody").children().first().click();
    cy.get('[data-cy="completion-menu-item"]').click();
    cy.get('[data-cy="instrument-menu-item"]').click();
    cy.get('[data-cy="instrument-message"]').should(
      "contain",
      "No instrumentation available",
    );
  });
});

describe("Instrumentation tests", () => {
  beforeEach(() => {
    createAndEditBoreholeAsAdmin({
      "extended.original_name": "A1_Borehole",
    });

    cy.get('[data-cy="completion-menu-item"]').click();
    cy.get('[data-cy="instrument-menu-item"]').click();
  });

  it("Displays correct messages", () => {
    cy.get('[data-cy="instrument-message"]').should(
      "contain",
      "No instrumentation available",
    );
    cy.contains("a", "Start editing").click();
    cy.get('[data-cy="instrument-message"]').should(
      "contain",
      "For the recording of an instrument please click the plus symbol at the top left",
    );
    cy.contains("a", "Stop editing").click();
  });
});
