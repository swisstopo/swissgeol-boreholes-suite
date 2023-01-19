import {
  interceptApiCalls,
  login,
  createBorehole,
  deleteBorehole,
} from "../testHelpers";

describe("Test copying of boreholes", () => {
  beforeEach(() => {
    interceptApiCalls();
    cy.intercept("/api/v2/borehole/copy*").as("borehole_copy");

    login("/editor");
    cy.wait("@borehole");
    cy.wait("@edit_list");
  });

  afterEach(() => {
    // Delete borehole if it was created.
    if (cy.state("aliases")?.borehole_id) {
      cy.get("@borehole_id").then(id => deleteBorehole(id));
    }
  });

  it("copies a borehole", () => {
    createBorehole({ "extended.original_name": "NINTIC" }).as("borehole_id_1");

    cy.get('[data-cy="borehole-table"] tbody')
      .children()
      .eq(1)
      .find(".checkbox")
      .scrollIntoView()
      .click();

    cy.contains("button", "Create a copy").click();

    cy.get(".modal").contains("button", "Create a copy").click();
    cy.wait("@borehole_copy");
    cy.wait("@workflow_edit_list");

    cy.contains("label", "Original name")
      .next()
      .children("input")
      .should("contain.value", " (Copy)");

    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");

    cy.contains("a", "Delete").click();
    cy.contains("button", "Delete").click();
  });
});
