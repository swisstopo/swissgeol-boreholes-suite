import {
  createBorehole,
  handlePrompt,
  loginAsAdmin,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

const verifyColorForStatus = (status, color) => {
  cy.get(`[data-cy="workflow_status_color_${status}"]`).should("have.have.class", `ui ${color} circular label`);
};

const statusTitles = {
  edit: "Change in progress",
  control: "In review",
  valid: "In validation",
  public: "Published",
};

const verifyStatusTextsInHeader = status => {
  status.forEach(s => {
    cy.get('[data-cy="workflow_status_header"]').should("contain", statusTitles[s]);
  });
};

const verifyStatusTextsNotInHeader = status => {
  status.forEach(s => {
    cy.get('[data-cy="workflow_status_header"]').should("not.contain", statusTitles[s]);
  });
};

// Skip the test until deleting of boreholes is fixed (see github issue #1188)
describe("Tests the publication workflow.", () => {
  it("Publishes a borehole without rejections", () => {
    createBorehole({ "extended.original_name": "Borehole to publish" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      loginAsAdmin(`/${id}/status`);
    });

    startBoreholeEditing();

    verifyStatusTextsInHeader(["edit"]);
    verifyStatusTextsNotInHeader(["control", "valid", "public"]);
    verifyColorForStatus("edit", "orange");

    // Submit for review
    cy.get("[data-cy=workflow_submit]").click();
    cy.get("[data-cy=workflow_dialog_submit]").click();
    cy.wait("@workflow_edit_list");

    verifyStatusTextsInHeader(["edit", "control"]);
    verifyStatusTextsNotInHeader(["valid", "public"]);
    verifyColorForStatus("edit", "green");
    verifyColorForStatus("control", "orange");

    // Restart workflow
    stopBoreholeEditing();
    startBoreholeEditing();
    cy.get('[data-cy="workflow_restart"]').click();
    cy.get('[data-cy="workflow_dialog_confirm_restart"]').click();
    cy.wait("@workflow_edit_list");

    verifyStatusTextsInHeader(["edit", "control"]);
    verifyStatusTextsNotInHeader(["valid", "public"]);
    verifyColorForStatus("edit", "orange");
    verifyColorForStatus("control", "red");

    // Submit for review
    stopBoreholeEditing();
    startBoreholeEditing();
    cy.get("[data-cy=workflow_submit]").click();
    cy.get("[data-cy=workflow_dialog_submit]").click();
    cy.wait("@workflow_edit_list");

    verifyStatusTextsInHeader(["edit", "control"]);
    verifyStatusTextsNotInHeader(["valid", "public"]);
    verifyColorForStatus("edit", "green");
    verifyColorForStatus("control", "orange");

    // Submit for validation
    stopBoreholeEditing();
    startBoreholeEditing();
    cy.get('[data-cy="workflow_submit"]').click();
    cy.get('[data-cy="workflow_dialog_submit"]').click();
    cy.wait("@workflow_edit_list");

    verifyStatusTextsInHeader(["edit", "control", "valid"]);
    verifyStatusTextsNotInHeader(["public"]);
    verifyColorForStatus("edit", "green");
    verifyColorForStatus("control", "green");
    verifyColorForStatus("valid", "orange");

    // Submit for publication
    stopBoreholeEditing();
    startBoreholeEditing();
    cy.get('[data-cy="workflow_submit"]').click();
    cy.get('[data-cy="workflow_dialog_submit"]').click();
    cy.wait("@workflow_edit_list");

    verifyStatusTextsInHeader(["edit", "control", "valid", "public"]);

    verifyColorForStatus("edit", "green");
    verifyColorForStatus("control", "green");
    verifyColorForStatus("valid", "green");
    verifyColorForStatus("public", "orange");

    // Publish
    stopBoreholeEditing();
    startBoreholeEditing();
    cy.get('[data-cy="workflow_submit"]').click();
    cy.get('[data-cy="workflow_dialog_submit"]').click();
    cy.wait("@workflow_edit_list");

    verifyColorForStatus("public", "green");

    // Restart workflow
    stopBoreholeEditing();
    startBoreholeEditing();
    cy.get('[data-cy="workflow_restart"]').click();
    cy.get('[data-cy="workflow_dialog_confirm_restart"]').click();
    cy.wait("@workflow_edit_list");

    verifyColorForStatus("edit", "orange");
    verifyColorForStatus("control", "red");
    verifyColorForStatus("valid", "red");
    verifyColorForStatus("public", "red");
  });

  it("Deletes a borehole if its publication status is not Change in Progress", () => {
    createBorehole({ "extended.original_name": "Borehole in review to delete" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      loginAsAdmin(`/${id}/status`);
    });

    // Submit for review
    startBoreholeEditing();
    cy.get("[data-cy=workflow_submit]").click();
    cy.get("[data-cy=workflow_dialog_submit]").click();
    cy.wait("@workflow_edit_list");

    // Delete
    stopBoreholeEditing();
    startBoreholeEditing();
    cy.get("[data-cy=deleteborehole-button]").click();
    handlePrompt("Do you really want to delete this borehole? This cannot be undone.", "Delete");
    cy.wait(["@edit_list", "@borehole"]);
  });
});
