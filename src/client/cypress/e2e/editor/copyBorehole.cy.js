import { createBorehole, loginAsAdmin } from "../helpers/testHelpers";

describe("Test copying of boreholes", () => {
  it("copies a borehole", () => {
    createBorehole({ "extended.original_name": "NINTIC" }).as("borehole_id_1");

    loginAsAdmin();
    cy.visit("/");
    cy.get('[data-cy="showTableButton"]').click();
    cy.get('[data-cy="borehole-table"] tbody').children().eq(1).find(".checkbox").scrollIntoView().click();

    cy.contains("button", "Create a copy").click();

    cy.get(".modal").contains("button", "Create a copy").click();
    cy.wait("@borehole_copy");
    cy.wait("@workflow_edit_list");

    cy.contains("label", "Original name").next().children("input").should("contain.value", " (Copy)");

    cy.get('[data-cy="edit-button"]').click();
    cy.wait("@edit_lock");

    cy.get('[data-cy="deleteBorehole-button"]').click();
    cy.contains("button", "Delete").click();
  });
});
