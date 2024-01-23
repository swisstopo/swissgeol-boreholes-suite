import { createBorehole, loginAsAdmin } from "../helpers/testHelpers";
import adminUser from "../../fixtures/adminUser.json";

describe("Test the borehole bulk edit feature.", () => {
  it("opens the bulk edit dialog with all boreholes selected", () => {
    loginAsAdmin();
    cy.visit("/editor");
    cy.get('[data-cy="borehole-table"] thead .checkbox').click({ force: true });
    cy.contains("button", "Bulk editing").click({ force: true });
    cy.wait("@edit_ids");
  });

  it("checks if all toggle buttons do something", () => {
    loginAsAdmin();
    cy.visit("/editor");
    cy.get('[data-cy="borehole-table"] thead .checkbox').click({ force: true });
    cy.contains("button", "Bulk editing").click({ force: true });

    cy.get(".modal .toggle")
      .should("have.length", 30)
      .each((el, index, list) => {
        cy.wrap(el).click({ force: true });
        cy.get(".modal form .field").should("exist");
        cy.wrap(el).click({ force: true });
        cy.get(".modal form").children().should("not.exist");
      });
  });

  it("displays workgroup toggle only if user has permission for more than one workgroup", () => {
    loginAsAdmin();
    cy.visit("/editor");
    cy.get('[data-cy="borehole-table"] thead .checkbox').click({ force: true });
    cy.contains("button", "Bulk editing").click({ force: true });
    cy.get(".modal .toggle").should("have.length", 30);

    loginAsAdmin("admin");
    const adminUser2Workgroups = Object.assign({}, adminUser);
    adminUser2Workgroups.data.workgroups.push({
      id: 6,
      workgroup: "Blue",
      roles: ["EDIT"],
      disabled: null,
      supplier: false,
    });
    cy.intercept("/api/v1/user", {
      statusCode: 200,
      body: JSON.stringify(adminUser2Workgroups),
    }).as("adminUser2Workgroups");
    cy.visit("/editor");
    cy.get('[data-cy="borehole-table"] thead .checkbox').click({ force: true });
    cy.contains("button", "Bulk editing").click({ force: true });

    cy.get(".modal .toggle").should("have.length", 31);
    // select all bulk edit fields and insert values
    cy.contains("button", "Workgroup").click({ force: true });
    cy.get('[data-cy="workgroup-select"]')
      .should("have.length", 1)
      .each((el, index, list) => {
        cy.wrap(el).scrollIntoView().click();
        cy.get('.modal [role="option"]').eq(0).click({ force: true });
      });
  });

  it("fills all bulkedit fields and saves.", () => {
    // create boreholes
    createBorehole({ "extended.original_name": "NINTIC" }).as("borehole_id_1");
    createBorehole({ "extended.original_name": "LOMONE" }).as("borehole_id_2");

    loginAsAdmin();
    cy.visit("/editor");
    cy.wait("@borehole");

    // select the boreholes for bulk edit
    cy.get('[data-cy="borehole-table"]').within(() => {
      cy.contains("NINTIC").parent().find(".checkbox").click({ force: true });
      cy.contains("LOMONE").parent().find(".checkbox").click({ force: true });
      cy.contains("button", "Bulk editing").click();
    });

    // select all bulk edit fields and insert values
    cy.get(".modal .toggle").click({ multiple: true });

    cy.get('[data-cy="text-input"]')
      .should("have.length", 8)
      .each((el, index, list) =>
        cy.wrap(el).scrollIntoView().type(`A${index}`),
      );

    cy.get("form .field > .react-datepicker-wrapper input")
      .should("have.length", 3)
      .each((el, index, list) => {
        cy.wrap(el).click();
        cy.get(`.react-datepicker__day--013`).click();
      });

    cy.get('[data-cy="radio-yes"]')
      .should("have.length", 2)
      .each((el, index, list) => {
        cy.wrap(el).click();
        el.click();
      });

    cy.get('[data-cy="domain-dropdown"]')
      .should("have.length", 15)
      .each((el, index, list) =>
        cy.wrap(el).click().find('[role="option"]').last().click(),
      );

    cy.get('[data-cy="domain-tree"] > input')
      .should("have.length", 3)
      .each((el, index, list) => {
        cy.wrap(el).scrollIntoView().click();
        cy.get('.modal [role="listitem"]').eq(5).click();
      });

    // save
    cy.contains("button", "Save").click();
    cy.wait("@edit_multipatch").its("response.body.success").should("eq", true);
    cy.wait("@edit_list");
  });
});
