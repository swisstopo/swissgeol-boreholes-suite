import { createBorehole, loginAndResetBoreholes } from "../testHelpers";

describe("Test the borehole bulk edit feature.", () => {
  beforeEach(() => {
    cy.intercept("/api/v1/borehole").as("borehole");
    cy.intercept("/api/v1/borehole/edit", req => {
      return (req.alias = `edit_${req.body.action.toLowerCase()}`);
    });

    loginAndResetBoreholes();
  });

  it("opens the bulk edit dialog with all boreholes selected", () => {
    cy.get('[data-cy="borehole-table"] thead .checkbox').click({ force: true });
    cy.contains("button", "Bulk editing").click({ force: true });
    cy.wait("@edit_ids");
  });

  it("checks if all toggle buttons do something", () => {
    cy.get('[data-cy="borehole-table"] thead .checkbox').click({ force: true });
    cy.contains("button", "Bulk editing").click({ force: true });

    cy.get(".modal .toggle")
      .should("have.length", 25)
      .each((el, index, list) => {
        cy.wrap(el).click({ force: true });
        cy.get(".modal form .field").should("exist");
        cy.wrap(el).click({ force: true });
        cy.get(".modal form").children().should("not.exist");
      });
  });

  it("fills all bulkedit fields and saves.", () => {
    // create boreholes
    createBorehole({ "extended.original_name": "NINTIC" }).as("borehole_id_1");
    createBorehole({ "extended.original_name": "LOMONE" }).as("borehole_id_2");
    cy.contains("a", "Refresh").click();
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
    cy.get('[data-cy="domain-dropdown"]')
      .should("have.length", 11)
      .each((el, index, list) =>
        cy.wrap(el).click().find('[role="option"]').last().click(),
      );

    cy.get('[data-cy="domain-tree"] > input')
      .should("have.length", 3)
      .each((el, index, list) => {
        console.log(el, index, list);
        cy.wrap(el).scrollIntoView().click();
        cy.get('.modal [role="listitem"]').eq(5).click();
      });

    // save
    cy.contains("button", "Save").click();
    cy.wait("@edit_multipatch").its("response.body.success").should("eq", true);
    cy.wait("@edit_list");
  });
});
