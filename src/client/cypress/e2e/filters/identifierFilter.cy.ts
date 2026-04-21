import { addItem, saveWithSaveBar } from "../helpers/buttonHelpers";
import {
  checkAllVisibleRows,
  hasPagination,
  showTableAndWaitForData,
  verifyPaginationText,
} from "../helpers/dataGridHelpers";
import { evaluateInput, evaluateSelect, setInput, setSelect } from "../helpers/formHelpers";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers.ts";
import {
  goToRouteAndAcceptTerms,
  newEditableBorehole,
  returnToOverview,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for filtering data by identifier.", () => {
  // Todo: reactivate once the identifier filter is implemented. For now, the filter is hidden and not functional (https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2547)
  it.skip("can filter by identifier", () => {
    goToRouteAndAcceptTerms(`/`);
    newEditableBorehole().as("borehole_id");

    // Add multiple id values for the same identifier type
    navigateInSidebar(SidebarMenuItem.identifiers);
    addItem("addIdentifier");
    setSelect("boreholeCodelists.0.codelistId", 0);
    setInput("boreholeCodelists.0.value", 819544732);

    cy.get('[data-cy="100000004-add-id-button"]').click();
    setInput("boreholeCodelists.1.value", "ABC123456");
    saveWithSaveBar();

    stopBoreholeEditing();
    stopBoreholeEditing();
    evaluateSelect("boreholeCodelists.0.codelistId", "original ID");
    evaluateInput("boreholeCodelists.0.value", "819544732");
    evaluateInput("boreholeCodelists.1.value", "ABC123456");

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

  // TODO: Rewrite once the identifier filter is re-implemented (https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2547).
  it.skip("can bulk edit boreholes while filter by identifier is set", () => {
    goToRouteAndAcceptTerms(`/`);
    newEditableBorehole().as("borehole_id");
    navigateInSidebar(SidebarMenuItem.identifiers);
    addItem("addIdentifier");
    setSelect("boreholeCodelists.0.codelistId", 1);
    setInput("boreholeCodelists.0.value", 64531274);
    saveWithSaveBar();

    stopBoreholeEditing();
    returnToOverview();

    newEditableBorehole().as("borehole_id_2");
    navigateInSidebar(SidebarMenuItem.identifiers);
    addItem("addIdentifier");
    setSelect("boreholeCodelists.0.codelistId", 1);
    setInput("boreholeCodelists.0.value", 436584127);
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
