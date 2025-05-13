import {
  checkRowWithText,
  clickOnRowWithText,
  hasPagination,
  sortBy,
  verifyRowContains,
  verifyRowWithContentAlsoContains,
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
    verifyRowContains("Admin", 7);
    verifyRowContains("admin.user@local.dev", 7);
    verifyRowContains("Active", 7);
    hasPagination(false);
    verifyTableLength(8);

    // sort
    sortBy("First name");
    sortBy("First name"); // clicking twice to sort descending
    verifyRowContains("viewer", 0);
    verifyRowContains("example@example.com", 0);
    verifyRowContains("Active", 0);

    // navigate away and check if sorting is still applied
    getElementByDataCy("workgroups-tab").click();
    getElementByDataCy("users-tab").click();
    verifyRowContains("viewer", 0);

    // filter with quick filter
    cy.get(".MuiDataGrid-toolbarQuickFilter input").click();
    cy.focused().clear();
    cy.get(".MuiDataGrid-toolbarQuickFilter input").type("editor", {
      delay: 10,
    });
    verifyTableLength(8);
    verifyRowContains("editor", 0);
    verifyRowContains("example@example.com", 0);
    verifyRowContains("Active", 0);

    // Click on Editor
    getElementByDataCy("settings-header").should("contain", "Settings");
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
    waitForTableData();

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
    waitForTableData();
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
    waitForTableData();
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
    getElementByDataCy("delete-id-3").click();
    handlePrompt(messageForActiveNonDeletableUser, "cancel");

    // go to detail view and try to delete
    clickOnRowWithText("controller");
    cy.contains("C. user");
    getElementByDataCy("deleteuser-button").click();
    handlePrompt(messageForActiveNonDeletableUser, "cancel");

    // verify editing is enabled on active user
    getElementByDataCy("is-user-admin-checkbox").children().first().should("not.have.attr", "disabled");

    // inactivate controller
    getElementByDataCy("inactivate-button").click();
    cy.wait("@update-user");
    getElementByDataCy("is-user-admin-checkbox").children().first().should("have.attr", "disabled");

    getElementByDataCy("deleteuser-button").click();
    handlePrompt(messageForInactiveNonDeletableUser, "cancel");

    // go to users table
    getElementByDataCy("backButton").click();
    waitForTableData();
    verifyRowWithContentAlsoContains("controller", "Inactive");
    getElementByDataCy("delete-id-3").click(); // controller
    handlePrompt(messageForInactiveNonDeletableUser, "cancel");

    // go to user detail and reactive controller
    clickOnRowWithText("controller");
    cy.wait("@get-user");
    getElementByDataCy("activate-button").click();

    // go back to user table and check prompts for deletable user
    getElementByDataCy("backButton").click();
    waitForTableData();
    verifyRowContains("Active", 4); // user that can be deleted
    getElementByDataCy("delete-id-7").click(); // user that can be deleted
    handlePrompt(messageForActiveDeletableUser, "cancel");
    clickOnRowWithText("user_that_can");
    cy.wait("@get-user");
    cy.contains("U. be_deleted");
    getElementByDataCy("deleteuser-button").click();
    handlePrompt(messageForActiveDeletableUser, "cancel");
    getElementByDataCy("inactivate-button").click();
    cy.wait("@update-user");
    getElementByDataCy("deleteuser-button").click();
    handlePrompt(messageForInactiveDeletableUser, "cancel");
    getElementByDataCy("activate-button").click();
    cy.wait("@update-user");

    // got back to user table and check if user with only files can be deleted
    getElementByDataCy("backButton").click();
    waitForTableData();
    verifyRowContains("Active", 5); // user with only files
    getElementByDataCy("delete-id-6").click(); // user with only files
    handlePrompt(messageForActiveNonDeletableUser, "cancel");
  });

  it("adds and deletes workgroups and workgroup roles for user.", () => {
    goToRouteAndAcceptTerms("/setting/user/7");
    waitForTableData();

    // Add two workgroup roles to workgroup Reggae
    getElementByDataCy("addworkgroup-button").click();
    setSelect("workgroup", 1); // Workgroup called "Reggae";
    setSelect("role", 1); // "Editor";
    getElementByDataCy("add-button").click();

    getElementByDataCy("addworkgroup-button").click();
    setSelect("workgroup", 1); // Workgroup called "Reggae";
    setSelect("role", 2); // "Controller";
    getElementByDataCy("add-button").click();

    // Add one workgroup roles to workgroup Country
    getElementByDataCy("addworkgroup-button").click();
    setSelect("workgroup", 4); // Workgroup called "Country";
    setSelect("role", 0); // "View";
    getElementByDataCy("add-button").click();

    verifyRowContains("Country", 0);
    verifyRowContains("Default", 1);
    verifyRowContains("Reggae", 2);

    hasPagination(false);
    verifyTableLength(3);

    // sort
    sortBy("Workgroup");
    verifyRowContains("Reggae", 0);
    verifyRowContains("Default", 1);
    verifyRowContains("Country", 2);

    // delete all workgroup roles for Reggae Workgroup
    getElementByDataCy("delete-id-2").click();
    handlePrompt('Do you want to remove all roles of the user "u. be_deleted" in the workgroup "Reggae"?', "delete");
    verifyTableLength(2);
    verifyRowContains("Default", 0);
    verifyRowContains("Country", 1);

    // cancel delete all workgroup roles for Country Workgroup
    getElementByDataCy("delete-id-5").click();
    handlePrompt('Do you want to remove all roles of the user "u. be_deleted" in the workgroup "Country"?', "cancel");
    verifyTableLength(2);
    verifyRowContains("Default", 0);
    verifyRowContains("Country", 1);

    getElementByDataCy("delete-id-5").click();
    handlePrompt('Do you want to remove all roles of the user "u. be_deleted" in the workgroup "Country"?', "delete");
    verifyRowContains("Default", 0);
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
    getElementByDataCy("inactivate-button").click();
    cy.get(".MuiAlert-message").contains(errorWhileFetchingMessage);
    cy.get('[aria-label="Close"]').click(); // close alert

    // user should still be displayed as active
    getElementByDataCy("activate-button").should("have.class", "Mui-selected");
    getElementByDataCy("inactivate-button").should("not.have.class", "Mui-selected");

    getElementByDataCy("is-user-admin-checkbox").click();
    cy.get(".MuiAlert-message").contains(errorWhileFetchingMessage);

    // user should not be displayed as admin
    getElementByDataCy("is-user-admin-checkbox").should("not.be.checked");
  });

  it("displays error message when deleting user fails.", () => {
    cy.intercept("DELETE", "api/v2/user/7", req => req.destroy());
    goToRouteAndAcceptTerms("/setting/user/7"); // deletable user
    cy.contains("U. be_deleted");
    getElementByDataCy("deleteuser-button").click();
    getElementByDataCy("delete-button").click();
    cy.get(".MuiAlert-message").contains(errorWhileFetchingMessage);
    cy.get('[aria-label="Close"]').click(); // close alert

    cy.location().should(location => {
      expect(location.pathname).to.eq("/setting");
      expect(location.hash).to.eq("#users");
    });
  });
});
