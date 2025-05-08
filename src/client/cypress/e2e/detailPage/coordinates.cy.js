import { discardChanges, saveWithSaveBar } from "../helpers/buttonHelpers";
import { evaluateSelect, setSelect } from "../helpers/formHelpers";
import {
  delayedType,
  goToRouteAndAcceptTerms,
  handlePrompt,
  newEditableBorehole,
  newUneditableBorehole,
  returnToOverview,
} from "../helpers/testHelpers";

function checkDecimalPlaces(inputAlias, expectedDecimalPlaces) {
  cy.get(inputAlias)
    .invoke("val")
    .then(val => {
      const parts = val.split(".");
      expect(parts[1]).to.have.length(expectedDecimalPlaces);
    });
}

describe("Tests for editing coordinates of a borehole.", () => {
  beforeEach(() => {
    goToRouteAndAcceptTerms(`/`);
    newEditableBorehole().as("borehole_id");

    cy.get('[data-cy="locationX-formCoordinate"] input').as("LV95X-input");
    cy.get('[data-cy="locationY-formCoordinate"] input').as("LV95Y-input");
    cy.get('[data-cy="locationXLV03-formCoordinate"] input').as("LV03X-input");
    cy.get('[data-cy="locationYLV03-formCoordinate"] input').as("LV03Y-input");
    cy.get('[data-cy="elevationZ-formInput"] input').as("elevationZ");
    cy.get('[data-cy="country-formInput"] input').as("country");
    cy.get('[data-cy="canton-formInput"] input').as("canton");
    cy.get('[data-cy="municipality-formInput"] input').as("municipality");
  });

  it("creates new borehole and adds coordinates", () => {
    // fill inputs for LV95
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get("@LV95X-input").type("2645123");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get("@LV95Y-input").type("1245794");
    cy.wait("@location");
    // verify automatically filled inputs for LV03
    cy.get("@LV95Y-input").should("have.value", "1'245'794");
    cy.get("@LV03Y-input").should("have.value", "245'794");
    cy.get("@LV03X-input").should("have.value", "645'122");
    // verify location set
    cy.get("@country").should("have.value", "Schweiz");
    cy.get("@canton").should("have.value", "Aargau");
    cy.get("@municipality").should("have.value", "Oberentfelden");

    //switch reference system and show prompt
    setSelect("originalReferenceSystem", 1);
    handlePrompt("Changing the coordinate system will reset the coordinates. Do you want to continue?", "cancel");
    evaluateSelect("originalReferenceSystem", "20104001");
    setSelect("originalReferenceSystem", 1);
    handlePrompt("Changing the coordinate system will reset the coordinates. Do you want to continue?", "confirm");
    evaluateSelect("originalReferenceSystem", "20104002");

    // verify all inputs are empty
    cy.get("@LV95X-input").should("be.empty");
    cy.get("@LV95Y-input").should("be.empty");
    cy.get("@LV03X-input").should("be.empty");
    cy.get("@LV03Y-input").should("be.empty");
    cy.get("@country").should("have.value", "");
    cy.get("@canton").should("have.value", "");
    cy.get("@municipality").should("have.value", "");

    // no prompt should appear if coordinate fields are empty
    setSelect("originalReferenceSystem", 1);
    evaluateSelect("originalReferenceSystem", "20104002");
  });

  it("validates inputs", () => {
    // divs have errors as long as inputs are empty
    cy.get('[data-cy="locationX-formCoordinate"] > div').should("have.class", "Mui-error");
    cy.get('[data-cy="locationY-formCoordinate"] > div').should("have.class", "Mui-error");
    cy.get('[data-cy="locationXLV03-formCoordinate"] > div').should("have.class", "Mui-disabled");
    cy.get('[data-cy="locationYLV03-formCoordinate"] > div').should("have.class", "Mui-disabled");

    // type valid coordinates
    cy.get("@LV95X-input").scrollIntoView();
    delayedType(cy.get("@LV95X-input"), "2645123.12124");
    cy.get("@LV95Y-input").scrollIntoView();
    delayedType(cy.get("@LV95Y-input"), "1245794.92348");

    cy.get('[data-cy="locationXLV03-formCoordinate"] > div').should("not.have.class", "Mui-error");
    cy.get('[data-cy="locationYLV03-formCoordinate"] > div').should("not.have.class", "Mui-error");
    cy.get('[data-cy="locationX-formCoordinate"] > div').should("not.have.class", "Mui-error");
    cy.get('[data-cy="locationY-formCoordinate"] > div').should("not.have.class", "Mui-error");

    cy.wait("@location");
    // type coordinates that are out of bounds
    cy.get("@LV95X-input").clear();
    delayedType(cy.get("@LV95X-input"), "264512");

    cy.get("@LV95Y-input").clear();
    delayedType(cy.get("@LV95Y-input"), "124579");

    // divs that changed have errors
    cy.get('[data-cy="locationXLV03-formCoordinate"] > div').should("not.have.class", "Mui-error");
    cy.get('[data-cy="locationYLV03-formCoordinate"] > div').should("not.have.class", "Mui-error");
    cy.get('[data-cy="locationX-formCoordinate"] > div').should("have.class", "Mui-error");
    cy.get('[data-cy="locationY-formCoordinate"] > div').should("have.class", "Mui-error");
  });

  it("changes coordinates from map and saves", () => {
    //start with references system LV03
    setSelect("originalReferenceSystem", 1);

    // verify automatically filled inputs
    cy.get("@LV95X-input").should("have.value", "");
    cy.get("@LV95Y-input").should("have.value", "");
    cy.get("@LV03X-input").should("have.value", "");
    cy.get("@elevationZ").should("have.value", "");
    cy.get("@country").should("have.value", "");
    cy.get("@canton").should("have.value", "");
    cy.get("@municipality").should("have.value", "");

    // zoom into map
    cy.get('[data-cy="zoom-in-button"]').click({ force: true });
    cy.get('[data-cy="zoom-in-button"]').click({ force: true });

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    // click on map
    cy.get('[class="ol-viewport"]').scrollIntoView();
    cy.get('[class="ol-viewport"]').click(390, 250, { force: true });

    cy.wait("@location");
    cy.get('[data-cy="height-button"]').click();
    cy.wait("@height");
    cy.get('[data-cy="apply-button"]').click();
    cy.wait("@geodesy");
    cy.wait("@location");

    // verify automatically filled inputs
    cy.get("@LV95X-input").should("not.have.value", "");
    cy.get("@LV95Y-input").should("not.have.value", "");
    cy.get("@LV03X-input").should("not.have.value", "");
    cy.get("@LV03Y-input").should("not.have.value", "");
    cy.get("@elevationZ").should("not.have.value", "");
    cy.get("@country").should("not.have.value", "");
    cy.get("@canton").should("not.have.value", "");
    cy.get("@municipality").should("not.have.value", "");

    // verify original reference system has switched to LV95
    cy.get("[name=originalReferenceSystem]").should("have.value", 20104001);

    // verify that all inputs have a precision of 2 decimal places
    checkDecimalPlaces("@LV95X-input", 2);
    checkDecimalPlaces("@LV95Y-input", 2);
    checkDecimalPlaces("@LV03X-input", 2);
    checkDecimalPlaces("@LV03Y-input", 2);

    saveWithSaveBar();
    returnToOverview();
    newUneditableBorehole();
    // verify input are cleared for new borehole
    cy.get("@LV95X-input").should("have.value", "");
    cy.get("@LV95Y-input").should("have.value", "");
    cy.get("@LV03X-input").should("have.value", "");
    cy.get("@LV03Y-input").should("have.value", "");
  });

  it("displays correct decimal precision", () => {
    // Type valid coordinates with zeros after decimal
    cy.get("@LV95X-input").type("2645123.0000");
    cy.get("@LV95Y-input").type("1245794.000");

    cy.wait("@location");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(4000);
    cy.get('[data-cy="locationX-formCoordinate"] input').as("LV95X-input");
    cy.get('[data-cy="locationY-formCoordinate"] input').as("LV95Y-input");
    cy.get('[data-cy="locationXLV03-formCoordinate"] input').as("LV03X-input");
    cy.get('[data-cy="locationYLV03-formCoordinate"] input').as("LV03Y-input");
    checkDecimalPlaces("@LV95X-input", 4);
    checkDecimalPlaces("@LV95Y-input", 3);
    checkDecimalPlaces("@LV03X-input", 4);
    checkDecimalPlaces("@LV03Y-input", 4);

    saveWithSaveBar();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(4000);
    // Navigate somewhere else and return
    cy.get('[data-cy="borehole-menu-item"]').click();
    cy.contains("Borehole type");
    cy.get('[data-cy="location-menu-item"]').click();

    cy.get('[data-cy="locationX-formCoordinate"] input').as("LV95X-input");
    cy.get('[data-cy="locationY-formCoordinate"] input').as("LV95Y-input");
    cy.get('[data-cy="locationXLV03-formCoordinate"] input').as("LV03X-input");
    cy.get('[data-cy="locationYLV03-formCoordinate"] input').as("LV03Y-input");

    // Check that the values are still the same
    cy.get("@LV95X-input").should("have.value", `2'645'123.0000`);
    cy.get("@LV95Y-input").should("have.value", `1'245'794.000`);

    // Add more zeros to LV95Y input
    cy.get("@LV95Y-input").type("00");
    cy.wait("@location");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(4000);
    checkDecimalPlaces("@LV95X-input", 4);
    checkDecimalPlaces("@LV95Y-input", 5);
    checkDecimalPlaces("@LV03X-input", 5);
    checkDecimalPlaces("@LV03Y-input", 5);
    discardChanges();
  });

  it("updates canton and municipality when changing coordinates", () => {
    // Type coordinates for Samaden in LV95
    cy.get("@LV95X-input").type("2789000");
    cy.get("@LV95Y-input").type("1155000");
    cy.wait("@location");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(4000);

    cy.get("@country").should("have.value", "Schweiz");
    cy.get("@canton").should("have.value", "Graubünden");
    cy.get("@municipality").should("have.value", "Samaden");

    // Type coordinates for Unterentfelden in LV95
    cy.get("@LV95X-input").clear();
    cy.get("@LV95X-input").type("2646000");
    cy.get("@LV95Y-input").clear();
    cy.get("@LV95Y-input").type("1247000");

    cy.get("@country").should("have.value", "Schweiz");
    cy.get("@canton").should("have.value", "Aargau");
    cy.get("@municipality").should("have.value", "Unterentfelden");

    // switch reference system to LV03
    setSelect("originalReferenceSystem", 1);
    handlePrompt("Changing the coordinate system will reset the coordinates. Do you want to continue?", "confirm");

    // Type coordinates for Samaden in LV03
    cy.get("@LV03X-input").clear();
    cy.get("@LV03X-input").type("789000");
    cy.get("@LV03Y-input").clear();
    cy.get("@LV03Y-input").type("155000");

    cy.get("@country").should("have.value", "Schweiz");
    cy.get("@canton").should("have.value", "Graubünden");
    cy.get("@municipality").should("have.value", "Samaden");

    // Type coordinates for Unterentfelden in LV03
    cy.get("@LV03X-input").clear();
    cy.get("@LV03X-input").type("646000");
    cy.get("@LV03Y-input").clear();
    cy.get("@LV03Y-input").type("247000");

    cy.get("@country").should("have.value", "Schweiz");
    cy.get("@canton").should("have.value", "Aargau");
    cy.get("@municipality").should("have.value", "Unterentfelden");
  });
});
