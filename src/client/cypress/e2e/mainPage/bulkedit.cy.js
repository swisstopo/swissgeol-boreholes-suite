import adminUser from "../../fixtures/adminUser.json";
import { checkAllVisibleRows, checkRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers";
import { evaluateInput, setInput, setSelect } from "../helpers/formHelpers";
import {
  createBorehole,
  goToRouteAndAcceptTerms,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

function createBoreholes() {
  createBorehole({ "extended.original_name": "AAA_NINTIC", "custom.alternate_name": "AAA_NINTIC" }).as("borehole_id_1");
  createBorehole({ "extended.original_name": "AAA_LOMONE", "custom.alternate_name": "AAA_LOMONE" }).as("borehole_id_2");
}

function startBulkEditing() {
  // select the boreholes for bulk edit
  cy.get('[data-cy="borehole-table"]').within(() => {
    checkRowWithText("AAA_NINTIC");
    checkRowWithText("AAA_LOMONE");
  });
  cy.contains("button", "Bulk editing").click();
}

function giveAdminUser1workgroup() {
  cy.intercept("/api/v1/user", {
    statusCode: 200,
    body: JSON.stringify(adminUser),
  }).as("adminUser1Workgroups");
}

function giveAdminUser2workgroups() {
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
}

describe("Test the borehole bulk edit feature.", () => {
  it("opens the bulk edit dialog with all boreholes selected", () => {
    giveAdminUser1workgroup();
    showTableAndWaitForData();
    checkAllVisibleRows();
    cy.contains("button", "Bulk editing").click({ force: true });
    cy.get("h1").should("have.text", "Bulk editing");
  });

  it("displays workgroup accordion only if user has permission for more than one workgroup", () => {
    giveAdminUser1workgroup();
    checkAllVisibleRows();
    cy.contains("button", "Bulk editing").click({ force: true });
    cy.get("[data-cy='bulk-edit-accordion']").should("have.length", 19);

    giveAdminUser2workgroups();
    goToRouteAndAcceptTerms(`/`);
    showTableAndWaitForData();
    checkAllVisibleRows();
    cy.contains("button", "Bulk editing").click({ force: true });

    cy.get('[data-cy="bulk-edit-accordion"]').should("have.length", 20);
    cy.get(".MuiAccordionSummary-expandIconWrapper").click({ multiple: true, force: true });

    cy.get('[data-cy="workgroup-formSelect"]')
      .should("have.length", 1)
      .each(el => {
        cy.wrap(el).scrollIntoView().click();
        cy.get('[role="option"]').eq(0).click({ force: true });
      });
  });

  it("fills all bulkedit fields and saves.", () => {
    createBoreholes();
    giveAdminUser1workgroup();
    goToRouteAndAcceptTerms(`/`);
    showTableAndWaitForData();
    cy.wait("@borehole");
    startBulkEditing();

    // select all bulk edit fields and insert values
    cy.get(".MuiAccordionSummary-expandIconWrapper").click({ multiple: true, force: true });

    cy.get("input[type=text]")
      .should("have.length", 1)
      .each(($input, index) => {
        cy.wrap($input).scrollIntoView().clear().type(`A${index}`);
      });

    cy.get('input[type="date"]')
      .should("have.length", 1)
      .each($input => {
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
      .should("have.length", 14)
      .each(el => {
        cy.wrap(el).click();
        cy.get('li[role="option"]').last().click();
      });

    // save
    cy.contains("button", "Save").click();
    cy.wait("@edit_multipatch").its("response.body.success").should("eq", true);
    cy.wait("@edit_list");
  });

  it("can reset bulkedit fields", () => {
    createBoreholes();
    giveAdminUser2workgroups();
    goToRouteAndAcceptTerms(`/`);
    showTableAndWaitForData();
    cy.wait("@borehole");
    startBulkEditing();

    cy.get(".MuiAccordionSummary-expandIconWrapper").click({ multiple: true, force: true });
    setInput("custom.project_name", "new name");
    setSelect("workgroup", 1);
    setSelect("restriction", 3);
    setSelect("national_interest", 1);

    let visibleCount = 0;

    // expect 4 visible reset buttons
    cy.get('[data-cy="bulk-edit-reset-button"]')
      .each(button => {
        cy.wrap(button)
          .scrollIntoView()
          .then($el => {
            if ($el.css("visibility") !== "hidden") {
              visibleCount += 1;
            }
          });
      })
      .then(() => {
        expect(visibleCount).to.equal(4);
      });

    cy.get("h6").contains("Project name").scrollIntoView();
    evaluateInput("custom.project_name", "new name");
    cy.contains(".MuiDialog-container", "restricted until").should("exist");
    cy.contains(".MuiDialog-container", "Blue").should("exist");
    cy.contains(".MuiDialog-container", "Yes").should("exist");

    cy.get('[data-cy="bulk-edit-reset-button"]').click({ multiple: true, force: true });
    cy.get("h6").contains("Project name").scrollIntoView();
    evaluateInput("custom.project_name", "");
    cy.contains(".MuiDialog-container", "restricted until").should("not.exist");
    cy.contains(".MuiDialog-container", "Blue").should("not.exist");
    cy.contains(".MuiDialog-container", "Yes").should("not.exist");
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
