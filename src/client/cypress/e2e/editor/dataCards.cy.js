import { createBorehole, handlePrompt, loginAsAdmin, startBoreholeEditing } from "../helpers/testHelpers";
import { evaluateDisplayValue, evaluateTextarea, setInput, setSelect } from "../helpers/formHelpers";
import { addItem, saveForm, startEditing, stopEditing } from "../helpers/buttonHelpers";

describe("Tests for the data cards in the editor.", () => {
  it("resets datacards when stop editing", () => {
    createBorehole({ "extended.original_name": "INTEADAL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      loginAsAdmin(`/${id}/hydrogeology/wateringress`);
    });

    startBoreholeEditing();
    cy.wait(500);
    addItem("addwateringress");
    cy.get('[data-cy="waterIngress-card.0.edit"]').should("exist");
    stopEditing();
    cy.get('[data-cy="waterIngress-card.0.edit"]').should("not.exist");

    startBoreholeEditing();
    cy.wait(500);
    addItem("addwateringress");
    cy.wait("@casing_GET");
    setInput("startTime", "2012-11-14T12:06");
    setSelect("reliabilityId", 2);
    setSelect("quantityId", 3);
    saveForm();
    cy.wait("@wateringress_GET");
    startEditing();
    setInput("comment", "Lorem.");
    stopEditing();
    evaluateDisplayValue("comment", "-");
  });

  it("checks for unsaved changes when switching between cards", () => {
    createBorehole({ "extended.original_name": "INTEADAL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      loginAsAdmin(`/${id}/hydrogeology/wateringress`);
    });
    startBoreholeEditing();

    addItem("addwateringress");
    cy.get('[data-cy="addwateringress-button"]').should("be.disabled");
    cy.wait("@casing_GET");
    setInput("startTime", "2012-11-14T12:06");
    setSelect("reliabilityId", 2);
    setSelect("quantityId", 3);
    saveForm();
    cy.get('[data-cy="addwateringress-button"]').should("be.enabled");

    startEditing();
    setInput("comment", "Lorem.");

    // can cancel switching tabs without loosing data
    addItem("addwateringress");
    handlePrompt("Water ingress: You have unsaved changes. How would you like to proceed?", "Cancel");
    evaluateTextarea("comment", "Lorem.");

    // can reset creating
    addItem("addwateringress");
    handlePrompt("Water ingress: You have unsaved changes. How would you like to proceed?", "Reset");
    evaluateDisplayValue("comment", "-");

    // can save changes in existing card and switch to new card
    startEditing();
    setInput("comment", "Lorem.");
    addItem("addwateringress");
    handlePrompt("Water ingress: You have unsaved changes. How would you like to proceed?", "Save");
    evaluateDisplayValue("comment", "Lorem.");

    // can reset creating and switch to existing card
    setInput("startTime", "2012-11-14T12:06");
    setSelect("reliabilityId", 2);
    startEditing();
    handlePrompt("Water ingress: You have unsaved changes. How would you like to proceed?", "Reset");
    cy.get('[data-cy="waterIngress-card.0.edit"]').should("exist");
    cy.get('[data-cy="waterIngress-card.1"]').should("not.exist");

    // can save new card and switch to existing card
    addItem("addwateringress");
    setInput("startTime", "2013-10-02T14:06");
    setSelect("reliabilityId", 3);
    setSelect("quantityId", 3);
    startEditing();
    handlePrompt("Water ingress: You have unsaved changes. How would you like to proceed?", "Save");
    cy.get('[data-cy="waterIngress-card.0.edit"]').should("exist");
    cy.get('[data-cy="waterIngress-card.1"]').should("exist");
  });
});
