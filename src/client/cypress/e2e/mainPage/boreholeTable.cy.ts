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

    // default soring by name ascending
    verifyRowContains("Aaliyah Casper", 0);
    verifyRowContains("Aaliyah Lynch", 1);
    verifyRowContains("Aaron Bartell", 3);

    // verify a thousand separator is applied
    verifyRowContains("3'242.72", 3);
    verifyRowContains("2'478'298.00", 3);
    verifyRowContains("1'283'998.00", 3);

    // sort by Name descending
    sortByColumnHeader("Name");
    verifyRowContains("Zena Tillman", 0);
    verifyRowContains("Zena Rolfson", 1);
    verifyRowContains("Zena Rath", 2);

    // sort by borehole length descending
    sortByColumnHeader("Borehole length");
    sortByColumnHeader("Borehole length");
    verifyRowContains("1'999.36", 0);
    verifyRowContains("1'999.07", 1);
    verifyRowContains("1'998.07", 2);

    // sort by reference elevation
    sortByColumnHeader("Reference elevation");
    verifyRowContains("1.83", 0);
    verifyRowContains("1.98", 1);
    verifyRowContains("2.13", 2);

    // sort by borehole type descending
    sortByColumnHeader("Borehole type");
    sortByColumnHeader("Borehole type");
    verifyRowContains("virtual borehole", 0);
    verifyRowContains("virtual borehole", 1);
    verifyRowContains("virtual borehole", 2);

    // sort by drilling purpose descending
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

    // sort by name descending
    sortByColumnHeader("Name");
    verifyPaginationText("1–10 of 100");

    // navigate to page 4 (rows 31–40)
    nextPage();
    nextPage();
    nextPage();

    // verify current page is 4
    verifyPaginationText("31–40 of 100");

    // capture the borehole name displayed in the first row so the test does not
    // depend on a specific seeded name.
    cy.get('[data-cy="boreholes-table"] [role="row"]')
      .eq(1)
      .invoke("text")
      .then(firstRowText => {
        const targetName = firstRowText.trim().split(/\s{2,}/)[0];

        // navigate to detail
        clickOnRowWithText(targetName);

        // return to list
        returnToOverview();

        // verify current page is still 4 and the sort/selected borehole are preserved
        waitForTableData();
        verifyPaginationText("31–40 of 100");
        verifyRowContains(targetName, 0);
      });

    // navigate to last page
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

    // capture the names of the first two rows on page 1 so the test does not depend
    // on specific seeded values.
    cy.get('[data-cy="boreholes-table"] [role="row"]')
      .eq(1)
      .invoke("text")
      .then(text => {
        const firstRowName = text.trim().split(/\s{2,}/)[0];
        cy.wrap(firstRowName).as("firstRowName");
      });

    // check all rows
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.contains("100 selected").should("be.visible");

    // uncheck one row on page 1
    cy.get<string>("@firstRowName").then(firstRowName => {
      unCheckRowWithText(firstRowName);
    });
    cy.contains("99 selected").should("be.visible");

    // navigate to next page — selection state persists across pages
    nextPage();
    cy.contains("99 selected").should("be.visible");

    // uncheck a row on page 2
    cy.get('[data-cy="boreholes-table"] [role="row"]')
      .eq(1)
      .invoke("text")
      .then(text => {
        const page2RowName = text.trim().split(/\s{2,}/)[0];
        unCheckRowWithText(page2RowName);
        cy.contains("98 selected").should("be.visible");
      });

    // uncheck all rows
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "100");

    // check one row on page 2
    cy.get('[data-cy="boreholes-table"] [role="row"]')
      .eq(1)
      .invoke("text")
      .then(text => {
        const page2RowName = text.trim().split(/\s{2,}/)[0];
        checkRowWithText(page2RowName);
        cy.contains("1 selected").should("be.visible");
      });

    // navigate to previous page — single selection from the other page is still counted
    cy.get('[aria-label="previous page"]').scrollIntoView();
    cy.get('[aria-label="previous page"]').click();
    waitForTableData();
    cy.wait("@borehole_filter");
    cy.contains("1 selected").should("be.visible");

    // toggle all on, then off, from a page where the single selection is not visible
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "100");

    // filter data
    cy.dataCy("show-filter-button").click();
    cy.contains("Borehole").click();
    setInput("totalDepthMin", "301");
    cy.wait("@borehole_filter");

    // The exact filtered count depends on the random total-depth distribution in the seed
    // (~85% of boreholes have a depth greater than 301 m).
    cy.get('[data-cy="boreholes-number-preview"]')
      .invoke("text")
      .then(filteredText => {
        const filteredCount = parseInt(filteredText.replace(/[^0-9]/g, ""), 10);
        expect(filteredCount).to.be.greaterThan(0);
        expect(filteredCount).to.be.lessThan(100);

        // check all rows
        cy.get('[data-cy="table-header-checkbox"]').click();
        cy.contains(`${filteredCount} selected`).should("be.visible");

        // navigate to next page — selection persists
        nextPage();
        cy.contains(`${filteredCount} selected`).should("be.visible");
      });
  });
});
