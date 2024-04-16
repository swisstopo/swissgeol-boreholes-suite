import { newEditableBorehole } from "../helpers/testHelpers";

describe("Test for the borehole form.", () => {
  it("Creates a borehole and fills dropdowns.", () => {
    // create boreholes
    newEditableBorehole().as("borehole_id");

    // fill all dropdowns on location tab
    cy.get('[data-cy="domain-dropdown"]')
      .should("have.length", 6)
      .each(el => cy.wrap(el).click().find('[role="option"]').last().click());

    const locationDropdownValues = [];
    cy.get('[data-cy="domain-dropdown"]')
      .each(el => {
        const value = el[0].children[1].firstChild.data;
        locationDropdownValues.push(value);
      })
      .then(() => {
        expect(locationDropdownValues).to.deep.eq([
          "ID Kernlager",
          "not specified",
          "not specified",
          "not specified",
          "not specified",
          "kelly bushing",
        ]);
      });

    // fill all dropdowns on borehole tab
    cy.get('[data-cy="borehole-menu-item"]').click();
    cy.get('[data-cy="domain-dropdown"]')
      .should("have.length", 6)
      .each(el => cy.wrap(el).click().find('[role="option"]').eq(1).click());

    const boreholeDropdownValues = [];
    cy.get('[data-cy="domain-dropdown"]')
      .each(el => {
        const value = el[0].children[1].firstChild.data;
        boreholeDropdownValues.push(value);
      })
      .then(() => {
        expect(boreholeDropdownValues).to.deep.eq([
          "borehole",
          "geotechnics",
          "open, no completion",
          "measured",
          "2",
          "2",
        ]);
      });
  });
});
