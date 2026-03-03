import { addItem, saveWithSaveBar } from "../helpers/buttonHelpers";
import {
  checkAllVisibleRows,
  hasPagination,
  showTableAndWaitForData,
  verifyPaginationText,
} from "../helpers/dataGridHelpers";
import { evaluateInput, evaluateSelect, setInput, setSelect } from "../helpers/formHelpers";
import {
  goToRouteAndAcceptTerms,
  newEditableBorehole,
  returnToOverview,
  stopBoreholeEditing,
} from "../helpers/testHelpers.js";

describe("Tests for filtering data by identifier.", () => {
  it("can filter by identifier", () => {
    goToRouteAndAcceptTerms(`/`);
    newEditableBorehole().as("borehole_id");

    // Add multiple id values for the same identifier type
    addItem("addIdentifier");
    setSelect("boreholeIdentifiers.0.codelistId", 1);
    setInput("boreholeIdentifiers.0.value", 819544732);

    addItem("addIdentifier");
    setSelect("boreholeIdentifiers.1.codelistId", 1);
    setInput("boreholeIdentifiers.1.value", "ABC123456");
    saveWithSaveBar();

    stopBoreholeEditing();
    evaluateSelect("boreholeIdentifiers.0.codelistId", "ID Original");
    evaluateInput("boreholeIdentifiers.0.value", "819544732");
    evaluateSelect("boreholeIdentifiers.1.codelistId", "ID Original");
    evaluateInput("boreholeIdentifiers.1.value", "ABC123456");

    returnToOverview();
    cy.dataCy("show-filter-button").click();

    cy.contains("h6", "Location").click();
    // show all options
    cy.dataCy("show-all-fields-switch").click();
    verifyPaginationText("1–100 of 3001");

    setSelect("borehole_identifier", 1);

    hasPagination(false);
    // click reset label
    cy.dataCy("reset-filter-button").click();
    verifyPaginationText("1–100 of 3001");
  });

  it("can bulk edit boreholes while filter by identifier is set", () => {
    goToRouteAndAcceptTerms(`/`);
    newEditableBorehole().as("borehole_id");
    addItem("addIdentifier");
    setSelect("boreholeIdentifiers.0.codelistId", 1);
    setInput("boreholeIdentifiers.0.value", 64531274);
    saveWithSaveBar();

    stopBoreholeEditing();
    returnToOverview();

    newEditableBorehole().as("borehole_id_2");
    addItem("addIdentifier");
    setSelect("boreholeIdentifiers.0.codelistId", 1);
    setInput("boreholeIdentifiers.0.value", 436584127);
    saveWithSaveBar();

    stopBoreholeEditing();
    returnToOverview();
    cy.dataCy("show-filter-button").click();

    cy.contains("h6", "Location").click();
    // show all options
    cy.dataCy("show-all-fields-switch").click();

    setSelect("borehole_identifier", 1);
    showTableAndWaitForData();
    hasPagination(false);
    checkAllVisibleRows();
    cy.contains("button", "Bulk editing").click({ force: true });

    // Bulk edit dialog should open.
    cy.dataCy("bulk-edit-accordion").should("have.length", 16);
    cy.contains("button", "Cancel").click();

    // click reset label
    cy.dataCy("reset-filter-button").click();
  });
});
