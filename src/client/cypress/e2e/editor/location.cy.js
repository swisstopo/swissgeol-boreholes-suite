import {
  deleteBorehole,
  interceptApiCalls,
  newEditableBorehole,
} from "../testHelpers";

describe("Tests for 'Location' edit page.", () => {
  beforeEach(() => {
    interceptApiCalls();

    // login
    cy.visit("/");
    cy.contains("button", "Login").click();
    cy.wait("@geoapi");

    // go to edit
    cy.get('[data-cy="menu"]').click();
    cy.contains("h4", "Editor").click();
    cy.wait("@edit_list");
  });

  it("creates and deletes a borehole.", () => {
    newEditableBorehole();

    // enter original name
    cy.contains("label", "Original name")
      .next()
      .children("input")
      .type("SCATORPS");
    cy.wait("@edit_patch");

    // stop editing
    cy.contains("a", "Stop editing").click();
    cy.wait("@edit_unlock");
    cy.contains("h3", "Done").click();
    cy.wait(["@edit_list", "@borehole"]);

    // search the newly created borehole and delete it
    cy.get('[data-cy="borehole-table"]').within(() => {
      cy.contains("SCATORPS").parent().find(".checkbox").click();
      cy.contains("button", "Delete").click();
    });
    cy.get(".modal button.negative").click();
    cy.wait(["@edit_deletelist", "@edit_list"]);
    cy.get('[data-cy="borehole-table"]')
      .contains("SCATORPS")
      .should("not.exist");
  });

  it("removes error highlight of identifier fields if at least one identifier is present.", () => {
    newEditableBorehole();

    // initial state
    cy.get('[data-cy="identifier-dropdown"]').should("have.class", "error");
    cy.get('[data-cy="identifier-value"]').should("have.class", "error");

    // add identifier
    cy.get('[data-cy="identifier-dropdown"]').click();
    cy.get('[data-cy="identifier-dropdown"]')
      .find("div[role='option']")
      .contains("Unique id")
      .click();
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

    // delete borehole
    cy.get("@edit_create").then(interception => {
      deleteBorehole(interception.response.body.id);
    });
  });
});
