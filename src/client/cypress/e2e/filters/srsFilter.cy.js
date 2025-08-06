import { saveWithSaveBar } from "../helpers/buttonHelpers";
import { verifyPaginationText } from "../helpers/dataGridHelpers";
import { setSelect } from "../helpers/formHelpers";
import {
  getElementByDataCy,
  goToRouteAndAcceptTerms,
  newEditableBorehole,
  returnToOverview,
  stopBoreholeEditing,
} from "../helpers/testHelpers.js";

describe("Tests for filtering data by reference system.", () => {
  function goToEditorLocationFilter() {
    getElementByDataCy("settings-button").click();
    getElementByDataCy("general-tab").click();
    cy.contains("div", "Location filters").click();
  }

  it("can set filters as editor", () => {
    goToRouteAndAcceptTerms("/");
    cy.get('[data-cy="show-filter-button"]').click();
    goToEditorLocationFilter();

    cy.contains("div", "Spatial reference system").children().first().children().first().as("checkbox");
    cy.get("@checkbox").check({ force: true });
    cy.get("@checkbox").should("be.checked");

    returnToOverview();
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("h6", "Location").click();
    cy.get('[data-cy="originalReferenceSystem-formSelect"]').should("exist");

    goToEditorLocationFilter();
    cy.get("@checkbox").uncheck({ force: true });
    cy.get("@checkbox").should("not.be.checked");

    returnToOverview();
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("h6", "Location").click();
    cy.get('[data-cy="originalReferenceSystem-formSelect"]').should("not.exist");
  });

  it("can filter by reference system", () => {
    goToRouteAndAcceptTerms(`/`);
    newEditableBorehole().as("borehole_id");
    cy.get('[data-cy="locationXLV03-formCoordinate"]').as("LV03X-input");
    cy.get('[data-cy="locationXLV03-formCoordinate"]').as("LV03Y-input");

    setSelect("originalReferenceSystem", 1);

    cy.get("@LV03X-input").type("645778", { delay: 10 });
    cy.get("@LV03Y-input").type("245794", { delay: 10 });

    saveWithSaveBar();

    stopBoreholeEditing();
    returnToOverview();
    cy.get('[data-cy="show-filter-button"]').click();

    cy.contains("h6", "Location").click();
    getElementByDataCy("show-all-fields-switch").click();
    verifyPaginationText("1–100 of 3001");

    cy.get('[data-cy="originalReferenceSystem-formSelect"]').should("exist");

    setSelect("originalReferenceSystem", 0); // LV95

    verifyPaginationText("1–100 of 813");

    setSelect("originalReferenceSystem", 1); // LV03
    verifyPaginationText("1–100 of 814");

    // click reset label
    cy.get('[data-cy="reset-filter-button"]').click();
    verifyPaginationText("1–100 of 3001");
  });
});
