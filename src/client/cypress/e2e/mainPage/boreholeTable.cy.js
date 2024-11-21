import {
  clickOnRowWithText,
  showTableAndWaitForData,
  sortBy,
  unCheckRowWithText,
  verifyPaginationText,
  verifyRowContains,
  waitForTableData,
} from "../helpers/dataGridHelpers";
import { loginAsAdmin, loginAsEditor, returnToOverview } from "../helpers/testHelpers.js";

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
    verifyRowContains("1.8", 0);
    verifyRowContains("3.47", 1);
    verifyRowContains("13.13", 2);

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
    waitForTableData();
    verifyPaginationText("401–500 of 1626");
    verifyRowContains("Nichole VonRueden", 0);
  });

  it("verifies all rows are selected on header checkbox click", () => {
    loginAsAdmin();
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "1'626");
    showTableAndWaitForData();
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "1'626");
    //check all rows
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.contains("1'626").should("not.exist");
    cy.contains("1478 selected").should("be.visible"); // does not select locked rows
    //uncheck one row
    unCheckRowWithText("Aaliyah Casper");
    cy.contains("1477 selected").should("be.visible");
    //uncheck all rows
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "1'626");

    // verify select all rows with filteres data
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("Registration").click();
    cy.contains("Show all fields").children(".checkbox").click();

    // input value
    cy.contains("Created by").next().find("input").type("v_ U%r");
    cy.wait("@edit_list");
    verifyPaginationText("1–100 of 329");
    // check all rows
    cy.get('[data-cy="table-header-checkbox"]').click();
    cy.contains("1'626").should("not.exist");
    cy.contains("298 selected").should("be.visible"); // does not select locked rows
  });
});
