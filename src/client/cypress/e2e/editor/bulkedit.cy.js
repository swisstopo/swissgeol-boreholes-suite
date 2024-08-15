import { createBorehole, loginAsAdmin, startBoreholeEditing, stopBoreholeEditing } from "../helpers/testHelpers";
import adminUser from "../../fixtures/adminUser.json";
import { checkAllVisibleRows, checkRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers";

beforeEach(() => {
  loginAsAdmin();
  showTableAndWaitForData();
});

describe("Test the borehole bulk edit feature.", () => {
  it("opens the bulk edit dialog with all boreholes selected", () => {
    checkAllVisibleRows();
    cy.contains("button", "Bulk editing").click({ force: true });
    cy.get(".ui .header").should("have.text", "Bulk modification");
  });

  it("checks if all toggle buttons do something", () => {
    checkAllVisibleRows();
    cy.contains("button", "Bulk editing").click({ force: true });
    cy.get(".modal .toggle")
      .should("have.length", 18)
      .each(el => {
        cy.wrap(el).click({ force: true });
        cy.get(".modal form .field").should("exist");
        cy.wrap(el).click({ force: true });
        cy.get(".modal form").children().should("not.exist");
      });
  });

  it("displays workgroup toggle only if user has permission for more than one workgroup", () => {
    checkAllVisibleRows();
    cy.contains("button", "Bulk editing").click({ force: true });
    cy.get(".modal .toggle").should("have.length", 18);

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
    cy.visit("/");
    showTableAndWaitForData();
    checkAllVisibleRows();
    cy.contains("button", "Bulk editing").click({ force: true });

    cy.get(".modal .toggle").should("have.length", 19);
    // select all bulk edit fields and insert values
    cy.contains("button", "Workgroup").click({ force: true });
    cy.get('[data-cy="workgroup-select"]')
      .should("have.length", 1)
      .each(el => {
        cy.wrap(el).scrollIntoView().click();
        cy.get('.modal [role="option"]').eq(0).click({ force: true });
      });
  });

  it("fills all bulkedit fields and saves.", () => {
    // create boreholes
    createBorehole({ "extended.original_name": "AAA_NINTIC" }).as("borehole_id_1");
    createBorehole({ "extended.original_name": "AAA_LOMONE" }).as("borehole_id_2");

    loginAsAdmin();
    showTableAndWaitForData();
    cy.wait("@borehole");

    // select the boreholes for bulk edit
    cy.get('[data-cy="borehole-table"]').within(() => {
      checkRowWithText("AAA_NINTIC");
      checkRowWithText("AAA_LOMONE");
    });
    cy.contains("button", "Bulk editing").click();

    // select all bulk edit fields and insert values
    cy.get(".modal .toggle").click({ multiple: true });

    cy.get('[data-cy="text-input"]')
      .should("have.length", 4)
      .each((el, index) => cy.wrap(el).scrollIntoView().type(`A${index}`));

    cy.get("form .field > .react-datepicker-wrapper .datepicker-input")
      .should("have.length", 1)
      .each(el => {
        cy.wrap(el).click();
        cy.get(`.react-datepicker__day--013`).click();
      });

    cy.get('[data-cy="radio-yes"]')
      .should("have.length", 2)
      .each(el => {
        cy.wrap(el).click();
        el.click();
      });

    cy.get('[data-cy="domain-dropdown"]')
      .should("have.length", 9)
      .each(el => cy.wrap(el).click().find('[role="option"]').last().click());

    cy.get('[data-cy="domain-tree"] > input')
      .should("have.length", 3)
      .each(el => {
        cy.wrap(el).scrollIntoView().click();
        cy.get('.modal [role="listitem"]').eq(5).click();
      });

    // save
    cy.contains("button", "Save").click();
    cy.wait("@edit_multipatch").its("response.body.success").should("eq", true);
    cy.wait("@edit_list");
  });

  it("cannot select locked boreholes for bulk edit", () => {
    createBorehole({ "extended.original_name": "AAA_JUNIORSOUFFLE" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      cy.visit(`/${id}/borehole`);
      startBoreholeEditing();
      cy.visit("/");
      showTableAndWaitForData();
      cy.contains(".MuiDataGrid-row", "AAA_JUNIORSOUFFLE")
        .find('.MuiCheckbox-root input[type="checkbox"]')
        .should("be.disabled");
      cy.visit(`/${id}/borehole`);
      stopBoreholeEditing();
    });
  });
});
