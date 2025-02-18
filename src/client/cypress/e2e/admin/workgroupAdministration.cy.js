import {
  sortBy,
  verifyPaginationText,
  verifyRowContains,
  verifyTableLength,
  waitForTableData,
} from "../helpers/dataGridHelpers.js";
import { goToRouteAndAcceptTerms } from "../helpers/testHelpers.js";

describe("User administration settings tests", () => {
  it("displays, sorts and filters workgroup table.", () => {
    goToRouteAndAcceptTerms("/setting#workgroups");
    waitForTableData();
    verifyRowContains("Default", 0);
    verifyRowContains("3000", 0);
    verifyRowContains("Active", 0);
    verifyRowContains("View (2)", 0);
    verifyRowContains("Editor (2)", 0);
    verifyRowContains("Controller (2)", 0);
    verifyRowContains("Validator (2)", 0);
    verifyRowContains("Publisher (4)", 0);
    verifyRowContains("Reggae", 1);
    verifyRowContains("Inactive", 1);

    verifyPaginationText("1–6 of 6");
    verifyTableLength(6);

    // sort
    sortBy("Workgroup");
    verifyRowContains("Blues", 0);
    verifyRowContains("Country", 1);
    verifyRowContains("Default", 2);
    verifyRowContains("Reggae", 3);

    // filter with quick filter
    cy.get(".MuiDataGrid-toolbarQuickFilter input")
      .click()
      .then(() => {
        cy.focused().clear();
        cy.get(".MuiDataGrid-toolbarQuickFilter input").type("inactive", {
          delay: 10,
        });
      });

    verifyTableLength(4);
    verifyRowContains("Blues", 0);
    verifyRowContains("Country", 1);
    verifyRowContains("Reggae", 2);
    verifyRowContains("World", 3);
  });
});
