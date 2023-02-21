import { createBorehole, login } from "../testHelpers";

describe("Test copying of boreholes", () => {
  it("copies a borehole", () => {
    login("/editor");
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
