import { newEditableBorehole, returnToOverview, stopBoreholeEditing } from "../helpers/testHelpers.js";

describe("Tests for filtering data by identifier.", () => {
  it("can filter by identifier", () => {
    newEditableBorehole().as("borehole_id");
    let identifierDropdown = cy.get('[data-cy="identifier-dropdown"]');

    identifierDropdown.each(el =>
      cy.wrap(el).click({ force: true }).find('[role="option"]').eq(1).click({ force: true }),
    );

    cy.get('[data-cy="identifier-value"] input').type(819544732);
    cy.get('[data-cy="identifier-add"]').click();

    stopBoreholeEditing();
    returnToOverview();
    cy.get('[data-cy="show-filter-button"]').click();

    cy.contains("h6", "Location").click();
    // show all options
    cy.get('[class="ui fitted toggle checkbox"]').eq(0).children().first().check({ force: true });

    cy.get(".MuiTablePagination-displayedRows").should("have.text", "1 - 100 of 1627"); // when testing with cypress locally use electron browser, otherwise text might be displayed as "1-100 of 1627"

    cy.get('[data-cy="domain-dropdown"]')
      .first()
      .click({ force: true })
      .find('[role="option"]')
      .eq(1)
      .click({ force: true });

    cy.get(".MuiTablePagination-displayedRows").should("have.text", "1 - 1 of 1");
    // click reset label
    cy.get('[data-cy="reset-filter-button"]').click();
    cy.get(".MuiTablePagination-displayedRows").should("have.text", "1 - 100 of 1627");
  });

  it("can bulk edit boreholes while filter by identifier is set", () => {
    newEditableBorehole().as("borehole_id");
    let identifierDropdown = cy.get('[data-cy="identifier-dropdown"]');

    identifierDropdown.each(el =>
      cy.wrap(el).click({ force: true }).find('[role="option"]').eq(1).click({ force: true }),
    );

    cy.get('[data-cy="identifier-value"] input').type(64531274);
    cy.get('[data-cy="identifier-add"]').click();

    stopBoreholeEditing();
    returnToOverview();

    newEditableBorehole().as("borehole_id_2");
    identifierDropdown = cy.get('[data-cy="identifier-dropdown"]');

    identifierDropdown.each(el =>
      cy.wrap(el).click({ force: true }).find('[role="option"]').eq(1).click({ force: true }),
    );

    cy.get('[data-cy="identifier-value"] input').type(436584127);
    cy.get('[data-cy="identifier-add"]').click();

    stopBoreholeEditing();
    returnToOverview();
    cy.get('[data-cy="show-filter-button"]').click();

    cy.contains("h6", "Location").click();
    // show all options
    cy.get('[class="ui fitted toggle checkbox"]').eq(0).children().first().check({ force: true });

    cy.get('[data-cy="domain-dropdown"]')
      .first()
      .click({ force: true })
      .find('[role="option"]')
      .eq(1)
      .click({ force: true });
    cy.get(".MuiTablePagination-displayedRows").should("have.text", "1 - 2 of 2");

    cy.get(".MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root").find('input[type="checkbox"]').check({ force: true });
    cy.contains("button", "Bulk editing").click({ force: true });

    // Bulk edit dialog should open.
    cy.get(".modal .toggle").should("have.length", 18);
    cy.contains("button", "Cancel").click();

    // click reset label
    cy.get('[data-cy="reset-filter-button"]').click();
  });
});
