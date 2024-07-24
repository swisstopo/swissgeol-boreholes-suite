import { newEditableBorehole, returnToOverview, stopBoreholeEditing } from "../helpers/testHelpers";

describe("Tests for 'Location' edit page.", () => {
  it("creates and deletes a borehole.", () => {
    newEditableBorehole();

    // enter original name
    cy.contains("label", "Original name").next().children("input").type("SCATORPS");
    cy.wait("@edit_patch");

    // stop editing
    stopBoreholeEditing();
    returnToOverview();
    cy.get('[data-cy="showTableButton"]').click();

    // search the newly created borehole and delete it
    cy.get('[data-cy="borehole-table"]').within(() => {
      cy.contains("SCATORPS").parent().find(".checkbox").click();
      cy.contains("button", "Delete").click();
    });
    cy.get(".modal button.negative").click();
    cy.wait(["@edit_deletelist", "@edit_list"]);
    cy.get('[data-cy="borehole-table"]').contains("SCATORPS").should("not.exist");
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
