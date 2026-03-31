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
    sortBy("Name");
    verifyRowContains("Zena Tillman", 0);
    verifyRowContains("Zena Rolfson", 1);
    verifyRowContains("Zena Rath", 2);

    // sort by borehole length descending
    sortBy("Borehole length");
    sortBy("Borehole length");
    verifyRowContains("1'999.36", 0);
    verifyRowContains("1'999.07", 1);
    verifyRowContains("1'998.07", 2);

    // sort by reference elevation
    sortBy("Reference elevation");
    verifyRowContains("1.83", 0);
    verifyRowContains("1.98", 1);
    verifyRowContains("2.13", 2);

    // sort by borehole type descending
    sortBy("Borehole type");
    sortBy("Borehole type");
    verifyRowContains("virtual borehole", 0);
    verifyRowContains("virtual borehole", 1);
    verifyRowContains("virtual borehole", 2);

    // sort by drilling purpose descending
    sortBy("Drilling purpose");
    sortBy("Drilling purpose");
    verifyRowContains("scientific exploration", 0);
    verifyRowContains("scientific exploration", 1);
    verifyRowContains("scientific exploration", 2);
  });

  it("Preserves column sorting and active page when navigating", () => {
    goToRouteAndAcceptTerms("/");
    showTableAndWaitForData();

    // sort by name descending
    sortBy("Name");
    verifyRowContains("Zena Rath", 2);

    // navigate to page 4
    clickOnNextPage();
    clickOnNextPage();
    clickOnNextPage();
    clickOnNextPage();

    // verify current page is 4
    verifyPaginationText("401–500 of 3000");
    verifyRowContains("Samson Hayes", 0);

    // navigate to detail
    clickOnRowWithText("Samson Hayes");

    // return to list
    returnToOverview();

    // verify current page is still 4
    waitForTableData();
    verifyPaginationText("401–500 of 3000");
    verifyRowContains("Samson Hayes", 0);

    //navigate to last page
    clickOnLastPage();
    verifyPaginationText("2901–3000 of 3000");
  });

  it("Verifies all rows are selected on header checkbox click", () => {
    goToRouteAndAcceptTerms("/");
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "3'000");
    showTableAndWaitForData();
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "3'000");

    // check all rows
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.contains("3'000").should("not.exist");
    cy.contains("3000 selected").should("be.visible");

    // uncheck one row
    unCheckRowWithText("Aaliyah Casper");
    cy.contains("2999 selected").should("be.visible");

    // navigate to next page
    clickOnNextPage();
    cy.contains("2999 selected").should("be.visible");

    // uncheck another row
    unCheckRowWithText("Alfonzo Borer");
    cy.contains("2998 selected").should("be.visible");

    // uncheck all rows
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "3'000");

    // check one row
    checkRowWithText("Alfonzo Borer");
    cy.contains("1 selected").should("be.visible");

    // navigate to previous page
    cy.get('[aria-label="previous page"]').scrollIntoView();
    cy.get('[aria-label="previous page"]').click();
    waitForTableData();
    cy.contains("1 selected").should("be.visible");

    // check all, then uncheck all from page where single selection is not visible
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "3'000");

    // filter data
    cy.dataCy("show-filter-button").click();
    cy.contains("Borehole").click();
    setInput("totalDepthMin", "301");
    verifyPaginationText("1–100 of 2549");

    // check all rows
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.contains("3'000").should("not.exist");
    cy.contains("2549 selected").should("be.visible");

    // navigate to next page
    clickOnNextPage();
    cy.contains("2549 selected").should("be.visible");
  });
});
