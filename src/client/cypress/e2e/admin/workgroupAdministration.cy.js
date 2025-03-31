import {
  clickOnRowWithText,
  sortBy,
  verifyPaginationText,
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

    verifyPaginationText("1–6 of 6");
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
    handlePrompt(inactiveWorkgroupDeletePrompt, "Cancel");

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
    handlePrompt(activeWorkgroupDeletePrompt, "Cancel");

    // Go to detail and click on delete again
    clickOnRowWithText("World");
    getElementByDataCy("deleteworkgroup-button").click();
    handlePrompt(activeWorkgroupDeletePrompt, "Cancel");
    getElementByDataCy("inactivate-button").click();
    cy.wait("@update-workgroup");
    getElementByDataCy("deleteworkgroup-button").click();
    handlePrompt(inactiveWorkgroupDeletePrompt, "Cancel");
  });

  it("can add a new workgroup.", () => {
    goToRouteAndAcceptTerms("//setting#workgroups");
    getElementByDataCy("addworkgroup-button").click();
    setInput("workgroup", "Coconut");
    getElementByDataCy("add-button").click();

    cy.get(".MuiAlert-message").contains('Workgroup "Coconut" was added');
    cy.get('[aria-label="Close"]').click(); // close alert
    verifyTableLength(7);
    verifyRowWithContentAlsoContains("Coconut", "Active");
    clickOnRowWithText("Coconut");
    getElementByDataCy("deleteworkgroup-button").click();
    getElementByDataCy("delete-button").click();
  });

  it("adds and deletes users from workgroup.", () => {
    goToRouteAndAcceptTerms("/setting/workgroup/6"); // Blues
    getElementByDataCy("activate-button").click();

    // Add  two users to workgroup
    getElementByDataCy("adduser-button").click();
    setSelect("user", 2); // "editor user";
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

    verifyPaginationText("1–2 of 2");
    verifyTableLength(2);

    sortBy("First name");
    verifyRowContains("editor", 0);
    verifyRowContains("publisher", 1);
    sortBy("First name");
    verifyRowContains("publisher", 0);
    verifyRowContains("editor", 1);

    // delete all roles for publisher
    getElementByDataCy("delete-id-5").click();
    handlePrompt('Do you want to remove all roles of the user "p. user" in the workgroup "Blues"?', "Delete");
    verifyTableLength(1);
    verifyRowContains("editor", 0);

    // cancel delete all roles for editor
    getElementByDataCy("delete-id-2").click();
    handlePrompt('Do you want to remove all roles of the user "e. user" in the workgroup "Blues"?', "Cancel");
    verifyTableLength(1);
    verifyRowContains("editor", 0);

    getElementByDataCy("delete-id-2").click();
    handlePrompt('Do you want to remove all roles of the user "e. user" in the workgroup "Blues"?', "Delete");
    verifyTableLength(0);
  });

  const errorWhileFetchingMessage = "An error occurred while fetching or updating data";

  it("displays error message when fetching workgroup table data fails.", () => {
    cy.intercept("GET", "api/v2/workgroup*", req => req.destroy());
    goToRouteAndAcceptTerms("/setting#workgroups");
    cy.get(".MuiAlert-message").contains(errorWhileFetchingMessage);
  });

  it("displays error message when fetching workgroup detail data fails.", () => {
    cy.intercept("GET", "api/v2/workgroup/2", req => req.destroy());
    goToRouteAndAcceptTerms("/setting/workgroup/2");
    cy.get(".MuiAlert-message").contains(errorWhileFetchingMessage);
  });

  it("displays error message when updating workgroup fails.", () => {
    cy.intercept("PUT", "api/v2/workgroup", req => req.destroy());
    goToRouteAndAcceptTerms("/setting/workgroup/2");
    getElementByDataCy("activate-button").click();
    cy.get(".MuiAlert-message").contains(errorWhileFetchingMessage);
    cy.get('[aria-label="Close"]').click(); // close alert

    // workgroup should still be displayed as inactive
    getElementByDataCy("inactivate-button").should("have.class", "Mui-selected");
    getElementByDataCy("activate-button").should("not.have.class", "Mui-selected");
  });

  it("displays error message when deleting workgroup fails.", () => {
    cy.intercept("DELETE", "api/v2/workgroup/2", req => req.destroy());
    goToRouteAndAcceptTerms("/setting/workgroup/2"); // workgroup "Reggae"
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
