import {
  createBorehole,
  goToRouteAndAcceptTerms,
  newEditableBorehole,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

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

  it("completes alternate name", () => {
    createBorehole({ "extended.original_name": "PHOTOSQUIRREL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}`);
      cy.get('[data-cy="original-name"]').within(() => {
        cy.get("input").as("originalNameInput");
      });
      cy.get('[data-cy="alternate-name"]').within(() => {
        cy.get("input").as("alternateNameInput");
      });

      cy.get("@originalNameInput").should("have.value", "PHOTOSQUIRREL");
      cy.get("@alternateNameInput").should("have.value", "PHOTOSQUIRREL");

      startBoreholeEditing();
      // changing original name should also change alternate name
      cy.get("@originalNameInput").clear().type("PHOTOCAT");
      cy.wait("@edit_patch");
      cy.get("@originalNameInput").should("have.value", "PHOTOCAT");
      cy.get("@alternateNameInput").should("have.value", "PHOTOCAT");

      cy.get("@alternateNameInput").clear().type("PHOTOMOUSE");
      cy.wait("@edit_patch");
      cy.get("@originalNameInput").should("have.value", "PHOTOCAT");
      cy.get("@alternateNameInput").should("have.value", "PHOTOMOUSE");

      cy.get("@alternateNameInput").clear();
      cy.wait("@edit_patch");
      stopBoreholeEditing();
      // should be reset to original name if alternate name is empty
      cy.get("@originalNameInput").should("have.value", "PHOTOCAT");
      cy.get("@alternateNameInput").should("have.value", "PHOTOCAT");
    });
  });
});
