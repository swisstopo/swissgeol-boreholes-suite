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
    verifyRowContains("Aaron Bartell", 2);

    // verify a thousand separator is applied
    verifyRowContains("1'913.61", 4);
    verifyRowContains("1'017.29", 4);
    verifyRowContains("2'604'222.17", 4);
    verifyRowContains("1'137'876.85", 4);

    // sort by Name descending
    sortBy("Name");
    verifyRowContains("Zena Rath", 0);
    verifyRowContains("Zena Mraz", 1);
    verifyRowContains("Zena Halvorson", 2);

    // sort by borehole length descending
    sortBy("Borehole length");
    sortBy("Borehole length");
    verifyRowContains("1'998.07", 0);
    verifyRowContains("1'997.79", 1);
    verifyRowContains("1'995.5", 2);

    // sort by reference elevation
    sortBy("Reference elevation");
    verifyRowContains("1.8", 0);
    verifyRowContains("3.47", 1);
    verifyRowContains("13.13", 2);

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
    verifyRowContains("Zena Rath", 0);

    // navigate to page 4
    clickOnNextPage();
    clickOnNextPage();
    clickOnNextPage();
    clickOnNextPage();

    // verify current page is 4
    verifyPaginationText("401–500 of 1626");
    verifyRowContains("Nichole VonRueden", 0);

    // navigate to detail
    clickOnRowWithText("Nichole VonRueden");

    // return to list
    returnToOverview();

    // verify current page is still 4
    waitForTableData();
    verifyPaginationText("401–500 of 1626");
    verifyRowContains("Nichole VonRueden", 0);

    //navigate to last page
    clickOnLastPage();
    verifyPaginationText("1601–1626 of 1626");
  });

  it("Verifies all rows are selected on header checkbox click", () => {
    goToRouteAndAcceptTerms("/");
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "1'626");
    showTableAndWaitForData();
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "1'626");

    // check all rows
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.contains("1'626").should("not.exist");
    cy.contains("1477 selected").should("be.visible"); // does not select locked rows

    // uncheck one row
    unCheckRowWithText("Aaliyah Casper");
    cy.contains("1476 selected").should("be.visible");

    // navigate to next page
    clickOnNextPage();
    cy.contains("1476 selected").should("be.visible");

    // uncheck another row
    unCheckRowWithText("Angus Spencer");
    cy.contains("1475 selected").should("be.visible");

    // uncheck all rows
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "1'626");

    // check one row
    checkRowWithText("Andres Renner");
    cy.contains("1 selected").should("be.visible");

    // navigate to previous page
    cy.get('[aria-label="previous page"]').scrollIntoView();
    cy.get('[aria-label="previous page"]').click();
    waitForTableData();
    cy.contains("1 selected").should("be.visible");

    // check all, then uncheck all from page where single selection is not visible
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "1'626");

    // filter data
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("Registration").click();
    getElementByDataCy("show-all-fields-switch").click();
    cy.contains("Created by").next().find("input").type("v_ U%r");
    cy.wait("@edit_list");
    verifyPaginationText("1–100 of 329");

    // check all rows
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.contains("1'626").should("not.exist");
    cy.contains("298 selected").should("be.visible"); // does not select locked rows

    // navigate to next page
    clickOnNextPage();
    cy.contains("298 selected").should("be.visible");
  });
});
