import { saveWithSaveBar, stopEditing, verifyNoUnsavedChanges, verifyUnsavedChanges } from "../helpers/buttonHelpers";
import { checkRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers";
import { clearInput, evaluateInput, isDisabled, setInput, setOriginalName, setSelect } from "../helpers/formHelpers";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers";
import {
  createBorehole,
  goToDetailRouteAndAcceptTerms,
  goToRouteAndAcceptTerms,
  handlePrompt,
  newEditableBorehole,
  returnToOverview,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for 'Location' edit page.", () => {
  it("creates and deletes a borehole.", () => {
    goToRouteAndAcceptTerms("/");
    newEditableBorehole();

    // enter original name and make sure it was copied to alternate name
    setOriginalName("AAA_SCATORPS");
    evaluateInput("name", "AAA_SCATORPS");

    // save borehole
    saveWithSaveBar();

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
    cy.wait(["@edit_deletelist"]);
    cy.get('[data-cy="borehole-table"]').contains("AAA_SCATORPS").should("not.exist");
  });

  it("completes alternate name", () => {
    createBorehole({ originalName: "PHOTOSQUIRREL", name: "PHOTOSQUIRREL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}`);

      evaluateInput("originalName", "PHOTOSQUIRREL");
      evaluateInput("name", "PHOTOSQUIRREL");

      startBoreholeEditing();
      // changing original name should also change alternate name
      setOriginalName("PHOTOCAT");
      evaluateInput("originalName", "PHOTOCAT");
      evaluateInput("name", "PHOTOCAT");

      // changing alternate name should not change original name
      setInput("name", "PHOTOMOUSE");
      evaluateInput("originalName", "PHOTOCAT");
      evaluateInput("name", "PHOTOMOUSE");

      // changing original name should not update alternate name if they are different
      setOriginalName("PHOTOPIGEON");
      evaluateInput("originalName", "PHOTOPIGEON");
      evaluateInput("name", "PHOTOMOUSE");

      clearInput("name");
      evaluateInput("originalName", "PHOTOPIGEON");
      evaluateInput("name", "");
      saveWithSaveBar();
      // should be reset to original name if alternate name is empty
      evaluateInput("originalName", "PHOTOPIGEON");
      evaluateInput("name", "PHOTOPIGEON");

      // should keep different alternate name when switching tabs
      setInput("name", "PHOTOMOUSE");
      saveWithSaveBar();
      navigateInSidebar(SidebarMenuItem.borehole);
      navigateInSidebar(SidebarMenuItem.location);
      evaluateInput("originalName", "PHOTOPIGEON");
      evaluateInput("name", "PHOTOMOUSE");
    });
  });

  it("does not overwrite alternate name if it is different from original name", () => {
    createBorehole({ originalName: "PHOTOSQUIRREL", name: "PHOTOMOUSE" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}`);

      evaluateInput("originalName", "PHOTOSQUIRREL");
      evaluateInput("name", "PHOTOMOUSE");

      startBoreholeEditing();
      // changing original name should not update alternate name if they are different
      setInput("originalName", "PHOTOPIGEON");
      evaluateInput("originalName", "PHOTOPIGEON");
      evaluateInput("name", "PHOTOMOUSE");
    });
  });

  it("displays unsaved changes message if unsaved changes are present", () => {
    createBorehole({ originalName: "PHOTOSQUIRREL", name: "PHOTOPIGEON" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}`);
      startBoreholeEditing();

      verifyNoUnsavedChanges();
      setSelect("restrictionId", 2);
      verifyUnsavedChanges();

      // reset from form
      setSelect("restrictionId", 0);
      verifyNoUnsavedChanges();

      // discard changes with button
      setSelect("restrictionId", 3);
      verifyUnsavedChanges();
      cy.get('[data-cy="discardchanges-button"]').click();
      verifyNoUnsavedChanges();

      // save changes
      setSelect("restrictionId", 3);
      verifyUnsavedChanges();
      cy.get('[data-cy="save-button"]').click();
      verifyNoUnsavedChanges();
    });
  });

  it("Saves restriction until date.", () => {
    goToRouteAndAcceptTerms("/");
    newEditableBorehole().as("borehole_id");

    setSelect("restrictionId", 3);
    isDisabled("restrictionUntil", false);
    setInput("restrictionUntil", "2012-11-14");
    evaluateInput("restrictionUntil", "2012-11-14");
    saveWithSaveBar();
    // navigate away and back to check if values are saved
    navigateInSidebar(SidebarMenuItem.borehole);
    navigateInSidebar(SidebarMenuItem.location);

    evaluateInput("restrictionUntil", "2012-11-14");
  });

  it("saves with ctrl s", () => {
    goToRouteAndAcceptTerms("/");
    newEditableBorehole();

    verifyNoUnsavedChanges();
    setOriginalName("PHOTOFOX");
    verifyUnsavedChanges();
    cy.get("body").type("{ctrl}s");
    verifyNoUnsavedChanges();
  });

  it("blocks navigating away and stop editing with unsaved changes", () => {
    goToRouteAndAcceptTerms("/");
    newEditableBorehole().as("borehole_id");
    let boreholeId: unknown;
    cy.get("@borehole_id").then(id => {
      boreholeId = id;
    });
    const messageUnsavedChanges = "There are unsaved changes. Do you want to discard all changes?";

    setOriginalName("FELIX_THE_RACOON");
    stopEditing();
    handlePrompt(messageUnsavedChanges, "cancel");
    cy.get('[data-cy="editingstop-button"]').should("exist");
    stopEditing();
    handlePrompt(messageUnsavedChanges, "discardchanges");
    cy.get('[data-cy="editingstop-button"]').should("not.exist");

    startBoreholeEditing();
    setOriginalName("FELIX_THE_BROOM");

    cy.dataCy("borehole-menu-item").click();
    handlePrompt(messageUnsavedChanges, "cancel");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/location`);
    });

    navigateInSidebar(SidebarMenuItem.borehole, "discardchanges");
  });
});
