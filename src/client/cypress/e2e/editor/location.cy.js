import { newEditableBorehole, returnToOverview, stopBoreholeEditing } from "../helpers/testHelpers";
import { checkRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers";

describe("Tests for 'Location' edit page.", () => {
  it("creates and deletes a borehole.", () => {
    newEditableBorehole();

    const originalNameInput = cy.contains("label", "Original name").next().children("input");
    const alternateNameInput = cy.contains("label", "Name").next().children("input");

    // enter original name
    originalNameInput.type("Original Name");
    cy.wait("@edit_patch");

    // ensure alternate name contains original name
    alternateNameInput.should("have.value", "Original Name");

    // change alternate name
    alternateNameInput.clear().type("Alternate name changed");
    cy.wait("@edit_patch");

    // ensure alternate name and original name contain correct values
    originalNameInput.should("have.value", "Original Name");
    alternateNameInput.should("have.value", "Alternate name changed");

    // change original name
    originalNameInput.clear().type("AAA_SCATORPS");
    cy.wait("@edit_patch");

    // ensure alternate name and original name contain correct values
    originalNameInput.should("have.value", "AAA_SCATORPS");
    alternateNameInput.should("have.value", "AAA_SCATORPS");

    // stop editing
    stopBoreholeEditing();
    returnToOverview();
    showTableAndWaitForData();

    // search the newly created borehole and delete it
    cy.get('[data-cy="borehole-table"]').within(() => {
      checkRowWithText("AAA_SCATORPS");
    });

    cy.get('[data-cy="delete-button"]').click();
    cy.get('.MuiButton-containedPrimary[data-cy="delete-button"]').click();
    cy.wait(["@edit_deletelist", "@edit_list"]);
    cy.get('[data-cy="borehole-table"]').contains("AAA_SCATORPS").should("not.exist");
  });

  it("removes error highlight of identifier fields if at least one identifier is present.", () => {
    newEditableBorehole().as("borehole_id");

    // initial state
    cy.get('[data-cy="identifier-dropdown"]').should("have.class", "error");
    cy.get('[data-cy="identifier-value"]').should("have.class", "error");

    // add identifier
    cy.get('[data-cy="identifier-dropdown"]').click();
    cy.get('[data-cy="identifier-dropdown"]').find("div[role='option']").contains("ID Canton").click();
    cy.get('[data-cy="identifier-dropdown"]').should("not.have.class", "error");
    cy.get('[data-cy="identifier-value"]').should("have.class", "error");

    cy.get('[data-cy="identifier-value"]').type("ECKLERTA");
    cy.get('[data-cy="identifier-dropdown"]').should("not.have.class", "error");
    cy.get('[data-cy="identifier-value"]').should("not.have.class", "error");

    cy.get('[data-cy="identifier-add"]').click();
    cy.get('[data-cy="identifier-dropdown"]').should("not.have.class", "error");
    cy.get('[data-cy="identifier-value"]').should("not.have.class", "error");

    // delete identifier
    cy.get('[data-cy="identifier"]').contains("Delete").click();
    cy.get('[data-cy="identifier-dropdown"]').should("have.class", "error");
    cy.get('[data-cy="identifier-value"]').should("have.class", "error");
  });
});
