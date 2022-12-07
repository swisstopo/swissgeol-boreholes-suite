import {
  interceptApiCalls,
  newEditableBorehole,
  deleteBorehole,
  login,
} from "./testHelpers";

describe("Tests for filtering data by identifier.", () => {
  beforeEach(() => {
    interceptApiCalls();
  });

  it("can filter by identifier", () => {
    login("/editor");
    newEditableBorehole().as("borehole_id");
    let identifierDropdown = cy.get('[data-cy="identifier-dropdown"]');

    identifierDropdown.each((el, index, list) =>
      cy
        .wrap(el)
        .click({ force: true })
        .find('[role="option"]')
        .eq(1)
        .click({ force: true }),
    );

    cy.get('[data-cy="identifier-value"] input').type(819544732);
    cy.get('[data-cy="identifier-add"]').click();

    cy.contains("a", "Stop editing").click();
    cy.wait("@edit_unlock");
    cy.contains("h3", "Done").click();
    cy.wait(["@edit_list", "@borehole"]);

    cy.contains("span", "Location").click();
    // show all options
    cy.get('[class="ui fitted toggle checkbox"]')
      .children()
      .first()
      .check({ force: true });

    cy.get("tbody").children().should("have.length", 22);

    cy.get('[data-cy="domain-dropdown-borehole_identifier"]').each(
      (el, index, list) =>
        cy
          .wrap(el)
          .click({ force: true })
          .find('[role="option"]')
          .eq(1)
          .click({ force: true }),
    );
    cy.get("tbody").children().should("have.length", 1);

    // click reset label
    cy.get('[data-cy="domain-dropdown-borehole_identifier"]')
      .parent()
      .parent()
      .next()
      .children()
      .first()
      .click();
    cy.get("tbody").children().should("have.length", 22);
    cy.get("@borehole_id").then(id => deleteBorehole(id));
  });

  it("can bulk edit boreholes while filter by identifier is set", () => {
    login("/editor");
    newEditableBorehole().as("borehole_id");
    let identifierDropdown = cy.get('[data-cy="identifier-dropdown"]');

    identifierDropdown.each((el, index, list) =>
      cy
        .wrap(el)
        .click({ force: true })
        .find('[role="option"]')
        .eq(1)
        .click({ force: true }),
    );

    cy.get('[data-cy="identifier-value"] input').type(64531274);
    cy.get('[data-cy="identifier-add"]').click();

    cy.contains("a", "Stop editing").click();
    cy.wait("@edit_unlock");
    cy.contains("h3", "Done").click();
    cy.wait(["@edit_list", "@borehole"]);

    newEditableBorehole().as("borehole_id_2");
    identifierDropdown = cy.get('[data-cy="identifier-dropdown"]');

    identifierDropdown.each((el, index, list) =>
      cy
        .wrap(el)
        .click({ force: true })
        .find('[role="option"]')
        .eq(1)
        .click({ force: true }),
    );

    cy.get('[data-cy="identifier-value"] input').type(436584127);
    cy.get('[data-cy="identifier-add"]').click();

    cy.contains("a", "Stop editing").click();
    cy.wait("@edit_unlock");
    cy.contains("h3", "Done").click();
    cy.wait(["@edit_list", "@borehole"]);

    cy.contains("span", "Location").click();
    // show all options
    cy.get('[class="ui fitted toggle checkbox"]')
      .children()
      .first()
      .check({ force: true });

    cy.get('[data-cy="domain-dropdown-borehole_identifier"]').each(
      (el, index, list) =>
        cy
          .wrap(el)
          .click({ force: true })
          .find('[role="option"]')
          .eq(1)
          .click({ force: true }),
    );
    cy.get("tbody").children().should("have.length", 2);

    cy.get('[data-cy="borehole-table"] thead .checkbox').click({ force: true });
    cy.contains("button", "Bulk editing").click({ force: true });
    cy.wait("@edit_ids");

    // Bulk edit dialog should open.
    cy.get(".modal .toggle").should("have.length", 25);
    cy.contains("button", "Cancel").click();

    // click reset label
    cy.get('[data-cy="domain-dropdown-borehole_identifier"]')
      .parent()
      .parent()
      .next()
      .children()
      .first()
      .click();

    cy.get("@borehole_id").then(id => deleteBorehole(id));
    cy.get("@borehole_id_2").then(id => deleteBorehole(id));
  });
});
