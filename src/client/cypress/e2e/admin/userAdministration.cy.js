import { interceptApiCalls } from "../testHelpers";

describe("Instrumentation tests", () => {
  it("displays correct message when enabling user.", () => {
    interceptApiCalls();

    // login
    cy.visit("/setting/admin");
    cy.contains("button", "Login").click();
    cy.wait("@geoapi");

    cy.get('[data-cy="user-list-table-body"]')
      .children()
      .should("have.length", 5);

    // add user
    cy.get('[placeholder="Username"]').type("Testuser");
    cy.get('[placeholder="Password"]').type("123456");
    cy.get('[placeholder="Firstname"]').type("Cinnabuns");
    cy.get('[placeholder="Surname"]').type("Moonshine");
    cy.get('[data-cy="add-user-button"]').click();

    cy.get('[data-cy="user-list-table-body"]')
      .children()
      .should("have.length", 6);

    // disable user
    let newUserRow = cy
      .get('[data-cy="user-list-table-body"]')
      .children()
      .first();
    cy.contains("Testuser");
    cy.contains("Cinnabuns");
    cy.contains("Moonshine");
    newUserRow.contains("td", "Disable").click();

    cy.get('.modal [data-cy="disable-user-button"]').click();

    cy.get('[data-cy="user-list-table-body"]')
      .children()
      .should("have.length", 5);

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
      .should("have.length", 6);

    // permanently delete test user
    newUserRow = cy.get('[data-cy="user-list-table-body"]').children().first();
    newUserRow.contains("td", "Disable").click();

    cy.get('.modal [data-cy="permanently-delete-user-button"]').click();
  });
});
