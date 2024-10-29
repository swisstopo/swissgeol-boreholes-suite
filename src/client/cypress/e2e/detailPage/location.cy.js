import { saveLocationForm, stopEditing } from "../helpers/buttonHelpers";
import { checkRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers";
import { setInput, setSelect } from "../helpers/formHelpers";
import {
  createBorehole,
  goToRouteAndAcceptTerms,
  handlePrompt,
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
    saveLocationForm();

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
      saveLocationForm();
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

  it("displays unsaved changes message if unsaved changes are present", () => {
    createBorehole({ "extended.original_name": "PHOTOSQUIRREL", "custom.alternate_name": "PHOTOPIGEON" }).as(
      "borehole_id",
    );
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}`);
      startBoreholeEditing();
      let saveButton;
      let discardButton;

      const getButtons = () => {
        saveButton = cy.get('[data-cy="save-button"]');
        discardButton = cy.get('[data-cy="discardchanges-button"]');
      };

      const verifyNoUnsavedChanges = () => {
        getButtons();
        saveButton.should("be.disabled");
        discardButton.should("be.disabled");
        cy.contains("Unsaved changes").should("not.exist");
      };

      const verifyUnsavedChanges = () => {
        getButtons();
        saveButton.should("not.be.disabled");
        discardButton.should("not.be.disabled");
        cy.contains("Unsaved changes").should("exist");
      };

      verifyNoUnsavedChanges();
      setSelect("restrictionId", 2);
      verifyUnsavedChanges();

      // reset from form
      setSelect("restrictionId", 0);
      verifyNoUnsavedChanges();

      // discard changes with button
      setSelect("restrictionId", 3);
      verifyUnsavedChanges();
      discardButton.click();
      verifyNoUnsavedChanges();

      // save changes
      setSelect("restrictionId", 3);
      verifyUnsavedChanges();
      saveButton.click();
      verifyNoUnsavedChanges();
    });
  });

  it("blocks navigating away and stop editing with unsaved changes", () => {
    newEditableBorehole().as("borehole_id");
    let boreholeId;
    cy.get("@borehole_id").then(id => {
      boreholeId = id;
    });
    const messageUnsavedChanges = "There are unsaved changes. Do you want to discard all changes?";

    const originalNameInput = cy.contains("label", "Original name").next().children("input");
    originalNameInput.type("FELIX_THE_RACOON");
    stopEditing();
    handlePrompt(messageUnsavedChanges, "cancel");
    cy.get('[data-cy="editingstop-button"]').should("exist");
    stopEditing();
    handlePrompt(messageUnsavedChanges, "discardchanges");
    cy.get('[data-cy="editingstop-button"]').should("not.exist");

    originalNameInput.type("FELIX_THE_BROOM");

    cy.get('[data-cy="borehole-menu-item"]').click();
    handlePrompt(messageUnsavedChanges, "cancel");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/location`);
    });

    cy.get('[data-cy="borehole-menu-item"]').click();
    handlePrompt(messageUnsavedChanges, "discardchanges");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/borehole`);
    });
  });
});
