import {
  newEditableBorehole,
  resetBoreholes,
  login,
  interceptApiCalls,
} from "../testHelpers";

describe("Test for the borehole form.", () => {
  beforeEach(() => {
    interceptApiCalls();

    login("/editor");
    resetBoreholes();
  });

  it("Creates a layer and fills all dropdowns with multiple selection.", () => {
    // create boreholes
    newEditableBorehole().as("borehole_id");

    // navigate to stratigraphy
    cy.get('[data-cy="stratigraphy-menu-item"]').click();
    cy.get('[data-cy="add-stratigraphy-button"]').click();
    cy.wait("@stratigraphy_edit_create");
    cy.get('[data-cy="add-layer-button"]').click();
    cy.wait("@layer");

    cy.get('[data-cy="styled-layer-0"]').click();

    // fill all dropdowns with two values
    cy.get('[aria-multiselectable="true"]')
      .should("have.length", 6)
      .each((el, index, list) => {
        cy.wrap(el)
          .scrollIntoView()
          .click({ force: true })
          .find('[role="option"]')
          .last()
          .scrollIntoView()
          .click();
        cy.wait("@layer_edit_patch");
      });

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

    const multipleDropdownValues = [];
    cy.get(".ui.fluid.multiple.selection.dropdown").each((el, index, list) => {
      const firstValue = el[0].children[0].text;
      const secondValue = el[0].children[1].text;
      multipleDropdownValues.push(firstValue, secondValue);
      if (multipleDropdownValues.length === 12) {
        expect(multipleDropdownValues).to.deep.eq([
          "fat clay",
          "elastic silt",
          "cubic",
          "not specified",
          "sharp",
          "not specified",
          "earth",
          "not specified",
          "erratic block",
          "not specified",
          "beige",
          "light yellow",
        ]);
      }
    });

    // stop editing
    cy.contains("a", "Stop editing").click();
    cy.wait("@edit_unlock");
    cy.contains("h3", "Done").click();
    cy.wait(["@edit_list", "@borehole"]);
  });
});
