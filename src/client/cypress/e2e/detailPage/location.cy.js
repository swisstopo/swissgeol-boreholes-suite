import { saveForm } from "../helpers/buttonHelpers";
import { checkRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers";
import { setInput, setSelect } from "../helpers/formHelpers";
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

    // save borehole
    saveForm();

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
    createBorehole({ "extended.original_name": "PHOTOSQUIRREL", "custom.alternate_name": "PHOTOSQUIRREL" }).as(
      "borehole_id",
    );
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}`);
      cy.get('[data-cy="originalName-formInput"]').within(() => {
        cy.get("input").as("originalNameInput");
      });
      cy.get('[data-cy="alternateName-formInput"]').within(() => {
        cy.get("input").as("alternateNameInput");
      });

      cy.get("@originalNameInput").should("have.value", "PHOTOSQUIRREL");
      cy.get("@alternateNameInput").should("have.value", "PHOTOSQUIRREL");

      startBoreholeEditing();
      // changing original name should also change alternate name
      cy.get("@originalNameInput").clear().type("PHOTOCAT");
      cy.get("@originalNameInput").should("have.value", "PHOTOCAT");
      cy.get("@alternateNameInput").should("have.value", "PHOTOCAT");

      cy.get("@alternateNameInput").clear().type("PHOTOMOUSE");
      cy.get("@originalNameInput").should("have.value", "PHOTOCAT");
      cy.get("@alternateNameInput").should("have.value", "PHOTOMOUSE");

      cy.get("@alternateNameInput").clear();
      saveForm();
      // should be reset to original name if alternate name is empty
      cy.get("@originalNameInput").should("have.value", "PHOTOCAT");
      cy.get("@alternateNameInput").should("have.value", "PHOTOCAT");
    });
  });

  it("adds and removes identifiers.", () => {
    newEditableBorehole().as("borehole_id");

    // initial state
    cy.get('[data-cy="identifier-add"]').should("be.disabled");

    // add identifier
    setSelect("borehole_identifier", 5);
    cy.get('[data-cy="identifier-add"]').should("be.disabled");

    setInput("borehole_identifier_value", "ECKLERTA");
    cy.get('[data-cy="identifier-add"]').should("not.be.disabled");

    cy.get('[data-cy="identifier-add"]').click();
    cy.contains("ID Canton").should("exist");
    cy.contains("ECKLERTA").should("exist");

    cy.get('[data-cy="identifier-add"]').should("be.disabled");

    // delete identifier
    cy.get('[data-cy="identifier-delete"]').click();
    cy.contains("ID Canton").should("not.exist");
    cy.get('[data-cy="identifier-add"]').should("be.disabled");
  });
});
