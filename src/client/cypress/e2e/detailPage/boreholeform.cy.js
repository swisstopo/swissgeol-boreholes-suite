import { clickOnRowWithText, showTableAndWaitForData, sortBy } from "../helpers/dataGridHelpers";
import { evaluateInput, evaluateSelect, isDisabled, setSelect } from "../helpers/formHelpers";
import {
  createBorehole,
  goToRouteAndAcceptTerms,
  newEditableBorehole,
  returnToOverview,
  startBoreholeEditing,
} from "../helpers/testHelpers";

function ensureEditingDisabled() {
  cy.get('[data-cy="edit-button"]').should("exist");
  cy.get('[data-cy="editingstop-button"]').should("not.exist");
}

function ensureEditingEnabled() {
  cy.get('[data-cy="edit-button"]').should("not.exist");
  cy.get('[data-cy="editingstop-button"]').should("exist");
}

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

  it("Checks if form values are updated when borehole changes", () => {
    showTableAndWaitForData();
    // sort by Name descending
    sortBy("Name");
    clickOnRowWithText("Zena Rath");

    evaluateInput("original_name", "Zena Rath");
    evaluateInput("alternate_name", "Zena Rath");
    evaluateInput("project_name", "Reactive asymmetric alliance");
    evaluateSelect("restriction", "");
    evaluateSelect("national_interest", "0"); // No
    evaluateSelect("spatial_reference_system", "20104002"); // LV03
    evaluateSelect("location_precision", "20113005");

    evaluateInput("elevation_z", "3'519.948980314633");
    evaluateInput("reference_elevation", "3'554.9389396584306");
    evaluateSelect("elevation_precision", "");
    evaluateSelect("qt_reference_elevation", "");
    evaluateSelect("reference_elevation_type", "");

    returnToOverview();
    clickOnRowWithText("Zena Mraz");
    evaluateInput("original_name", "Zena Mraz");
    evaluateInput("alternate_name", "Zena Mraz");
    evaluateInput("project_name", "Ergonomic heuristic installation");
    evaluateSelect("restriction", "");
    evaluateSelect("national_interest", "1"); // Yes
    evaluateSelect("spatial_reference_system", "20104002"); // LV03
    evaluateSelect("location_precision", "20113007"); // not specified

    evaluateInput("elevation_z", "3'062.9991330499756");
    evaluateInput("reference_elevation", "3'478.1368118609007");
    evaluateSelect("elevation_precision", "20114003"); // 1
    evaluateSelect("qt_reference_elevation", "20114005"); // 0.1
    evaluateSelect("reference_elevation_type", "30000013"); // kelly bushing
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

  it.only("stops editing when going back to overview", () => {
    createBorehole({ "extended.original_name": "AAA_HIPPOPOTHAMUS", "custom.alternate_name": "AAA_HIPPOPOTHAMUS" }).as(
      "borehole_id",
    );
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}`);
      ensureEditingDisabled();
      startBoreholeEditing();
      ensureEditingEnabled();
      returnToOverview(); // navigating with swissgeol back button stops editing
      showTableAndWaitForData();
      clickOnRowWithText("AAA_HIPPOPOTHAMUS");
      ensureEditingDisabled();
      startBoreholeEditing();
      goToRouteAndAcceptTerms(`/`); //  navigating with browser does not stop editing
      showTableAndWaitForData();
      clickOnRowWithText("AAA_HIPPOPOTHAMUS");
      ensureEditingEnabled();
    });
  });
});
