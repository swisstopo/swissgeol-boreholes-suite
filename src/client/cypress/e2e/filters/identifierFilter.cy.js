import { addItem, saveWithSaveBar } from "../helpers/buttonHelpers";
import { checkAllVisibleRows, verifyPaginationText } from "../helpers/dataGridHelpers";
import { setInput, setSelect } from "../helpers/formHelpers";
import {
  getElementByDataCy,
  goToRouteAndAcceptTerms,
  newEditableBorehole,
  returnToOverview,
  stopBoreholeEditing,
} from "../helpers/testHelpers.js";

describe("Tests for filtering data by identifier.", () => {
  it("can filter by identifier", () => {
    goToRouteAndAcceptTerms(`/`);
    newEditableBorehole().as("borehole_id");

    addItem("addIdentifier");
    setSelect("boreholeCodelists.0.codelistId", 1);
    setInput("boreholeCodelists.0.value", 819544732);
    saveWithSaveBar();

    stopBoreholeEditing();
    returnToOverview();
    cy.get('[data-cy="show-filter-button"]').click();

    cy.contains("h6", "Location").click();
    // show all options
    getElementByDataCy("show-all-fields-switch").click();
    verifyPaginationText("1–100 of 1627");

    setSelect("borehole_identifier", 0);

    verifyPaginationText("1–1 of 1");
    // click reset label
    cy.get('[data-cy="reset-filter-button"]').click();
    verifyPaginationText("1–100 of 1627");
  });

  it("can bulk edit boreholes while filter by identifier is set", () => {
    goToRouteAndAcceptTerms(`/`);
    newEditableBorehole().as("borehole_id");
    addItem("addIdentifier");
    setSelect("boreholeCodelists.0.codelistId", 1);
    setInput("boreholeCodelists.0.value", 64531274);
    saveWithSaveBar();

    stopBoreholeEditing();
    returnToOverview();

    newEditableBorehole().as("borehole_id_2");
    addItem("addIdentifier");
    setSelect("boreholeCodelists.0.codelistId", 1);
    setInput("boreholeCodelists.0.value", 436584127);
    saveWithSaveBar();

    stopBoreholeEditing();
    returnToOverview();
    cy.get('[data-cy="show-filter-button"]').click();

    cy.contains("h6", "Location").click();
    // show all options
    getElementByDataCy("show-all-fields-switch").click();

    setSelect("borehole_identifier", 0);
    verifyPaginationText("1–2 of 2");
    checkAllVisibleRows();
    cy.contains("button", "Bulk editing").click({ force: true });

    // Bulk edit dialog should open.
    cy.get("[data-cy='bulk-edit-accordion']").should("have.length", 19);
    cy.contains("button", "Cancel").click();

    // click reset label
    cy.get('[data-cy="reset-filter-button"]').click();
  });
});
