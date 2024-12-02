import { addItem, cancelEditing, saveForm, startEditing } from "./helpers/buttonHelpers";
import { createBorehole } from "./helpers/createEntitiesHelpers";
import { evaluateDisplayValue, evaluateTextarea, setInput, setSelect } from "./helpers/formHelpers";
import {
  handlePrompt,
  loginAsAdmin,
  selectByDataCyAttribute,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "./helpers/testHelpers";

describe("Tests for the data cards in the editor.", () => {
  it("resets datacards when stop editing or cancel", () => {
    createBorehole({ "extended.original_name": "FISHTRUCK" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      loginAsAdmin(`/${id}/hydrogeology/wateringress`);
      cy.wait(["@borehole", "@borehole_by_id"]);
    });

    startBoreholeEditing();
    cy.wait(500);

    //Add card and cancel editing in datacard
    addItem("addwateringress");
    selectByDataCyAttribute("waterIngress-card.0.edit").should("exist");
    cancelEditing();
    selectByDataCyAttribute("waterIngress-card.0.edit").should("not.exist");

    //Add card and stop editing borehole
    addItem("addwateringress");
    selectByDataCyAttribute("waterIngress-card.0.edit").should("exist");
    stopBoreholeEditing();
    selectByDataCyAttribute("waterIngress-card.0.edit").should("not.exist");

    startBoreholeEditing();
    cy.wait(500);
    addItem("addwateringress");
    cy.wait("@casing_GET");
    setInput("startTime", "2012-11-14T12:06");
    setSelect("reliabilityId", 2);
    setSelect("quantityId", 2);
    saveForm();
    cy.wait("@wateringress_GET");
    startEditing();
    setInput("comment", "Lorem.");
    stopBoreholeEditing();
    evaluateDisplayValue("comment", "-");
  });

  it("checks for unsaved changes when switching between cards", () => {
    createBorehole({ "extended.original_name": "FROGPHONE" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      loginAsAdmin(`/${id}/hydrogeology/wateringress`);
      cy.wait(["@borehole", "@borehole_by_id"]);
    });
    startBoreholeEditing();
    cy.wait("@wateringress_GET");

    addItem("addwateringress");
    selectByDataCyAttribute("addwateringress-button").should("be.disabled");
    cy.get(".MuiCircularProgress-root").should("not.exist");

    setInput("startTime", "2012-11-14T12:06");
    setSelect("reliabilityId", 3);
    setSelect("quantityId", 3);
    saveForm();
    selectByDataCyAttribute("addwateringress-button").should("be.enabled");

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
    selectByDataCyAttribute("waterIngress-card.0.edit").should("exist");
    selectByDataCyAttribute("waterIngress-card.1").should("not.exist");

    // can save new card and switch to existing card
    addItem("addwateringress");
    setInput("startTime", "2013-10-02T14:06");
    setSelect("reliabilityId", 3);
    setSelect("quantityId", 3);
    startEditing();
    handlePrompt("Water ingress: You have unsaved changes. How would you like to proceed?", "Save");
    selectByDataCyAttribute("waterIngress-card.0.edit").should("exist");
    selectByDataCyAttribute("waterIngress-card.1").should("exist");
  });
});
