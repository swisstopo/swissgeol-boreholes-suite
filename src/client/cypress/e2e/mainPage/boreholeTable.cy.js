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
import { getElementByDataCy, goToRouteAndAcceptTerms, returnToOverview } from "../helpers/testHelpers.js";

describe("Borehole editor table tests", () => {
  it("Boreholes are displayed in correct order with admin login", () => {
    goToRouteAndAcceptTerms("/");
    showTableAndWaitForData();

    // default soring by name ascending
    verifyRowContains("Aaliyah Casper", 0);
    verifyRowContains("Aaliyah Lynch", 1);
    verifyRowContains("Aaron Bartell", 3);

    // verify a thousand separator is applied
    verifyRowContains("1'434.15", 3);
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
    verifyRowContains("1.80", 0);
    verifyRowContains("3.47", 1);
    verifyRowContains("5.14", 2);

    // sort by borehole type
    sortBy("Borehole type");
    verifyRowContains("borehole", 0);
    verifyRowContains("borehole", 1);
    verifyRowContains("borehole", 2);

    // sort by drilling purpose
    sortBy("Drilling purpose");
    verifyRowContains("geotechnics", 0);
    verifyRowContains("geotechnics", 1);
    verifyRowContains("geotechnics", 2);
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
    cy.contains("2727 selected").should("be.visible"); // does not select locked rows

    // uncheck one row
    unCheckRowWithText("Aaliyah Casper");
    cy.contains("2726 selected").should("be.visible");

    // navigate to next page
    clickOnNextPage();
    cy.contains("2726 selected").should("be.visible");

    // uncheck another row
    unCheckRowWithText("Alfonzo Borer");
    cy.contains("2725 selected").should("be.visible");

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
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("Registration").click();
    getElementByDataCy("show-all-fields-switch").click();
    cy.contains("Created by").next().find("input").type("v_ U%r");
    cy.wait("@edit_list");
    verifyPaginationText("1–100 of 602");

    // check all rows
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.contains("3'000").should("not.exist");
    cy.contains("550 selected").should("be.visible"); // does not select locked rows

    // navigate to next page
    clickOnNextPage();
    cy.contains("550 selected").should("be.visible");
  });
});
