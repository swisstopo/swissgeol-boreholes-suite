import {
  clickOnRowWithText,
  sortBy,
  verifyPaginationText,
  verifyRowContains,
  verifyTableLength,
  waitForTableData,
} from "../helpers/dataGridHelpers.js";
import { getElementByDataCy, giveAdminUser2workgroups, goToRouteAndAcceptTerms } from "../helpers/testHelpers.js";

describe("Admin settings test", () => {
  beforeEach(() => {
    giveAdminUser2workgroups();
    goToRouteAndAcceptTerms("/setting#users");
    waitForTableData();
  });

  it("displays, sorts and filters user table and shows user detail.", () => {
    verifyRowContains("Admin", 0);
    verifyRowContains("admin.user@local.dev", 0);
    verifyRowContains("Enabled", 0);
    verifyPaginationText("1–8 of 8");
    verifyTableLength(8);

    // sort
    sortBy("First name");
    sortBy("First name"); // clicking twice to sort descending
    verifyRowContains("Viewer", 0);
    verifyRowContains("example@example.com", 0);
    verifyRowContains("Enabled", 0);

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
    verifyRowContains("Enabled", 0);

    clickOnRowWithText("editor");
    getElementByDataCy("settings-header").should("contain", "E. user");

    // User should not be admin
    cy.get('[data-cy="is-user-admin-checkbox"] input').should("not.be.checked");

    // Workgroup table should contain 1 entry
    verifyTableLength(1);
    verifyRowContains("Default", 0); // Workgroup

    getElementByDataCy("backButton").click();

    clickOnRowWithText("Admin");
    getElementByDataCy("settings-header").should("contain", "A. User");
    // User should be admin
    cy.get('[data-cy="is-user-admin-checkbox"] input').should("be.checked");
    verifyTableLength(2);
    verifyRowContains("Default", 0); // Workgroup
    verifyRowContains("Blue", 1); // Workgroup
  });
});
