import { showTableAndWaitForData } from "../helpers/dataGridHelpers";
import { createBorehole, handlePrompt, loginAsAdmin, startBoreholeEditing } from "../helpers/testHelpers";

describe("Test copying of boreholes", () => {
  it("copies a borehole", () => {
    createBorehole({ "extended.original_name": "NINTIC" }).as("borehole_id_1");

    loginAsAdmin();
    showTableAndWaitForData();
    cy.get(".MuiDataGrid-checkboxInput").eq(1).scrollIntoView().click();

    cy.contains("button", "Create a copy").click();

    cy.get(".MuiDialogContentText-root").should("contain.text", "Select a workgroup to create a copy.");
    cy.get(".MuiButton-contained").contains("Create a copy").click();
    cy.wait("@borehole_copy");
    cy.wait("@borehole_get");

    cy.contains("label", "Original name").next().children("input").should("contain.value", " (Copy)");

    startBoreholeEditing();

    cy.get('[data-cy="deleteborehole-button"]').click({ force: true });
    handlePrompt("Do you really want to delete this borehole? This cannot be undone.", "Delete");
  });
});
