import {
  clickOnRowWithText,
  hasPagination,
  sortBy,
  verifyRowContains,
  verifyRowWithContentAlsoContains,
  verifyTableLength,
  waitForTableData,
} from "../helpers/dataGridHelpers.js";
import { evaluateInput, setInput, setSelect } from "../helpers/formHelpers.js";
import { getElementByDataCy, goToRouteAndAcceptTerms, handlePrompt } from "../helpers/testHelpers.js";

describe("User administration settings tests", () => {
  it("displays, sorts and filters workgroup table.", () => {
    goToRouteAndAcceptTerms("/setting#workgroups");
    waitForTableData();
    verifyRowContains("Default", 2);
    verifyRowContains("3000", 2);
    verifyRowContains("Active", 2);
    verifyRowContains("View (2)", 2);
    verifyRowContains("Editor (2)", 2);
    verifyRowContains("Controller (2)", 2);
    verifyRowContains("Validator (2)", 2);
    verifyRowContains("Publisher (4)", 2);
    verifyRowContains("Reggae", 3);
    verifyRowContains("Inactive", 3);

    hasPagination(false);
    verifyTableLength(6);

    // sort by workgroup name descending
    verifyRowContains("Blues", 0);
    sortBy("Workgroup");

    verifyRowContains("World", 0);
    verifyRowContains("Stage And Screen", 1);
    verifyRowContains("Reggae", 2);
    verifyRowContains("Default", 3);

    // navigate away and check if sorting is still applied
    getElementByDataCy("users-tab").click();
    cy.contains("user_that_can");
    getElementByDataCy("workgroups-tab").click();
    verifyRowContains("World", 0);
    verifyRowContains("Stage And Screen", 1);
    verifyRowContains("Reggae", 2);
    verifyRowContains("Default", 3);

    // filter with quick filter
    cy.get(".MuiDataGrid-toolbarQuickFilter input").click();
    cy.focused().clear();
    cy.get(".MuiDataGrid-toolbarQuickFilter input").type("inactive", {
      delay: 10,
    });

    verifyTableLength(4);
    verifyRowContains("World", 0);
    verifyRowContains("Reggae", 1);
    verifyRowContains("Country", 2);
    verifyRowContains("Blues", 3);
  });

  it("shows workgroup detail inactivates and activates workgroup", () => {
    goToRouteAndAcceptTerms("/setting#users");
    waitForTableData();

    // add "publisher" to workgroup "World"
    clickOnRowWithText("publisher");
    getElementByDataCy("addworkgroup-button").click();
    setSelect("workgroup", 2); // Workgroup called "World";
    setSelect("role", 4); // "Publisher";
    getElementByDataCy("add-button").click();
    cy.wait("@set_workgroup_roles");
    getElementByDataCy("backButton").click();
    getElementByDataCy("workgroups-tab").click();

    const activeWorkgroupDeletePrompt =
      "Do you really want to delete this workgroup? This cannot be undone. You can deactivate the workgroup and re-enable it again at any time.";
    const inactiveWorkgroupDeletePrompt = "Do you really want to delete this workgroup? This cannot be undone.";

    getElementByDataCy("settings-header").should("contain", "Settings");
    verifyRowWithContentAlsoContains("World", "Inactive");

    // Click on workgroup delete button
    getElementByDataCy("delete-id-3").click();
    handlePrompt(inactiveWorkgroupDeletePrompt, "cancel");

    // Navigate to workgroup detail
    clickOnRowWithText("World");
    getElementByDataCy("settings-header").should("contain", "World");
    evaluateInput("workgroup", "World");

    // User table should contain 1 entry
    verifyTableLength(1);
    verifyRowContains("publisher", 0);
    verifyRowContains("example@example.com", 0);
    verifyRowContains("Active", 0);

    // Admin user should have role editor in workgroup World
    getElementByDataCy("Publisher-chip").should("be.visible");
    cy.contains("World");

    // Set workgroup World active
    getElementByDataCy("workgroup-detail").should("have.css", "opacity", "0.5");
    getElementByDataCy("activate-button").click();
    cy.wait("@update-workgroup");
    getElementByDataCy("workgroup-detail").should("have.css", "opacity", "1");

    getElementByDataCy("backButton").click();
    waitForTableData();

    verifyRowWithContentAlsoContains("World", "Active");

    // Click on workgroup delete button
    getElementByDataCy("delete-id-3").click();
    handlePrompt(activeWorkgroupDeletePrompt, "cancel");

    // Go to detail and click on delete again
    clickOnRowWithText("World");
    getElementByDataCy("deleteworkgroup-button").click();
    handlePrompt(activeWorkgroupDeletePrompt, "cancel");
    getElementByDataCy("inactivate-button").click();
    cy.wait("@update-workgroup");
    getElementByDataCy("deleteworkgroup-button").click();
    handlePrompt(inactiveWorkgroupDeletePrompt, "cancel");
  });

  it("can add and edit a new workgroup.", () => {
    goToRouteAndAcceptTerms("//setting#workgroups");
    getElementByDataCy("addworkgroup-button").click();
    setInput("workgroup", "Coconut");
    getElementByDataCy("add-button").click();

    cy.get(".MuiAlert-message").contains('Workgroup "Coconut" was added');
    cy.get('[aria-label="Close"]').click(); // close alert
    verifyTableLength(7);
    verifyRowWithContentAlsoContains("Coconut", "Active");
    clickOnRowWithText("Coconut");
    cy.contains("Coconut");

    setInput("workgroup", "Coconut Updated");
    getElementByDataCy("settings-header").contains("Coconut Updated");

    getElementByDataCy("deleteworkgroup-button").click();
    getElementByDataCy("delete-button").click();
  });

  it("adds and deletes users from workgroup.", () => {
    goToRouteAndAcceptTerms("/setting/workgroup/6"); // Blues
    getElementByDataCy("activate-button").click();

    // Add  two users to workgroup
    getElementByDataCy("adduser-button").click();
    setSelect("user", 1); // "editor user";
    setSelect("role", 0); // "Viewer";
    getElementByDataCy("add-button").click();

    getElementByDataCy("adduser-button").click();
    setSelect("user", 3); //  "publisher user";
    setSelect("role", 2); // "Controller";
    getElementByDataCy("add-button").click();

    // Add one another role to user publisher
    getElementByDataCy("adduser-button").click();
    setSelect("user", 3); // "publisher user";
    setSelect("role", 0); // "View";
    getElementByDataCy("add-button").click();

    verifyRowWithContentAlsoContains("editor", "VIEW");
    verifyRowWithContentAlsoContains("publisher", "CONTROLLER");
    verifyRowWithContentAlsoContains("publisher", "VIEW");

    hasPagination(false);
    verifyTableLength(2);

    sortBy("First name");
    verifyRowContains("editor", 0);
    verifyRowContains("publisher", 1);
    sortBy("First name");
    verifyRowContains("publisher", 0);
    verifyRowContains("editor", 1);

    // delete all roles for publisher
    getElementByDataCy("delete-id-5").click();
    handlePrompt('Do you want to remove all roles of the user "p. user" in the workgroup "Blues"?', "delete");
    verifyTableLength(1);
    verifyRowContains("editor", 0);

    // cancel delete all roles for editor
    getElementByDataCy("delete-id-2").click();
    handlePrompt('Do you want to remove all roles of the user "E. User" in the workgroup "Blues"?', "cancel");
    verifyTableLength(1);
    verifyRowContains("editor", 0);

    getElementByDataCy("delete-id-2").click();
    handlePrompt('Do you want to remove all roles of the user "E. User" in the workgroup "Blues"?', "delete");
    verifyTableLength(0);
  });

  const errorBoundaryMessage = "Something went wrong while accessing the settings page on Swissgeol Boreholes";
  const errorWhileFetchingMessage = "Unexpected error. The action you triggered was not successful.";

  it("displays error boundary when fetching workgroup table data fails.", () => {
    cy.intercept("GET", "api/v2/workgroup*", req => req.destroy());
    goToRouteAndAcceptTerms("/setting#workgroups");
    cy.contains(errorBoundaryMessage);
  });

  it("displays error boundary when fetching workgroup detail data fails.", () => {
    cy.intercept("GET", "api/v2/workgroup/2", req => req.destroy());
    goToRouteAndAcceptTerms("/setting/workgroup/2");
    cy.contains(errorBoundaryMessage);
  });

  it("displays error alert when updating workgroup fails.", () => {
    cy.intercept("PUT", "api/v2/workgroup", req => req.destroy());
    goToRouteAndAcceptTerms("/setting/workgroup/2");
    getElementByDataCy("activate-button").click();
    cy.get(".MuiAlert-message").contains(errorWhileFetchingMessage);
    cy.get('[aria-label="Close"]').click(); // close alert

    // workgroup should still be displayed as inactive
    getElementByDataCy("inactivate-button").should("have.class", "Mui-selected");
    getElementByDataCy("activate-button").should("not.have.class", "Mui-selected");
  });

  it("displays error alert when deleting workgroup fails.", () => {
    cy.intercept("DELETE", "api/v2/workgroup/2", req => req.destroy());
    goToRouteAndAcceptTerms("/setting/workgroup/2"); // workgroup "Reggae"
    cy.contains("Reggae");
    getElementByDataCy("deleteworkgroup-button").click();
    getElementByDataCy("delete-button").click();
    cy.get(".MuiAlert-message").contains(errorWhileFetchingMessage);
    cy.get('[aria-label="Close"]').click(); // close alert

    cy.location().should(location => {
      expect(location.pathname).to.eq("/setting");
      expect(location.hash).to.eq("#workgroups");
    });
    cy.contains("Reggae");
  });
});
