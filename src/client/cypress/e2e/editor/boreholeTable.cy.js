import { loginAsAdmin, loginAsEditor, returnToOverview } from "../helpers/testHelpers.js";
import {
  clickOnRowWithText,
  showTableAndWaitForData,
  sortBy,
  verifyPaginationText,
  verifyRowContains,
  waitForTableData,
} from "../helpers/dataGridHelpers";

describe("Borehole editor table tests", () => {
  it("Boreholes are displayed in correct order with admin login", () => {
    loginAsAdmin();
    showTableAndWaitForData();

    // default soring by name ascending
    verifyRowContains("Aaliyah Casper", 0);
    verifyRowContains("Aaliyah Lynch", 1);
    verifyRowContains("Aaron Bartell", 2);

    // sort by Name descending
    sortBy("Name");
    verifyRowContains("Zena Rath", 0);
    verifyRowContains("Zena Mraz", 1);
    verifyRowContains("Zena Halvorson", 2);

    // sort by borehole length descending
    sortBy("Borehole length");
    sortBy("Borehole length");
    verifyRowContains("1998.07", 0);
    verifyRowContains("1997.79", 1);
    verifyRowContains("1995.5", 2);

    // sort by reference elevation
    sortBy("Reference elevation");
    verifyRowContains("3.36", 0);
    verifyRowContains("4.26", 1);
    verifyRowContains("4.58", 2);

    // sort by borehole type
    sortBy("Borehole type");
    verifyRowContains("borehole", 0);
    verifyRowContains("borehole", 1);
    verifyRowContains("borehole", 2);
  });

  it("preserves column sorting and active page when navigating", () => {
    loginAsEditor();
    showTableAndWaitForData();

    // sort by name descending
    sortBy("Name");
    verifyRowContains("Zena Rath", 0);

    // navigate to page 4
    cy.get('[aria-label="next page"]').scrollIntoView().click();
    waitForTableData();
    cy.get('[aria-label="next page"]').scrollIntoView().click();
    waitForTableData();
    cy.get('[aria-label="next page"]').scrollIntoView().click();
    waitForTableData();
    cy.get('[aria-label="next page"]').scrollIntoView().click();
    waitForTableData();

    // verify current page is 4
    verifyPaginationText("401–500 of 1626");
    verifyRowContains("Nichole VonRueden", 0);

    // navigate to detail
    clickOnRowWithText("Nichole VonRueden");

    // return to list
    returnToOverview();

    // verify current page is still 4
    showTableAndWaitForData();
    verifyPaginationText("401–500 of 1626");
    verifyRowContains("Nichole VonRueden", 0);
  });
});
