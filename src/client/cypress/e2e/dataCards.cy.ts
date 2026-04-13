import { addItem, cancelEditing, saveForm, startEditing } from "./helpers/buttonHelpers";
import { evaluateDisplayValue, evaluateTextarea, setInput, setSelect } from "./helpers/formHelpers";
import {
  createBorehole,
  goToDetailRouteAndAcceptTerms,
  handlePrompt,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "./helpers/testHelpers";

describe("Tests for the data cards in the editor.", () => {
  it("resets datacards when stop editing or cancel", () => {
    createBorehole({ originalName: "FISHTRUCK" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}/hydrogeology/wateringress`);
      cy.wait(["@borehole"]);
    });

    startBoreholeEditing();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);

    //Add card and cancel editing in datacard
    addItem("addwateringress");
    cy.dataCy("waterIngress-card.0.edit").should("exist");
    cancelEditing();
    cy.dataCy("waterIngress-card.0.edit").should("not.exist");

    //Add card and stop editing borehole
    addItem("addwateringress");
    cy.dataCy("waterIngress-card.0.edit").should("exist");
    stopBoreholeEditing();
    cy.dataCy("waterIngress-card.0.edit").should("not.exist");

    startBoreholeEditing();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    addItem("addwateringress");
    cy.wait("@casing_by_borehole_GET");
    setInput("startTime", "2012-11-14T12:06");
    setSelect("reliabilityId", 2);
    setSelect("quantityId", 2);
    saveForm();
    cy.wait("@wateringress_GET");
    startEditing();
    setInput("comment", "Lorem.");
    stopBoreholeEditing(true);
    evaluateDisplayValue("comment", "-");
  });

  it("checks for unsaved changes when switching between cards", () => {
    createBorehole({ originalName: "FROGPHONE" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}/hydrogeology/wateringress`);
      cy.wait(["@borehole"]);
    });
    startBoreholeEditing();
    cy.wait("@wateringress_GET");

    addItem("addwateringress");
    cy.dataCy("addwateringress-button").should("be.disabled");
    cy.get(".MuiCircularProgress-root").should("not.exist");

    setInput("startTime", "2012-11-14T12:06");
    setSelect("reliabilityId", 3);
    setSelect("quantityId", 3);
    saveForm();
    cy.dataCy("addwateringress-button").should("be.enabled");

    startEditing();
    setInput("comment", "Lorem.");

    // can cancel switching tabs without loosing data
    addItem("addwateringress");
    handlePrompt("Water ingress: You have unsaved changes. How would you like to proceed?", "cancel");
    evaluateTextarea("comment", "Lorem.");

    // can reset creating
    addItem("addwateringress");
    handlePrompt("Water ingress: You have unsaved changes. How would you like to proceed?", "reset");
    evaluateDisplayValue("comment", "-");

    // can save changes in existing card and switch to new card
    startEditing();
    setInput("comment", "Lorem.");
    addItem("addwateringress");
    handlePrompt("Water ingress: You have unsaved changes. How would you like to proceed?", "save");
    evaluateDisplayValue("comment", "Lorem.");

    // can reset creating and switch to existing card
    setInput("startTime", "2012-11-14T12:06");
    setSelect("reliabilityId", 2);
    startEditing();
    handlePrompt("Water ingress: You have unsaved changes. How would you like to proceed?", "reset");
    cy.dataCy("waterIngress-card.0.edit").should("exist");
    cy.dataCy("waterIngress-card.1").should("not.exist");

    // can save new card and switch to existing card
    addItem("addwateringress");
    setInput("startTime", "2013-10-02T14:06");
    setSelect("reliabilityId", 3);
    setSelect("quantityId", 3);
    startEditing();
    handlePrompt("Water ingress: You have unsaved changes. How would you like to proceed?", "save");
    cy.dataCy("waterIngress-card.0.edit").should("exist");
    cy.dataCy("waterIngress-card.1").should("exist");
  });
});
