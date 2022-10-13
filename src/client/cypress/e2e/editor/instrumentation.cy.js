import {
  interceptApiCalls,
  newUneditableBorehole,
  deleteBorehole,
} from "../testHelpers";

describe("Instrumentation tests", () => {
  beforeEach(() => {
    interceptApiCalls();

    // login
    cy.visit("/editor");
    cy.contains("button", "Login").click();
    cy.wait("@geoapi");

    newUneditableBorehole().as("borehole_id");
    cy.get('[data-cy="completion-menu-item"]').click();
    cy.get('[data-cy="instrument-menu-item"]').click();
  });

  afterEach(() => {
    // delete borehole
    cy.get("@borehole_id").then(id => deleteBorehole(id));
  });

  it("Displays correct messages", () => {
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

  it("Can add and delete instrument without completion", () => {
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");

    // header should not contain tabs
    cy.get('[data-cy="profile-header-list"]')
      .children()
      .should("have.length", 0);

    // add instrument with completion "no casing"
    cy.get('[data-cy="add-instrument-button"]').click();
    cy.wait("@edit_list");
    cy.wait("@layer");

    cy.get('[data-cy="casingName"]')
      .children()
      .first()
      .children()
      .first()
      .each((el, index, list) =>
        cy.wrap(el).click().find('[role="option"]').last().click(),
      );

    // header should contain one tab with name "No casind"
    cy.get('[data-cy="profile-header-list"]')
      .children()
      .should("have.length", 1);

    // add another instrument without name of completion
    cy.get('[data-cy="add-instrument-button"]').click();

    // select tab "No completion"
    cy.get('[data-cy="profile-header-list"]')
      .children()
      .first()
      .children()
      .first()
      .should("contain", "No casing")
      .click();

    // only one instrument should be displayed
    cy.get('[data-cy="instrument-list"]').children().should("have.length", 1);

    // show all instruments
    cy.get('[data-cy="show-all-button"]').click();
    cy.get('[data-cy="instrument-list"]').children().should("have.length", 2);

    // delete instrument with "no completion" removes "No completion" tab.
    cy.get('[data-cy="delete-instrument-button"]').first().click();

    // header should not contain tabs
    cy.get('[data-cy="profile-header-list"]')
      .children()
      .should("have.length", 0);
  });
});
