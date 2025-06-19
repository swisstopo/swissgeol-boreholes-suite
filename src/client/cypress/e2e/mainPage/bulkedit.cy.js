import { saveForm } from "../helpers/buttonHelpers.js";
import { checkAllVisibleRows, checkRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers";
import { evaluateInput, evaluateSelect, setInput, setSelect } from "../helpers/formHelpers";
import {
  createBorehole,
  giveAdminUser1workgroup,
  giveAdminUser2workgroups,
  goToDetailRouteAndAcceptTerms,
  goToRouteAndAcceptTerms,
  startBoreholeEditing,
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

describe("Test the borehole bulk edit feature.", () => {
  it("opens the bulk edit dialog with all boreholes selected", () => {
    giveAdminUser1workgroup();
    goToRouteAndAcceptTerms(`/`);
    showTableAndWaitForData();
    checkAllVisibleRows();
    cy.contains("button", "Bulk editing").click({ force: true });
    cy.get("h1").should("have.text", "Bulk editing");
  });

  it("displays workgroup accordion only if user has permission for more than one workgroup", () => {
    giveAdminUser1workgroup();
    goToRouteAndAcceptTerms("/");
    showTableAndWaitForData();
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

    cy.get('[data-cy="workgroup-formSelect"]').should("have.length", 1);
    cy.get('[data-cy="workgroup-formSelect"]').each(el => {
      cy.wrap(el).scrollIntoView();
      cy.wrap(el).click();
      cy.get('[role="option"]').eq(0).click({ force: true });
    });
  });

  it("fills all bulkedit fields and saves.", () => {
    createBoreholes();
    goToRouteAndAcceptTerms(`/`);
    showTableAndWaitForData();
    cy.wait("@borehole");
    startBulkEditing();

    // select all bulk edit fields and insert values
    cy.get(".MuiAccordionSummary-expandIconWrapper").click({ multiple: true, force: true });

    cy.get('[data-cy$="-formInput"] input[type=text]').should("have.length", 1);
    cy.get('[data-cy$="-formInput"] input[type=text]').each(($input, index) => {
      cy.wrap($input).scrollIntoView();
      cy.wrap($input).clear();
      cy.wrap($input).type(`A${index}`);
    });

    cy.get('input[type="date"]').should("have.length", 1);
    cy.get('input[type="date"]').each($input => {
      cy.wrap($input).clear();
      cy.wrap($input).type("2024-09-25");
    });

    cy.get('input[type="date"]')
      .should("have.length", 1)
      .each($input => {
        cy.wrap($input).should("have.value", "2024-09-25");
      });

    cy.get("input[type=number]").should("have.length", 3);
    cy.get("input[type=number]").each(($input, index) => {
      cy.wrap($input).scrollIntoView();
      cy.wrap($input).clear();
      cy.wrap($input).type(`${index}`);
    });

    cy.get('[role="combobox"]').each(el => {
      cy.wrap(el).click();
      cy.get('li[role="option"]').last().click();
    });

    saveForm();
    cy.wait("@edit_multipatch").its("response.body.success").should("eq", true);
    cy.wait("@edit_list");

    // check if form was reset after saving
    startBulkEditing();
    cy.get(".MuiAccordionSummary-expandIconWrapper").click({ multiple: true, force: true });

    cy.get('[data-cy$="-formInput"] input[type=text]').should("have.length", 1);
    cy.get('[data-cy$="-formInput"] input[type=text]').each($input => {
      cy.wrap($input).scrollIntoView();
      cy.wrap($input).should("have.value", "");
    });

    cy.get('input[type="date"]').should("have.length", 1);
    cy.get('input[type="date"]').each($input => {
      cy.wrap($input).scrollIntoView();
      cy.wrap($input).should("have.value", "");
    });

    cy.get("input[type=number]").should("have.length", 3);
    cy.get("input[type=number]").each($input => {
      cy.wrap($input).scrollIntoView();
      cy.wrap($input).should("have.value", "");
    });

    cy.get('[data-cy$="-formSelect"] input[type=text]').should("have.length", 14);
    cy.get('[data-cy$="-formSelect"] input[type=text]').each($input => {
      cy.wrap($input).scrollIntoView();
      cy.wrap($input).should("have.value", "");
    });
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
    setSelect("restriction", 2);
    setSelect("national_interest", 0);

    let visibleCount = 0;

    // expect 4 visible reset buttons
    cy.get('[data-cy="bulk-edit-reset-button"]').each(button => {
      cy.wrap(button).scrollIntoView();
      cy.wrap(button).then($el => {
        if ($el.css("visibility") !== "hidden") {
          visibleCount += 1;
        }
      });
    });
    cy.then(() => {
      expect(visibleCount).to.equal(4);
    });

    cy.get("h6").contains("Project name").scrollIntoView();
    evaluateInput("custom.project_name", "new name");
    evaluateSelect("restriction", "restricted until");
    evaluateSelect("workgroup", "Blue");
    evaluateSelect("national_interest", "Yes");

    cy.get('[data-cy="bulk-edit-reset-button"]').click({ multiple: true, force: true });
    cy.get("h6").contains("Project name").scrollIntoView();
    evaluateInput("custom.project_name", "");
    evaluateSelect("restriction", "");
    evaluateSelect("workgroup", "");
    evaluateSelect("national_interest", "");
  });

  it("cannot select locked boreholes for bulk edit", () => {
    createBorehole({ "extended.original_name": "AAA_JUNIORSOUFFLE", "custom.alternate_name": "AAA_JUNIORSOUFFLE" }).as(
      "borehole_id",
    );
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}/borehole`);
      startBoreholeEditing();
      goToRouteAndAcceptTerms(`/`);
      showTableAndWaitForData();
      cy.contains(".MuiDataGrid-row", "AAA_JUNIORSOUFFLE")
        .find('.MuiCheckbox-root input[type="checkbox"]')
        .should("be.disabled");
    });
  });
});
