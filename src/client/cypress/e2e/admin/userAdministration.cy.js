import { goToRouteAndAcceptTerms } from "../helpers/testHelpers";

describe("Admin settings test", () => {
  beforeEach(() => {
    goToRouteAndAcceptTerms("/setting#workgroups");
    cy.get('[data-cy="user-list-table-body"]').children().should("have.length", 8);
  });

  it("displays correct message when enabling user.", () => {
    // disable user
    let userToEdit = cy.get('[data-cy="user-list-table-body"]').children().contains("tr", "p. user");
    userToEdit.contains("td", "Disable").click();

    cy.get('.modal [data-cy="disable-user-button"]').click();

    cy.get('[data-cy="user-list-table-body"]').children().should("have.length", 7);

    // show disabled users
    cy.contains("Show Disabled").click();

    cy.get('[data-cy="user-list-table-body"]').children().should("have.length", 1);

    // enable user
    userToEdit = cy.get('[data-cy="user-list-table-body"]').children().first();
    userToEdit.contains("td", "Enable").click();

    cy.get(".modal p").should(
      "contain",
      'You are going to re-enable the user "p. user". This user will be able to login and apply modifications based on its roles.',
    );

    cy.get('.modal [data-cy="enable-user-button"]').click();

    // show all users
    cy.contains("Show All").click();

    cy.get('[data-cy="user-list-table-body"]').children().should("have.length", 8);
  });

  it("can toggle administrator privileges.", () => {
    // Verify initial state
    cy.get('[data-cy="administration-username-label"]').contains("N/A");
    cy.get('[data-cy="administration-firstname-label"]').contains("N/A");
    cy.get('[data-cy="administration-lastname-label"]').contains("N/A");
    cy.get('[data-cy="administration-save-user-button"]').should("be.disabled");
    cy.get('[data-cy="administration-admin-checkbox"]').should("not.be.checked", "be.disabled");

    // Select and verify user to edit
    let userToEdit = cy.get('[data-cy="user-list-table-body"]').children().contains("tr", "p. user");
    userToEdit.contains("td", "No").click();

    cy.get('[data-cy="administration-username-label"]').contains("p. user");
    cy.get('[data-cy="administration-firstname-label"]').contains("publisher");
    cy.get('[data-cy="administration-lastname-label"]').contains("user");
    cy.get('[data-cy="administration-save-user-button"]').should("be.enabled");
    cy.get('[data-cy="administration-admin-checkbox"]').should("not.be.checked", "be.endabled");

    // edit and save changes
    cy.get('[data-cy="administration-admin-checkbox"]').click();
    cy.get('[data-cy="administration-save-user-button"]').click();

    // Verify changes
    userToEdit.contains("td", "Yes");

    // Revert changes
    cy.get('[data-cy="administration-admin-checkbox"]').click();
    cy.get('[data-cy="administration-save-user-button"]').click();

    cy.get('[data-cy="administration-username-label"]').contains("p. user");
    cy.get('[data-cy="administration-firstname-label"]').contains("publisher");
    cy.get('[data-cy="administration-lastname-label"]').contains("user");
    cy.get('[data-cy="administration-save-user-button"]').should("be.enabled");
    cy.get('[data-cy="administration-admin-checkbox"]').should("not.be.checked", "be.endabled");
  });

  it("cannot delete users with associated files.", () => {
    // Try to delete user that only has associated files
    let filesUser = cy.get('[data-cy="user-list-table-body"]').children().contains("tr", "has_files");

    cy.contains("user_that_only");
    cy.contains("has_files");
    filesUser.contains("td", "Disable").click();

    // Deletion should not be possible
    cy.get(".modal").should("not.contain", '[data-cy="permanently-delete-user-button"]');

    cy.get('.modal [data-cy="disable-user-button"]').should("be.visible");
  });

  it("can delete users with no associated database entries.", () => {
    // Try to delete user
    let deletableUser = cy.get('[data-cy="user-list-table-body"]').children().contains("tr", "be_deleted");

    cy.contains("user_that_can");
    cy.contains("be_deleted");
    deletableUser.contains("td", "Disable").click();

    // Deletion should be possible
    cy.get('.modal [data-cy="permanently-delete-user-button"]').should("be.visible");

    cy.get(".modal").should("not.contain", '[data-cy="disable-user-button"]');
  });

  it("can add and remove roles for users in workgroups.", () => {
    // Select validator user
    cy.get('[data-cy="user-list-table-body"]').children().contains("td", "validator").click();

    // Workgroup "Default" should be visible with user role "VALIDATOR"
    cy.get('[data-cy="workgroup-list-table-body"]')
      .children()
      .should("have.length", 2)
      .contains("td", "Default")
      .siblings()
      .contains("label", "VALIDATOR")
      .parent()
      .within(() => {
        cy.get("input").should("be.checked");
      });

    cy.get('[data-cy="workgroup-list-table-body"]')
      .children()
      .contains("td", "Default")
      .siblings()
      .contains("label", "EDITOR")
      .parent()
      .within(() => {
        cy.get("input").should("not.be.checked");
      });

    const addRole = role => {
      cy.get('[data-cy="workgroup-list-table-body"]')
        .children()
        .contains("td", "Default")
        .siblings()
        .contains("label", role)
        .parent()
        .within(() => {
          cy.get("input").check({ force: true });
        });
    };

    const removeRole = role => {
      cy.get('[data-cy="workgroup-list-table-body"]')
        .children()
        .contains("td", "Default")
        .siblings()
        .contains("label", role)
        .parent()
        .within(() => {
          cy.get("input").uncheck({ force: true });
        });
    };

    // Remove role VALIDATOR and add role EDITOR
    removeRole("VALIDATOR");
    addRole("EDITOR");

    // Change user selection to be sure that the workgroup table
    // is reloaded and assert role assignments
    cy.get('[data-cy="user-list-table-body"]').children().contains("td", "Admin").click();

    cy.get('[data-cy="user-list-table-body"]').children().contains("td", "validator").click();

    cy.get('[data-cy="workgroup-list-table-body"]')
      .children()
      .contains("td", "Default")
      .siblings()
      .contains("label", "VALIDATOR")
      .parent()
      .within(() => {
        cy.get("input").should("not.be.checked");
      });

    cy.get('[data-cy="workgroup-list-table-body"]')
      .children()
      .contains("td", "Default")
      .siblings()
      .contains("label", "EDITOR")
      .parent()
      .within(() => {
        cy.get("input").should("be.checked");
      });

    // Revert role assignment
    removeRole("EDITOR");
    addRole("VALIDATOR");
  });
});
