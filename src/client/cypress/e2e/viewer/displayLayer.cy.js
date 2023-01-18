import { newEditableBorehole, login, interceptApiCalls } from "../testHelpers";

describe("Test for the borehole form.", () => {
  beforeEach(() => {
    interceptApiCalls();
  });

  it("Adds complete layer and displays it in viewer mode, checks if fields can be optionally hidden.", () => {
    login("editor");
    // create boreholes
    newEditableBorehole().as("borehole_id");
    //navigate to stratigraphy
    cy.get('[data-cy="stratigraphy-menu-item"]').click();
    cy.get('[data-cy="add-stratigraphy-button"]').click();
    cy.wait("@stratigraphy_edit_create");
    cy.get('[data-cy="add-layer-button"]').click();
    cy.wait("@layer");

    cy.get('[data-cy="styled-layer-0"]').click();

    // fill all dropdowns in layer
    cy.get('[data-cy="domain-dropdown"]')
      .should("have.length", 18)
      .each((el, index, list) =>
        cy
          .wrap(el)
          .scrollIntoView()
          .click({ force: true })
          .find('[role="option"]')
          .last()
          .click(),
      );

    // fill all multiselect dropdowns with an additional value
    cy.get('[aria-multiselectable="true"]')
      .should("have.length", 6)
      .each((el, index, list) => {
        cy.wrap(el)
          .scrollIntoView()
          .click({ force: true })
          .find('[role="option"]')
          .eq(1)
          .click();
        cy.wait("@layer_edit_patch");
      });

    // fill text fields
    cy.get('[data-cy="depth_from"]').click().clear().type(0);
    cy.get('[data-cy="depth_to"]').click().clear().type(50);
    cy.get('[data-cy="uscs_original"]')
      .click()
      .clear()
      .type("Squirrel Milk Bar");
    cy.get('[data-cy="notes"]')
      .click()
      .clear()
      .type("Shipping large amounts of almond sandwiches.");

    // fill radio
    cy.get(".ui.radio.checkbox").first().click();

    // Lithology, Lithostratigraphy and Chronostratigraphy
    cy.get('[data-cy="domain-tree"] > input')
      .should("have.length", 3)
      .each((el, index, list) => {
        cy.wrap(el).scrollIntoView().click();
        cy.get('.modal [role="listitem"]').eq(5).click();
      });

    // stop editing
    cy.contains("a", "Stop editing").click();
    cy.wait("@edit_unlock");
    cy.contains("h3", "Done").click();
    cy.wait(["@edit_list", "@borehole"]);

    // go to viewer settings
    cy.get("i[class='th big icon']").click();
    cy.contains("h4", "Settings").click();
    cy.contains("h3", "Viewer").click();
    cy.contains("div", "Stratigraphy fields").click();

    // select only one default field.
    cy.contains("button", "Unselect all").click();
    cy.wait("@codes");
    cy.get(".ui.fitted.checkbox").first().click({ force: true });

    // go to viewer mode

    cy.get("i[class='th big icon']").click();
    cy.contains("h4", "Viewer").click();

    cy.wait("@borehole");

    // Click on last table element, added borehole.
    cy.get(".very.basic.very.compact.table tbody")
      .children()
      .last()
      .scrollIntoView()
      .click();

    cy.wait("@borehole");
    cy.wait(5000);

    // Click on layer
    cy.get('[data-cy="stratigraphy-layer-0"]').scrollIntoView().click();

    // Three detail rows are displayed - two by default plus one that was selected as default field.
    cy.get('[data-cy="stratigraphy-layer-details"] h6').should(
      "have.length",
      3,
    );

    // Show all fields
    cy.get(".PrivateSwitchBase-input").click({ force: true });
    cy.get('[data-cy="stratigraphy-layer-details"] h6').should(
      "have.length",
      31,
    );
  });
});
