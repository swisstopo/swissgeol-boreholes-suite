import {
  interceptApiCalls,
  login,
  loginAsAdmin,
  resetBoreholes,
} from "../testHelpers";

describe("Admin settings test", () => {
  beforeEach(() => {
    interceptApiCalls();
    login("/editor");
    resetBoreholes();

    loginAsAdmin("/setting/admin");

    cy.get('[data-cy="user-list-table-body"]')
      .children()
      .should("have.length", 7);
  });

  it("displays correct message when enabling user.", () => {
    // add user
    cy.get('[placeholder="Username"]').type("Testuser");
    cy.get('[placeholder="Password"]').type("123456");
    cy.get('[placeholder="Firstname"]').type("Cinnabuns");
    cy.get('[placeholder="Surname"]').type("Moonshine");
    cy.get('[data-cy="add-user-button"]').click();

    cy.get('[data-cy="user-list-table-body"]')
      .children()
      .should("have.length", 8);

    // disable user
    let newUserRow = cy
      .get('[data-cy="user-list-table-body"]')
      .children()
      .contains("tr", "Testuser");
    cy.contains("Testuser");
    cy.contains("Cinnabuns");
    cy.contains("Moonshine");
    newUserRow.contains("td", "Disable").click();

    cy.get('.modal [data-cy="disable-user-button"]').click();

    cy.get('[data-cy="user-list-table-body"]')
      .children()
      .should("have.length", 7);

    // show disabled users
    cy.contains("show Disabled").click();

    cy.get('[data-cy="user-list-table-body"]')
      .children()
      .should("have.length", 1);

    // enable user
    newUserRow = cy.get('[data-cy="user-list-table-body"]').children().first();
    newUserRow.contains("td", "Enable").click();

    cy.get(".modal p").should(
      "contain",
      'You are going to re-enable the user "Testuser". This user will be able to login and apply modifications based on its roles.',
    );

    cy.get('.modal [data-cy="enable-user-button"]').click();

    // show all users
    cy.contains("show all").click();

    cy.get('[data-cy="user-list-table-body"]')
      .children()
      .should("have.length", 8);

    // permanently delete test user
    newUserRow = cy
      .get('[data-cy="user-list-table-body"]')
      .children()
      .contains("tr", "Testuser");
    newUserRow.contains("td", "Disable").click();

    cy.get('.modal [data-cy="permanently-delete-user-button"]').click();
  });

  it("can add user with admin role.", () => {
    // add admin user
    cy.get('[data-cy="admin-checkbox"]').click();

    cy.get('[placeholder="Username"]').type("Bugby");
    cy.get('[placeholder="Password"]').type("Pea%a-boo3Moanihill");
    cy.get('[placeholder="Firstname"]').type("Doodoohill");
    cy.get('[placeholder="Surname"]').type("Gummoo");
    cy.get('[data-cy="add-user-button"]').click();

    cy.get('[data-cy="user-list-table-body"]')
      .children()
      .should("have.length", 8);

    // contains "Yes" in administrator column
    cy.get('[data-cy="user-list-table-body"]')
      .children()
      .contains("td", "Bugby")
      .siblings()
      .contains("td", "Yes")
      .click();

    // click of "New user" resets admin checkbox
    cy.get('[data-cy="admin-checkbox"]')
      .children()
      .first()
      .should("be.checked");
    cy.contains("New User").click();
    cy.get('[data-cy="admin-checkbox"]')
      .children()
      .first()
      .should("not.be.checked");

    // add non admin user
    cy.get('[placeholder="Username"]').type("Wiggleton");
    cy.get('[placeholder="Password"]').type("Trashbug");
    cy.get('[placeholder="Firstname"]').type("Chewbrain");
    cy.get('[placeholder="Surname"]').type("Pimplehill");
    cy.get('[data-cy="add-user-button"]').click();

    cy.get('[data-cy="user-list-table-body"]')
      .children()
      .should("have.length", 9);

    // contains "No" in administrator column
    const newViewerUserRow = cy
      .get('[data-cy="user-list-table-body"]')
      .children()
      .eq(1);
    newViewerUserRow.contains("td", "No");

    // permanently delete test users
    cy.get('[data-cy="user-list-table-body"]')
      .children()
      .contains("td", "Bugby")
      .siblings()
      .contains("td", "Disable")
      .click();
    cy.get('.modal [data-cy="permanently-delete-user-button"]').click();

    cy.wait(2000);

    cy.get('[data-cy="user-list-table-body"]')
      .children()
      .contains("td", "Wiggleton")
      .siblings()
      .contains("td", "Disable")
      .click();
    cy.get('.modal [data-cy="permanently-delete-user-button"]').click();
  });

  it("cannot delete users with associated files.", () => {
    // Try to delete user that only has associated files
    let filesUser = cy
      .get('[data-cy="user-list-table-body"]')
      .children()
      .contains("tr", "filesUser");

    cy.contains("user_that_only");
    cy.contains("has_files");
    filesUser.contains("td", "Disable").click();

    // Deletion should not be possible
    cy.get(".modal").should(
      "not.contain",
      '[data-cy="permanently-delete-user-button"]',
    );

    cy.get('.modal [data-cy="disable-user-button"]').should("be.visible");
  });

  it("can delete users with no associated database entries.", () => {
    // Try to delete user
    let deletableUser = cy
      .get('[data-cy="user-list-table-body"]')
      .children()
      .contains("tr", "deletableUser");

    cy.contains("user_that_can");
    cy.contains("be_deleted");
    deletableUser.contains("td", "Disable").click();

    // Deletion should be possible
    cy.get('.modal [data-cy="permanently-delete-user-button"]').should(
      "be.visible",
    );

    cy.get(".modal").should("not.contain", '[data-cy="disable-user-button"]');
  });

  it("can add and remove roles for users in workgroups.", () => {
    // Select validator user
    cy.get('[data-cy="user-list-table-body"]')
      .children()
      .contains("td", "validator")
      .click();

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
    cy.get('[data-cy="user-list-table-body"]')
      .children()
      .contains("td", "admin")
      .click();

    cy.get('[data-cy="user-list-table-body"]')
      .children()
      .contains("td", "validator")
      .click();

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
