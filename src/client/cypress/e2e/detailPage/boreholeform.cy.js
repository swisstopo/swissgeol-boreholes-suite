import { evaluateSelect, isDisabled, setSelect } from "../helpers/formHelpers";
import { createBorehole, goToRouteAndAcceptTerms, newEditableBorehole } from "../helpers/testHelpers";

describe("Test for the borehole form.", () => {
  it("Creates a borehole and fills dropdowns.", () => {
    // create boreholes
    newEditableBorehole().as("borehole_id");

    // fill all legacy dropdowns on location tab
    cy.get('[data-cy="domain-dropdown"]')
      .should("have.length", 1)
      .each(el => cy.wrap(el).click().find('[role="option"]').last().click());

    const locationDropdownValues = [];
    cy.get('[data-cy="domain-dropdown"]')
      .each(el => {
        const value = el[0].children[1].firstChild.data;
        locationDropdownValues.push(value);
      })
      .then(() => {
        expect(locationDropdownValues).to.deep.eq(["ID Kernlager"]);
      });

    // fills and evaluates all mui dropdowns on location tab
    setSelect("restriction", 2);
    isDisabled("restriction_until", true);
    setSelect("restriction", 3);
    isDisabled("restriction_until", false);
    setSelect("national_interest", 2);
    setSelect("spatial_reference_system", 0);
    setSelect("location_precision", 2);
    setSelect("elevation_precision", 2);
    setSelect("qt_reference_elevation", 2);
    setSelect("reference_elevation_type", 4);

    evaluateSelect("restriction", "20111003");
    evaluateSelect("national_interest", "2");
    evaluateSelect("spatial_reference_system", "20104001");
    evaluateSelect("location_precision", "20113002");
    evaluateSelect("elevation_precision", "20114002");
    evaluateSelect("qt_reference_elevation", "20114002");
    evaluateSelect("reference_elevation_type", "20117004");

    // fill all dropdowns on borehole tab
    cy.get('[data-cy="borehole-menu-item"]').click();
    cy.get('[data-cy="domain-dropdown"]')
      .should("have.length", 4)
      .each(el => cy.wrap(el).click().find('[role="option"]').eq(1).click());

    const boreholeDropdownValues = [];
    cy.get('[data-cy="domain-dropdown"]')
      .each(el => {
        const value = el[0].children[1].firstChild.data;
        boreholeDropdownValues.push(value);
      })
      .then(() => {
        expect(boreholeDropdownValues).to.deep.eq(["borehole", "geotechnics", "open, no completion", "2"]);
      });
  });

  it("switches tabs", () => {
    let boreholeId;
    createBorehole({ "extended.original_name": "LSENALZE" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      boreholeId = id;
      goToRouteAndAcceptTerms(`/${id}/borehole`);
    });
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/borehole`);
      expect(location.hash).to.eq("#general");
    });

    cy.get('[data-cy="sections-tab"]').click();
    cy.wait("@get-sections-by-boreholeId");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/borehole`);
      expect(location.hash).to.eq("#sections");
    });

    cy.get('[data-cy="geometry-tab"]').click();
    cy.wait("@boreholegeometry_GET");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/borehole`);
      expect(location.hash).to.eq("#geometry");
    });
  });
});
