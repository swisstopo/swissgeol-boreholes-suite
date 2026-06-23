import {
  checkRowWithText,
  clickOnLastPage,
  clickOnNextPage,
  clickOnRowWithText,
  showTableAndWaitForData,
  sortBy,
  unCheckRowWithText,
  verifyPaginationText,
  verifyRowContains,
  waitForTableData,
} from "../helpers/dataGridHelpers";
import { setInput } from "../helpers/formHelpers.js";
import { goToRouteAndAcceptTerms, returnToOverview } from "../helpers/testHelpers";

function nextPage() {
  clickOnNextPage();
  cy.wait("@borehole_filter");
}

function lastPage() {
  clickOnLastPage();
  cy.wait("@borehole_filter");
}

function sortByColumnHeader(headerTextContent: string) {
  sortBy(headerTextContent);
  cy.wait("@borehole_filter");
}

describe("Borehole editor table tests", () => {
  it("Boreholes are displayed in correct order with admin login", () => {
    goToRouteAndAcceptTerms("/");
    showTableAndWaitForData();

    // Default sorting by name ascending
    verifyRowContains("Addie Blick", 0);
    verifyRowContains("Aisha Thiel", 1);
    verifyRowContains("Alivia Bergstrom", 3);

    // Verify thousand separator formatting on row 3 (Alivia Bergstrom).
    // TotalDepth=764.7162 → "764.72", LocationX=2'531'511.00, LocationY=1'202'038.00
    verifyRowContains("764.72", 3);
    verifyRowContains("2'531'511.00", 3);
    verifyRowContains("1'202'038.00", 3);

    // Sort by Name descending
    sortByColumnHeader("Name");
    cy.get(".MuiDataGrid-row").eq(0).should("not.contain", "Addie Blick");
    verifyRowContains("Zelma Gorczany", 0);
    verifyRowContains("Yasmeen Torphy", 1);
    verifyRowContains("Winfield Kreiger", 2);

    // Sort by borehole length descending (first click → asc, second click → desc)
    sortByColumnHeader("Borehole length");
    sortByColumnHeader("Borehole length");
    verifyRowContains("1'975.17", 0); // Theo Kunze
    verifyRowContains("1'947.11", 1); // Connie Spencer
    verifyRowContains("1'919.05", 2); // Jeanne Deckow

    // Sort by reference elevation ascending
    sortByColumnHeader("Reference elevation");
    verifyRowContains("10.61", 0); // Eliza Ernser
    verifyRowContains("10.76", 1); // Emory Jast
    verifyRowContains("100.55", 2); // Emelia Aufderhar

    // Sort by borehole type descending. The API orders by borehole_type_id (not the
    // label), so row 0 is the codelist with the highest id — "virtual borehole"
    // (borehole_type_id 30000307). 4 boreholes share that type.
    sortByColumnHeader("Borehole type");
    sortByColumnHeader("Borehole type");
    verifyRowContains("virtual borehole", 0);
    verifyRowContains("virtual borehole", 1);
    verifyRowContains("virtual borehole", 2);

    // Sort by drilling purpose descending. The API orders by purpose_id (not the
    // label), so row 0 is the codelist with the highest id — "scientific exploration"
    // (purpose_id 30000012). 5 boreholes share that purpose.
    sortByColumnHeader("Drilling purpose");
    sortByColumnHeader("Drilling purpose");
    verifyRowContains("scientific exploration", 0);
    verifyRowContains("scientific exploration", 1);
    verifyRowContains("scientific exploration", 2);
  });

  it("Preserves column sorting and active page when navigating", () => {
    // Override the default page size (100) so the 100 seeded boreholes span multiple pages
    // and the pagination behavior can be exercised meaningfully.
    goToRouteAndAcceptTerms("/?pageSize=10");
    showTableAndWaitForData();

    // Sort by name descending
    sortByColumnHeader("Name");
    verifyPaginationText("1–10 of 100");

    // Navigate to page 4 (rows 31–40)
    nextPage();
    nextPage();
    nextPage();
    verifyPaginationText("31–40 of 100");
    verifyRowContains("Maye Collier", 0);

    // Navigate to detail
    clickOnRowWithText("Maye Collier");

    // Return to list
    returnToOverview();

    // Verify current page is still 4 and the sort is preserved
    waitForTableData();
    verifyPaginationText("31–40 of 100");
    verifyRowContains("Maye Collier", 0);

    // Navigate to last page
    lastPage();
    verifyPaginationText("91–100 of 100");
  });

  it("Verifies all rows are selected on header checkbox click", () => {
    // Override the default page size (100) so multi-page selection behavior can be exercised.
    goToRouteAndAcceptTerms("/?pageSize=10");
    cy.wait("@borehole_filter");
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "100");
    showTableAndWaitForData();
    cy.wait("@borehole_filter");
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "100");

    // Check all rows (header checkbox selects across all pages, not just the visible 10)
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.contains("100 selected").should("be.visible");

    // Uncheck one row on page 1
    unCheckRowWithText("Addie Blick");
    cy.contains("99 selected").should("be.visible");

    // Navigate to next page — selection state persists across pages
    nextPage();
    cy.contains("99 selected").should("be.visible");

    // Uncheck a row on page 2 (Billie Gerlach is one of the page-2 boreholes by name asc)
    unCheckRowWithText("Billie Gerlach");
    cy.contains("98 selected").should("be.visible");

    // Uncheck all rows from the header checkbox
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "100");

    // Check one row on page 2
    checkRowWithText("Billie Gerlach");
    cy.contains("1 selected").should("be.visible");

    // Navigate to previous page — single selection from the other page is still counted
    cy.get('[aria-label="previous page"]').scrollIntoView();
    cy.get('[aria-label="previous page"]').click();
    waitForTableData();
    cy.wait("@borehole_filter");
    cy.contains("1 selected").should("be.visible");

    // Toggle all on, then off, from a page where the single selection is not visible
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "100");

    // Filter data — 84 of 100 boreholes have totalDepth ≥ 301
    cy.dataCy("show-filter-button").click();
    cy.contains("Borehole").click();
    setInput("totalDepthMin", "301");
    cy.wait("@borehole_filter");
    verifyPaginationText("1–10 of 84");

    // Check all rows
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.contains("84 selected").should("be.visible");

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    // Navigate to next page — selection persists
    nextPage();
    cy.contains("84 selected").should("be.visible");
  });
});
