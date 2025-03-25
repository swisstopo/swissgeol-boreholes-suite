import { addItem } from "../helpers/buttonHelpers";
import {
  goToRouteAndAcceptTerms,
  newEditableBorehole,
  returnToOverview,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for the layer form.", () => {
  it("Creates a layer and fills all dropdowns with multiple selection.", () => {
    goToRouteAndAcceptTerms(`/`);
    // create boreholes
    newEditableBorehole().as("borehole_id");

    // navigate to stratigraphy
    cy.get('[data-cy="stratigraphy-menu-item"]').click();
    cy.get('[data-cy="lithology-menu-item"]').click();
    addItem("addStratigraphy");
    cy.wait("@stratigraphy_POST");
    cy.get('[data-cy="add-layer-icon"]').click();
    cy.wait("@layer");

    cy.get('[data-cy="styled-layer-0"] [data-testid="ModeEditIcon"]').click();
    cy.wait("@get-layer-by-id");

    // fill all dropdowns with two values
    cy.get('[aria-multiselectable="true"]').should("have.length", 6);
    cy.get('[aria-multiselectable="true"]').each(el => {
      cy.wrap(el).scrollIntoView();
      cy.wrap(el).click({ force: true });
      cy.wrap(el).find('[role="option"]').last().click();
      cy.wait("@update-layer");
    });

    cy.get('[aria-multiselectable="true"]').each(el => {
      cy.wrap(el).scrollIntoView();
      cy.wrap(el).click({ force: true });
      cy.wrap(el).find('[role="option"]').eq(1).click();
      cy.wait("@update-layer");
    });

    const expectedValues = [
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
      "not specified",
    ];

    const multipleDropdownValues = [];
    cy.get(".ui.fluid.multiple.selection.dropdown").each(el => {
      const firstValue = el[0].children[0].text;
      const secondValue = el[0].children[1].text;
      multipleDropdownValues.push(firstValue, secondValue);
      if (multipleDropdownValues.length === 12) {
        expect(multipleDropdownValues).to.deep.eq(expectedValues);
      }
    });

    // click reset on all multiselect dropdowns
    cy.get('[aria-multiselectable="true"]').each(el => {
      cy.wrap(el).scrollIntoView();
      cy.wrap(el).click({ force: true });
      cy.wrap(el).find('[role="option"]').eq(0).click();
      cy.wait("@update-layer");
    });

    // click somewhere else to close the last dropdown
    cy.get('[data-cy="notes"]').click();

    // veryfiy that the dropdowns are reset
    [...new Set(expectedValues)].forEach(value => {
      cy.contains(value).should("not.be.visible");
    });

    cy.get('[data-cy="styled-layer-0"] [data-testid="ClearIcon"]').click();

    // stop editing
    stopBoreholeEditing();
    returnToOverview();
  });
});
