import {
  checkRowWithText,
  clickOnRowWithText,
  sortBy,
  verifyPaginationText,
  verifyRowContains,
  verifyRowWithTextCheckState,
  verifyTableLength,
  waitForTableData,
} from "../helpers/dataGridHelpers.js";
import { setSelect } from "../helpers/formHelpers.js";
import { getElementByDataCy, goToRouteAndAcceptTerms, handlePrompt } from "../helpers/testHelpers.js";

describe("User administration settings tests", () => {
  it("displays, sorts and filters user table and shows user detail.", () => {
    goToRouteAndAcceptTerms("/setting#users");
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

    // Click on Editor
    clickOnRowWithText("editor");
    getElementByDataCy("settings-header").should("contain", "E. user");

    // Admin checkbox should not be checked
    cy.get('[data-cy="is-user-admin-checkbox"] input').should("not.be.checked");

    // Workgroup table should contain 1 entry
    verifyTableLength(1);
    verifyRowContains("Default", 0); // Workgroup
    // Editor user should have role editor
    getElementByDataCy("Editor-chip").should("be.visible");

    getElementByDataCy("backButton").click();

    // Click on Admin
    clickOnRowWithText("Admin");
    getElementByDataCy("settings-header").should("contain", "A. User");
    // Admin checkbox should be checked
    cy.get('[data-cy="is-user-admin-checkbox"] input').should("be.checked");
    verifyTableLength(1);
    verifyRowContains("Default", 0); // Workgroup

    // Admin user should have roles view, editor, controller, validator, publisher
    getElementByDataCy("View-chip").should("be.visible");
    getElementByDataCy("Editor-chip").should("be.visible");
    getElementByDataCy("Controller-chip").should("be.visible");
    getElementByDataCy("Validator-chip").should("be.visible");
    getElementByDataCy("Publisher-chip").should("be.visible");

    getElementByDataCy("backButton").click();
    verifyRowWithTextCheckState("Admin", true);
    verifyRowWithTextCheckState("editor", false);

    // Make editor admin from user table
    checkRowWithText("editor");
    verifyRowWithTextCheckState("editor", true);

    // Go to user detail
    clickOnRowWithText("editor");
    cy.get('[data-cy="is-user-admin-checkbox"] input').should("be.checked");

    // Uncheck is admin from user detail
    cy.get('[data-cy="is-user-admin-checkbox"] input').click();
    cy.get('[data-cy="is-user-admin-checkbox"] input').should("not.be.checked");
    getElementByDataCy("backButton").click();
    verifyRowWithTextCheckState("editor", false);
  });

  it("shows appropriate prompts when clicking delete button", () => {
    goToRouteAndAcceptTerms("/setting#users");
    waitForTableData();

    const messageForActiveNonDeletableUser =
      "The selected user cannot be deleted because currently there are some traces of activity in the database. You can deactivate the user and re-enable them again at any time.";
    const messageForInactiveNonDeletableUser =
      "The selected user cannot be deleted because currently there are some traces of activity in the database.";

    const messageForActiveDeletableUser =
      "Do you really want to delete this user? This cannot be undone. You can deactivate the user and re-enable them again at any time.";

    const messageForInactiveDeletableUser = "Do you really want to delete this user? This cannot be undone.";

    verifyRowContains("Active", 1); // controller
    verifyRowWithTextCheckState("controller", false);

    // try to delete controller from user table
    getElementByDataCy("delete-user-controller").click();
    handlePrompt(messageForActiveNonDeletableUser, "Cancel");

    // go to detail view and try to delete
    clickOnRowWithText("controller");
    getElementByDataCy("deleteuser-button").click();
    handlePrompt(messageForActiveNonDeletableUser, "Cancel");

    // verify editing is enabled on active user
    getElementByDataCy("is-user-admin-checkbox").children().first().should("not.have.attr", "disabled");

    // inactivate controller
    getElementByDataCy("inactivate-user-button").click();
    cy.wait("@update-user");
    getElementByDataCy("is-user-admin-checkbox").children().first().should("have.attr", "disabled");

    getElementByDataCy("deleteuser-button").click();
    handlePrompt(messageForInactiveNonDeletableUser, "Cancel");

    // go to users table
    getElementByDataCy("backButton").click();
    verifyRowContains("Inactive", 1); // controller
    getElementByDataCy("delete-user-controller").click();
    handlePrompt(messageForInactiveNonDeletableUser, "Cancel");

    // go to user detail and reactive controller
    clickOnRowWithText("controller");
    cy.wait("@get-user");
    getElementByDataCy("activate-user-button").click();

    // go back to user table and check prompts for deletable user
    getElementByDataCy("backButton").click();
    verifyRowContains("Active", 4); // user that can be deleted
    getElementByDataCy("delete-user-user_that_can").click();
    handlePrompt(messageForActiveDeletableUser, "Cancel");
    clickOnRowWithText("user_that_can");
    cy.wait("@get-user");
    getElementByDataCy("deleteuser-button").click();
    handlePrompt(messageForActiveDeletableUser, "Cancel");
    getElementByDataCy("inactivate-user-button").click();
    cy.wait("@update-user");
    getElementByDataCy("deleteuser-button").click();
    handlePrompt(messageForInactiveDeletableUser, "Cancel");
    getElementByDataCy("activate-user-button").click();
    cy.wait("@update-user");

    // got back to user table and check if user with only files can be deleted
    getElementByDataCy("backButton").click();
    verifyRowContains("Active", 5); // with only files
    getElementByDataCy("delete-user-user_that_only").click();
    handlePrompt(messageForActiveNonDeletableUser, "Cancel");
  });

  it("adds and deletes workgroups and workgroup roles for user.", () => {
    goToRouteAndAcceptTerms("/setting/user/7");
    waitForTableData();

    // Add two workgroup roles to workgroup Reggae
    getElementByDataCy("addworkgroup-button").click();
    setSelect("workgroup", 1); // Workgroup called "Reggae";
    setSelect("role", 1); // "Editor";
    getElementByDataCy("addworkgrouprole-button").click();

    getElementByDataCy("addworkgroup-button").click();
    setSelect("workgroup", 1); // Workgroup called "Reggae";
    setSelect("role", 2); // "Controller";
    getElementByDataCy("addworkgrouprole-button").click();

    // Add one workgroup roles to workgroup Country
    getElementByDataCy("addworkgroup-button").click();
    setSelect("workgroup", 4); // Workgroup called "Country";
    setSelect("role", 0); // "View";
    getElementByDataCy("addworkgrouprole-button").click();

    verifyRowContains("Default", 0);
    verifyRowContains("Reggae", 1);
    verifyRowContains("Country", 2);

    verifyPaginationText("1–3 of 3");
    verifyTableLength(3);

    // sort
    sortBy("Workgroup");
    verifyRowContains("Country", 0);
    verifyRowContains("Default", 1);
    verifyRowContains("Reggae", 2);

    // delete all workgroup roles for Reggae Workgroup
    getElementByDataCy("delete-id-2").click();
    handlePrompt('Do you want to remove all roles of the user "u. be_deleted" in the workgroup "Reggae"?', "Delete");
    verifyTableLength(2);
    verifyRowContains("Country", 0);

    // cancel delete all workgroup roles for Country Workgroup
    getElementByDataCy("delete-id-5").click();
    handlePrompt('Do you want to remove all roles of the user "u. be_deleted" in the workgroup "Country"?', "Cancel");
    verifyTableLength(2);
    verifyRowContains("Country", 0);

    getElementByDataCy("delete-id-5").click();
    handlePrompt('Do you want to remove all roles of the user "u. be_deleted" in the workgroup "Country"?', "Delete");
    verifyTableLength(1);
  });

  const errorWhileFetchingMessage = "An error occurred while fetching or updating data";

  it("displays error message when fetching user table data fails.", () => {
    cy.intercept("GET", "api/v2/user*", req => req.destroy());
    goToRouteAndAcceptTerms("/setting#users");
    cy.get(".MuiAlert-message").contains(errorWhileFetchingMessage);
  });

  it("displays error message when fetching user detail data fails.", () => {
    cy.intercept("GET", "api/v2/user/2", req => req.destroy());
    goToRouteAndAcceptTerms("/setting/user/2");
    cy.get(".MuiAlert-message").contains(errorWhileFetchingMessage);
  });

  it("displays error message when updating user fails.", () => {
    cy.intercept("PUT", "api/v2/user", req => req.destroy());
    goToRouteAndAcceptTerms("/setting/user/2");
    getElementByDataCy("inactivate-user-button").click();
    cy.get(".MuiAlert-message").contains(errorWhileFetchingMessage);
    cy.get('[aria-label="Close"]').click(); // close alert

    // user should still be displayed as active
    getElementByDataCy("activate-user-button").should("have.class", "Mui-selected");
    getElementByDataCy("inactivate-user-button").should("not.have.class", "Mui-selected");

    getElementByDataCy("is-user-admin-checkbox").click();
    cy.get(".MuiAlert-message").contains(errorWhileFetchingMessage);

    // user should not be displayed as admin
    getElementByDataCy("is-user-admin-checkbox").should("not.be.checked");
  });

  it("displays error message when deleting user fails.", () => {
    cy.intercept("DELETE", "api/v2/user/7", req => req.destroy());
    goToRouteAndAcceptTerms("/setting/user/7"); // deletable user
    getElementByDataCy("deleteuser-button").click();
    getElementByDataCy("delete-button").click();
    cy.get(".MuiAlert-message").contains(errorWhileFetchingMessage);
    cy.get('[aria-label="Close"]').click(); // close alert

    // verify user detail page still visible
    cy.location().should(location => {
      expect(location.pathname).to.eq("/setting/user/7");
    });
    cy.contains("U. be_deleted");
  });
});
