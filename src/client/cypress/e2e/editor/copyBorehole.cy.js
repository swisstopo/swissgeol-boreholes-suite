import {
  interceptApiCalls,
} from "../testHelpers";

describe("Test copying of boreholes", () => {
  beforeEach(() => {
    interceptApiCalls();

    // login
    cy.visit("/editor");
    cy.contains("button", "Login").click();
    cy.wait("@geoapi");
  });

  it("copies a borehole", () => {
    cy.get('[data-cy="borehole-table"] tbody')
      .children()
      .first()
      .find(".checkbox")
      .click();

    cy.contains("button", "Create a copy").click();

    cy.get(".modal").contains("button", "Create a copy").click();
    cy.wait("@borehole_copy");
    cy.wait("@workflow_edit_list");

    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");

    cy.contains("a", "Delete").click();
    cy.contains("button", "Delete").click();
  });
});
