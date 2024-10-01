import { checkRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers";
import {
  createBorehole,
  goToRouteAndAcceptTerms,
  newEditableBorehole,
  returnToOverview,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for 'Location' edit page.", () => {
  it("creates and deletes a borehole.", () => {
    newEditableBorehole();

    const originalNameInput = cy.contains("label", "Original name").next().children("input");

    // enter original name
    originalNameInput.type("AAA_SCATORPS");
    cy.wait("@edit_patch");

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

  it("completes alternate name", () => {
    createBorehole({ "extended.original_name": "PHOTOSQUIRREL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}`);
      cy.get('[data-cy="original-name"]').within(() => {
        cy.get("input").as("originalNameInput");
      });
      cy.get('[data-cy="alternate-name"]').within(() => {
        cy.get("input").as("alternateNameInput");
      });

      cy.get("@originalNameInput").should("have.value", "PHOTOSQUIRREL");
      cy.get("@alternateNameInput").should("have.value", "PHOTOSQUIRREL");

      startBoreholeEditing();
      // changing original name should also change alternate name
      cy.get("@originalNameInput").clear().type("PHOTOCAT");
      cy.wait("@edit_patch");
      cy.get("@originalNameInput").should("have.value", "PHOTOCAT");
      cy.get("@alternateNameInput").should("have.value", "PHOTOCAT");

      cy.get("@alternateNameInput").clear().type("PHOTOMOUSE");
      cy.wait("@edit_patch");
      cy.get("@originalNameInput").should("have.value", "PHOTOCAT");
      cy.get("@alternateNameInput").should("have.value", "PHOTOMOUSE");

      cy.get("@alternateNameInput").clear();
      cy.wait("@edit_patch");
      stopBoreholeEditing();
      // should be reset to original name if alternate name is empty
      cy.get("@originalNameInput").should("have.value", "PHOTOCAT");
      cy.get("@alternateNameInput").should("have.value", "PHOTOCAT");
    });
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
