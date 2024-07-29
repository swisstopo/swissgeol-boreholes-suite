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

    cy.get("tbody").children().should("have.length", 100);

    cy.get('[data-cy="domain-dropdown"]')
      .first()
      .click({ force: true })
      .find('[role="option"]')
      .eq(1)
      .click({ force: true });

    cy.get("tbody").children().should("have.length", 1);

    // click reset label
    cy.get('[data-cy="reset-filter-button"]').click();
    cy.get("tbody").children().should("have.length", 100);
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
    cy.get("tbody").children().should("have.length", 2);

    cy.get('[data-cy="borehole-table"] thead .checkbox').click({ force: true });
    cy.contains("button", "Bulk editing").click({ force: true });
    cy.wait("@edit_ids");

    // Bulk edit dialog should open.
    cy.get(".modal .toggle").should("have.length", 18);
    cy.contains("button", "Cancel").click();

    // click reset label
    cy.get('[data-cy="reset-filter-button"]').click();
  });
});
