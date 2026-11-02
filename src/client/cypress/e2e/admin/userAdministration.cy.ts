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
} from "../helpers/dataGridHelpers";
import { checkSelectOptions, closeDropdown, openDropdown, setSelect } from "../helpers/formHelpers";
import { goToRouteAndAcceptTerms, handlePrompt } from "../helpers/testHelpers";

describe("User administration settings tests", () => {
  it("displays, sorts and filters user table and shows user detail.", () => {
    goToRouteAndAcceptTerms("/setting#users");
    waitForTableData();
    cy.wait("@get-user");
    verifyRowWithContentAlsoContains("Admin", "Active");
    verifyRowWithContentAlsoContains("Admin", "admin.user@local.dev");
    hasPagination(false);
    verifyTableLength(7);

    // sort
    sortBy("First name");
    sortBy("First name"); // clicking twice to sort descending
    verifyRowContains("user_that_only", 0);
    verifyRowContains("Active", 0);

    // navigate away and check if sorting is still applied
    cy.dataCy("workgroups-tab").click();
    cy.contains("Blues");
    cy.dataCy("users-tab").click();
    verifyRowContains("user_that_only", 0);

    // filter with quick filter
    cy.get(".MuiDataGrid-toolbarQuickFilter input").click();
    cy.focused().clear();
    cy.get(".MuiDataGrid-toolbarQuickFilter input").type("editor", {
      delay: 10,
    });

    verifyTableLength(1);
    verifyRowContains("editor", 0);
    verifyRowContains("editor.user@local.dev", 0);
    verifyRowContains("Active", 0);

    // Click on Editor
    cy.dataCy("settings-header").should("contain", "Settings");
    clickOnRowWithText("editor");
    cy.dataCy("settings-header").should("contain", "E. User");

    // Admin checkbox should not be checked
    cy.get('[data-cy="is-user-admin-checkbox"] input').should("not.be.checked");

    // Workgroup table should contain 1 entry
    verifyTableLength(1);
    verifyRowContains("Default", 0); // Workgroup
    // Editor user should have role editor
    cy.dataCy("Editor-role-select").should("be.visible");

    cy.dataCy("backButton").click();
    waitForTableData();

    // Click on Admin
    clickOnRowWithText("Admin");
    cy.dataCy("settings-header").should("contain", "A. User");
    // Admin checkbox should be checked
    cy.get('[data-cy="is-user-admin-checkbox"] input').should("be.checked");
    verifyTableLength(1);
    verifyRowContains("Default", 0); // Workgroup

    // Admin user should have role publisher only
    cy.dataCy("Publisher-role-select").should("be.visible");
    cy.dataCy("Reader-role-select").should("not.exist");
    cy.dataCy("Editor-role-select").should("not.exist");

    cy.dataCy("backButton").click();
    waitForTableData();
    verifyRowWithTextCheckState("Admin", true, "isAdmin");
    verifyRowWithTextCheckState("editor", false, "isAdmin");

    // Make editor admin from user table
    checkRowWithText("editor", "isAdmin");
    verifyRowWithTextCheckState("editor", true, "isAdmin");

    // Go to user detail
    clickOnRowWithText("editor");
    cy.get('[data-cy="is-user-admin-checkbox"] input').should("be.checked");

    // Uncheck is admin from user detail
    cy.get('[data-cy="is-user-admin-checkbox"] input').click();
    cy.get('[data-cy="is-user-admin-checkbox"] input').should("not.be.checked");
    cy.dataCy("backButton").click();
    waitForTableData();
    verifyRowWithTextCheckState("editor", false, "isAdmin");
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

    verifyRowWithContentAlsoContains("reviewer", "Active");
    verifyRowWithTextCheckState("reviewer", false, "isAdmin");

    // try to delete reviewer from user table
    cy.dataCy("delete-id-3").click();
    handlePrompt(messageForActiveNonDeletableUser, "cancel");

    // go to detail view and try to delete
    clickOnRowWithText("reviewer");
    cy.contains("R. user");
    cy.dataCy("deleteuser-button").click();
    handlePrompt(messageForActiveNonDeletableUser, "cancel");

    // verify editing is enabled on active user
    cy.dataCy("is-user-admin-checkbox").children().first().should("not.have.attr", "disabled");

    // inactivate reviewer
    cy.dataCy("inactivate-button").click();
    cy.wait("@update-user");
    cy.dataCy("is-user-admin-checkbox").children().first().should("have.attr", "disabled");

    cy.dataCy("deleteuser-button").click();
    handlePrompt(messageForInactiveNonDeletableUser, "cancel");

    // go to users table
    cy.dataCy("backButton").click();
    waitForTableData();
    verifyRowWithContentAlsoContains("reviewer", "Inactive");
    cy.dataCy("delete-id-3").click(); // reviewer
    handlePrompt(messageForInactiveNonDeletableUser, "cancel");

    // go to user detail and reactive reviewer
    clickOnRowWithText("reviewer");
    cy.wait("@get-user");
    cy.dataCy("activate-button").click();

    // go back to user table and check prompts for deletable user
    cy.dataCy("backButton").click();
    waitForTableData();
    verifyRowContains("Active", 4); // user that can be deleted
    cy.dataCy("delete-id-7").click(); // user that can be deleted
    handlePrompt(messageForActiveDeletableUser, "cancel");
    clickOnRowWithText("user_that_can");
    cy.wait("@get-user");
    cy.contains("U. be_deleted");
    cy.dataCy("deleteuser-button").click();
    handlePrompt(messageForActiveDeletableUser, "cancel");
    cy.dataCy("inactivate-button").click();
    cy.wait("@update-user");
    cy.dataCy("deleteuser-button").click();
    handlePrompt(messageForInactiveDeletableUser, "cancel");
    cy.dataCy("activate-button").click();
    cy.wait("@update-user");

    // got back to user table and check if user with only files can be deleted
    cy.dataCy("backButton").click();
    waitForTableData();
    verifyRowContains("Active", 5); // user with only files
    cy.dataCy("delete-id-6").click(); // user with only files
    handlePrompt(messageForActiveNonDeletableUser, "cancel");
  });

  it("adds and deletes workgroups and workgroup roles for user.", () => {
    goToRouteAndAcceptTerms("/setting/user/7");
    waitForTableData();

    // Only active workgroups in which the user has no role are offered
    cy.dataCy("addworkgroup-button").click();
    openDropdown('[data-cy="workgroup-formSelect"]');
    cy.get('.MuiPaper-elevation [role="listbox"]')
      .should("contain", "Stage And Screen")
      .and("not.contain", "Default")
      .and("not.contain", "Reggae")
      .and("not.contain", "Country");
    closeDropdown();

    // Add a role to workgroup Stage And Screen, then change it in the table
    checkSelectOptions("workgroup", ["Stage And Screen"]);
    setSelect("role", 1); // "Editor";
    cy.dataCy("add-button").click();
    cy.wait("@set_workgroup_roles");

    cy.contains(".MuiDataGrid-row", "Stage And Screen")
      .find('[data-cy="Editor-role-select"] [role="combobox"]')
      .click();
    cy.get('.MuiPaper-elevation [role="listbox"]').contains("li", "Reviewer").click();
    cy.wait("@set_workgroup_roles");

    verifyRowContains("Default", 0);
    verifyRowContains("Stage And Screen", 1);
    verifyRowWithContentAlsoContains("Stage And Screen", "Reviewer");
    cy.dataCy("Editor-role-select").should("not.exist");

    hasPagination(false);
    verifyTableLength(2);

    // sort
    sortBy("Workgroup");
    verifyRowContains("Stage And Screen", 0);
    verifyRowContains("Default", 1);

    // cancel delete the workgroup role for Stage And Screen Workgroup
    cy.dataCy("delete-id-4").click();
    handlePrompt(
      'Do you want to remove the role of the user "u. be_deleted" in the workgroup "Stage And Screen"?',
      "cancel",
    );
    verifyTableLength(2);

    // delete the workgroup role for Stage And Screen Workgroup
    cy.dataCy("delete-id-4").click();
    handlePrompt(
      'Do you want to remove the role of the user "u. be_deleted" in the workgroup "Stage And Screen"?',
      "delete",
    );
    verifyRowContains("Default", 0);
    verifyTableLength(1);
  });

  const errorBoundaryMessage = "Something went wrong while accessing the settings page on Swissgeol Boreholes";
  const errorWhileFetchingMessage = "Unexpected error. The action you triggered was not successful.";

  it("displays error boundary when fetching user table data fails.", () => {
    cy.intercept("GET", "api/v2/user*", req => req.destroy());
    goToRouteAndAcceptTerms("/setting#users");
    cy.contains(errorBoundaryMessage);
  });

  it("displays error boundary when fetching user detail data fails.", () => {
    cy.intercept("GET", "api/v2/user/2", req => req.destroy());
    goToRouteAndAcceptTerms("/setting/user/2");
    cy.contains(errorBoundaryMessage);
  });

  it("displays error alert when updating user fails.", () => {
    cy.intercept("PUT", "api/v2/user", req => req.destroy());
    goToRouteAndAcceptTerms("/setting/user/2");
    cy.dataCy("inactivate-button").click();
    cy.get(".MuiAlert-message").contains(errorWhileFetchingMessage);
    cy.get('[aria-label="Close"]').click(); // close alert

    // user should still be displayed as active
    cy.dataCy("activate-button").should("have.class", "Mui-selected");
    cy.dataCy("inactivate-button").should("not.have.class", "Mui-selected");

    cy.dataCy("is-user-admin-checkbox").click();
    cy.get(".MuiAlert-message").contains(errorWhileFetchingMessage);

    // user should not be displayed as admin
    cy.dataCy("is-user-admin-checkbox").should("not.be.checked");
  });

  it("displays error alert when deleting user fails.", () => {
    cy.intercept("DELETE", "api/v2/user/7", req => req.destroy());
    goToRouteAndAcceptTerms("/setting/user/7"); // deletable user
    cy.contains("U. be_deleted");
    cy.dataCy("deleteuser-button").click();
    cy.dataCy("delete-button").click();
    cy.get(".MuiAlert-message").contains(errorWhileFetchingMessage);
    cy.get('[aria-label="Close"]').click(); // close alert

    cy.location().should(location => {
      expect(location.pathname).to.eq("/setting");
      expect(location.hash).to.eq("#users");
    });
  });
});
