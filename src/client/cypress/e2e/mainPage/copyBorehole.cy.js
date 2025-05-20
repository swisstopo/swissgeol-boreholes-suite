import { showTableAndWaitForData } from "../helpers/dataGridHelpers";
import { setSelect } from "../helpers/formHelpers";
import {
  createBorehole,
  giveAdminUser2workgroups,
  goToRouteAndAcceptTerms,
  handlePrompt,
  startBoreholeEditing,
} from "../helpers/testHelpers";

describe("Test copying of boreholes", () => {
  it("copies a borehole", () => {
    createBorehole({ "extended.original_name": "NINTIC" }).as("borehole_id_1");

    goToRouteAndAcceptTerms("/");
    showTableAndWaitForData();
    cy.get(".MuiDataGrid-checkboxInput").eq(1).scrollIntoView();
    cy.get(".MuiDataGrid-checkboxInput").eq(1).click();
    cy.contains("button", "Create a copy").click();
    handlePrompt("Select a workgroup to create a copy.", "copy");
    cy.wait("@borehole_copy");
    cy.wait("@borehole_get");

    cy.contains("label", "Original name").next().children("input").should("contain.value", " (Copy)");

    startBoreholeEditing();

    cy.get('[data-cy="deleteborehole-button"]').click({ force: true });
    handlePrompt("Do you really want to delete this borehole? This cannot be undone.", "delete");
  });

  it("copies a borehole to the default selected workgroup", () => {
    giveAdminUser2workgroups();
    createBorehole({ "extended.original_name": "AIRBOUNCE" }).as("borehole_id_1");

    goToRouteAndAcceptTerms("/");
    showTableAndWaitForData();
    cy.get(".MuiDataGrid-checkboxInput").eq(1).scrollIntoView();
    cy.get(".MuiDataGrid-checkboxInput").eq(1).click();
    cy.contains("button", "Create a copy").click();

    cy.get('[data-cy="prompt"]').should("be.visible");
    cy.get('[data-cy="prompt"]').contains("Select a workgroup to create a copy.");
    setSelect("workgroup", 1, null, "prompt");
    cy.get('[data-cy="prompt"]').find(`[data-cy="copy-button"]`).click();
    cy.wait("@borehole_copy");
    cy.wait("@borehole_get");

    cy.contains("label", "Original name").next().children("input").should("contain.value", " (Copy)");

    startBoreholeEditing();

    cy.get('[data-cy="deleteborehole-button"]').click({ force: true });
    handlePrompt("Do you really want to delete this borehole? This cannot be undone.", "delete");
  });

  it("copies a borehole to the selected workgroup", () => {
    giveAdminUser2workgroups();
    cy.intercept("/api/v2/borehole/copy*", {
      statusCode: 200,
      body: "123456",
    }).as("borehole_copy");

    createBorehole({ "extended.original_name": "STELLARLIGHT" }).as("borehole_id_1");

    goToRouteAndAcceptTerms("/");
    showTableAndWaitForData();
    cy.get(".MuiDataGrid-checkboxInput").eq(1).scrollIntoView();
    cy.get(".MuiDataGrid-checkboxInput").eq(1).click();
    cy.contains("button", "Create a copy").click();

    cy.get(".MuiDialogContentText-root").should("contain.text", "Select a workgroup to create a copy.");
    setSelect("workgroup", 2);

    cy.get(".MuiButton-contained").contains("Create a copy").click();
    cy.wait("@borehole_copy").then(intercept => {
      expect(intercept.request.query.workgroupId).to.equal("6");
    });
    cy.location().its("pathname").should("eq", "/123456");
  });
});
