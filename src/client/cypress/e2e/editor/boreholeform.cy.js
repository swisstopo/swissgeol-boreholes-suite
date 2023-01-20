import { newEditableBorehole, loginAndResetBoreholes } from "../testHelpers";

describe("Test for the borehole form.", () => {
  beforeEach(() => {
    cy.intercept("/api/v1/borehole").as("borehole");
    cy.intercept("/api/v1/borehole/edit", req => {
      return (req.alias = `edit_${req.body.action.toLowerCase()}`);
    });

    loginAndResetBoreholes();
  });

  it("Creates a borehole and fills dropdowns.", () => {
    // create boreholes
    newEditableBorehole().as("borehole_id");

    // fill all dropdowns on location tab
    cy.get('[data-cy="domain-dropdown"]')
      .should("have.length", 6)
      .each((el, index, list) =>
        cy.wrap(el).click().find('[role="option"]').last().click(),
      );

    const locationDropdownValues = [];
    cy.get('[data-cy="domain-dropdown"]').each((el, index, list) => {
      const value = el[0].children[1].firstChild.data;
      locationDropdownValues.push(value);
      if (locationDropdownValues.length === 6) {
        expect(locationDropdownValues).to.deep.eq([
          "Unique id",
          "restricted until",
          "reconstructed",
          "reconstructed",
          "reconstructed",
          "kelly bushing",
        ]);
      }
    });

    // fill all dropdowns on borehole tab
    cy.get('[data-cy="borehole-menu-item"]').click();
    cy.get('[data-cy="domain-dropdown"]')
      .should("have.length", 10)
      .each((el, index, list) =>
        cy.wrap(el).click().find('[role="option"]').eq(1).click(),
      );

    const boreholeDropdownValues = [];
    cy.get('[data-cy="domain-dropdown"]').each((el, index, list) => {
      const value = el[0].children[1].firstChild.data;
      boreholeDropdownValues.push(value);
      if (boreholeDropdownValues.length === 10) {
        expect(boreholeDropdownValues).to.deep.eq([
          "borehole",
          "dynamic probing",
          "geotechnics",
          "core",
          "open, no completion",
          "measured",
          "2",
          "2",
          "2",
          "2",
        ]);
      }
    });
  });
});
