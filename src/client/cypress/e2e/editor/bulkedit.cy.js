import {
  createBorehole,
  goToRouteAndAcceptTerms,
  loginAsAdmin,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";
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
    cy.get("h1").should("have.text", "Bulk editing");
  });

  it.only("displays workgroup accordion only if user has permission for more than one workgroup", () => {
    checkAllVisibleRows();
    cy.contains("button", "Bulk editing").click({ force: true });

    cy.get("[data-cy='bulk-edit-accordion']").should("have.length", 19);

    const adminUser2Workgroups = Object.assign({}, adminUser);
    adminUser2Workgroups.data.workgroups.push({
      id: 6,
      workgroup: "Blue",
      roles: ["EDIT"],
      disabled: null,
    });
    cy.intercept("/api/v1/user", {
      statusCode: 200,
      body: JSON.stringify(adminUser2Workgroups),
    }).as("adminUser2Workgroups");
    goToRouteAndAcceptTerms(`/`);
    showTableAndWaitForData();
    checkAllVisibleRows();
    cy.contains("button", "Bulk editing").click({ force: true });

    cy.get('[data-cy="bulk-edit-accordion"]').should("have.length", 20);
    cy.get(".MuiAccordionSummary-expandIconWrapper").click({ multiple: true, force: true });

    cy.get('[data-cy="workgroup-select"]')
      .should("have.length", 1)
      .each(el => {
        cy.wrap(el).scrollIntoView().click();
        cy.get('[role="option"]').eq(0).click({ force: true });
      });
  });

  it.only("fills all bulkedit fields and saves.", () => {
    // create boreholes
    createBorehole({ "extended.original_name": "AAA_NINTIC", "custom.alternate_name": "AAA_NINTIC" }).as(
      "borehole_id_1",
    );
    createBorehole({ "extended.original_name": "AAA_LOMONE", "custom.alternate_name": "AAA_LOMONE" }).as(
      "borehole_id_2",
    );

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
    cy.get(".MuiAccordionSummary-expandIconWrapper").click({ multiple: true, force: true });

    cy.get("input[type=text]")
      .should("have.length", 1)
      .each(($input, index) => {
        // Fill each input with a test value, here using "Test Value X" where X is the index
        cy.wrap($input).scrollIntoView().clear().type(`A${index}`);
      });

    cy.get('input[type="date"]')
      .should("have.length", 1)
      .each($input => {
        // Set a specific date in the format YYYY-MM-DD (e.g., "2024-09-25")
        cy.wrap($input).clear().type("2024-09-25");
      });

    cy.get('input[type="date"]')
      .should("have.length", 1)
      .each($input => {
        cy.wrap($input).should("have.value", "2024-09-25");
      });

    cy.get("input[type=number]")
      .should("have.length", 3)
      .each(($input, index) => {
        cy.wrap($input).scrollIntoView().clear().type(`${index}`);
      });

    cy.get('[role="combobox"]')
      .should("have.length", 15)
      .each(el => {
        cy.wrap(el).click();
        cy.get('li[role="option"]').last().click();
      });

    // save
    cy.contains("button", "Save").click();
    cy.wait("@edit_multipatch").its("response.body.success").should("eq", true);
    cy.wait("@edit_list");
  });

  it("cannot select locked boreholes for bulk edit", () => {
    createBorehole({ "extended.original_name": "AAA_JUNIORSOUFFLE", "custom.alternate_name": "AAA_JUNIORSOUFFLE" }).as(
      "borehole_id",
    );
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}/borehole`);
      startBoreholeEditing();
      goToRouteAndAcceptTerms(`/`);
      showTableAndWaitForData();
      cy.contains(".MuiDataGrid-row", "AAA_JUNIORSOUFFLE")
        .find('.MuiCheckbox-root input[type="checkbox"]')
        .should("be.disabled");
      goToRouteAndAcceptTerms(`/${id}/borehole`);
      stopBoreholeEditing();
    });
  });
});
