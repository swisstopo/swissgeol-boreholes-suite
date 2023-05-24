import { createBorehole, login, adminUserAuth } from "../testHelpers";

export const changeWorkgroupRoleForUser = (
  workgroupId,
  userId,
  role,
  action,
) => {
  return cy
    .request({
      method: "POST",
      url: "/api/v1/user/workgroup/edit",
      body: {
        action: action,
        id: workgroupId,
      },
      auth: adminUserAuth,
    })
    .then(res => {
      expect(res.body).to.have.property("success", true);
      cy.request({
        method: "POST",
        url: "/api/v1/user/workgroup/edit",
        body: {
          action: "SET",
          user_id: userId,
          workgroup_id: workgroupId,
          role_name: role,
          active: action === "ENABLE" ? true : false,
        },
        auth: adminUserAuth,
      }).then(res => {
        expect(res.body).to.have.property("success", true);
        cy.request({
          method: "GET",
          url: "/api/v2/user",
          auth: adminUserAuth,
        });
      });
    });
};

describe("Test the borehole bulk edit feature.", () => {
  it("opens the bulk edit dialog with all boreholes selected", () => {
    login("/editor");
    cy.get('[data-cy="borehole-table"] thead .checkbox').click({ force: true });
    cy.contains("button", "Bulk editing").click({ force: true });
    cy.wait("@edit_ids");
  });

  it("checks if all toggle buttons do something", () => {
    login("/editor");
    cy.get('[data-cy="borehole-table"] thead .checkbox').click({ force: true });
    cy.contains("button", "Bulk editing").click({ force: true });

    cy.get(".modal .toggle")
      .should("have.length", 29)
      .each((el, index, list) => {
        cy.wrap(el).click({ force: true });
        cy.get(".modal form .field").should("exist");
        cy.wrap(el).click({ force: true });
        cy.get(".modal form").children().should("not.exist");
      });
  });

  it("displays workgroup toggle only if user has permission for more than one workgroup", () => {
    login("/editor");
    cy.get('[data-cy="borehole-table"] thead .checkbox').click({ force: true });
    cy.contains("button", "Bulk editing").click({ force: true });

    cy.get(".modal .toggle").should("have.length", 29);
    changeWorkgroupRoleForUser(6, 1, "EDIT", "ENABLE");
    login("/editor");
    cy.get('[data-cy="borehole-table"] thead .checkbox').click({ force: true });
    cy.contains("button", "Bulk editing").click({ force: true });

    cy.get(".modal .toggle").should("have.length", 30);
    // select all bulk edit fields and insert values
    cy.contains("button", "Workgroup").click({ force: true });
    cy.get('[data-cy="workgroup-select"]')
      .should("have.length", 1)
      .each((el, index, list) => {
        cy.wrap(el).scrollIntoView().click();
        cy.get('.modal [role="option"]').eq(0).click({ force: true });
      });
    changeWorkgroupRoleForUser(6, 1, "EDIT", "DISABLE");
  });

  it("fills all bulkedit fields and saves.", () => {
    login("/editor");

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
