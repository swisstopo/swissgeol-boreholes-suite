import {
  sortBy,
  verifyPaginationText,
  verifyRowContains,
  verifyTableLength,
  waitForTableData,
} from "../helpers/dataGridHelpers.js";
import { goToRouteAndAcceptTerms } from "../helpers/testHelpers.js";

describe("User administration settings tests", () => {
  it("displays, sorts and filters user table and shows user detail.", () => {
    goToRouteAndAcceptTerms("/setting#workgroups");
    waitForTableData();
    verifyRowContains("Admin", 0);
    verifyRowContains("admin.user@local.dev", 0);
    verifyRowContains("Active", 0);
    verifyPaginationText("1–8 of 8");
    verifyTableLength(8);

    // sort
    sortBy("First name");
    sortBy("First name"); // clicking twice to sort descending
    verifyRowContains("viewer", 0);
    verifyRowContains("example@example.com", 0);
    verifyRowContains("Active", 0);

    // filter with quick filter
    cy.get(".MuiDataGrid-toolbarQuickFilter input")
      .click()
      .then(() => {
        cy.focused().clear();
        cy.get(".MuiDataGrid-toolbarQuickFilter input").type("editor", {
          delay: 10,
        });
      });
    verifyTableLength(8);
    verifyRowContains("editor", 0);
    verifyRowContains("example@example.com", 0);
    verifyRowContains("Active", 0);
  });
});
