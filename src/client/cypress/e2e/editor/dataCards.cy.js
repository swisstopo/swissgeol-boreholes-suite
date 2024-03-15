import { createBorehole, startBoreholeEditing, loginAsAdmin, handlePrompt } from "../helpers/testHelpers";
import {
  setInput,
  evaluateInput,
  evaluateTextarea,
  setSelect,
  evaluateSelect,
  evaluateDisplayValue,
} from "../helpers/formHelpers";
import { addItem, startEditing } from "../helpers/buttonHelpers";

describe("Tests for the data cards in the editor.", () => {
  it("checks for unsaved changes when switching between cards", () => {
    createBorehole({ "extended.original_name": "INTEADAL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/hydrogeology/wateringress`);
    });
    startBoreholeEditing();

    // no prompt should be displayed when no card is currently in edit mode
    addItem("addWaterIngress");
    cy.wait("@casing_GET");
    setInput("startTime", "2012-11-14T12:06");
    setSelect("reliabilityId", 1);

    // can cancel switching tabs without loosing data
    addItem("addWaterIngress");
    handlePrompt("Water ingress: Unsaved changes", "Cancel");
    evaluateInput("startTime", "2012-11-14T12:06");
    evaluateSelect("reliabilityId", "15203157");
    setSelect("quantityId", 2);

    // can reset new card form
    addItem("addWaterIngress");
    handlePrompt("Water ingress: Unsaved changes", "Reset");
    cy.get('[data-cy="waterIngress-card.0.edit"]').should("exist");

    // can save new card and switch to new card
    setInput("startTime", "2012-11-14T12:06");
    setSelect("reliabilityId", 1);
    setSelect("quantityId", 2);
    addItem("addWaterIngress");
    handlePrompt("Water ingress: Unsaved changes", "Save");
    cy.wait("@wateringress_GET");
    cy.get('[data-cy="waterIngress-card.0.edit"]').should("exist");
    cy.get('[data-cy="waterIngress-card.1"]').should("exist");

    // can switch cards without prompt if no changes were made
    startEditing();
    setInput("comment", "Lorem.");

    // can cancel switching tabs without loosing data
    addItem("addWaterIngress");
    handlePrompt("Water ingress: Unsaved changes", "Cancel");
    evaluateTextarea("comment", "Lorem.");

    // can reset creating
    addItem("addWaterIngress");
    handlePrompt("Water ingress: Unsaved changes", "Reset");
    evaluateDisplayValue("comment", "-");

    // can save changes in existing card and switch to new card
    startEditing();
    setInput("comment", "Lorem.");
    addItem("addWaterIngress");
    handlePrompt("Water ingress: Unsaved changes", "Save");
    evaluateDisplayValue("comment", "Lorem.");

    // can reset creating and switch to existing card
    setInput("startTime", "2012-11-14T12:06");
    setSelect("reliabilityId", 1);
    startEditing();
    handlePrompt("Water ingress: Unsaved changes", "Reset");
    cy.get('[data-cy="waterIngress-card.0.edit"]').should("exist");
    cy.get('[data-cy="waterIngress-card.1"]').should("not.exist");

    // can save new card and switch to existing card
    addItem("addWaterIngress");
    setInput("startTime", "2013-10-02T14:06");
    setSelect("reliabilityId", 2);
    setSelect("quantityId", 3);
    startEditing();
    handlePrompt("Water ingress: Unsaved changes", "Save");
    cy.get('[data-cy="waterIngress-card.0.edit"]').should("exist");
    cy.get('[data-cy="waterIngress-card.1"]').should("exist");
  });
});
