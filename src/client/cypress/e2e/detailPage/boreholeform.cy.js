import { clickOnRowWithText, showTableAndWaitForData, sortBy } from "../helpers/dataGridHelpers";
import { evaluateInput, evaluateSelect, isDisabled, setSelect } from "../helpers/formHelpers";
import { createBorehole, goToRouteAndAcceptTerms, newEditableBorehole, returnToOverview } from "../helpers/testHelpers";

describe("Test for the borehole form.", () => {
  it("Creates a borehole and fills dropdowns.", () => {
    // create boreholes
    newEditableBorehole().as("borehole_id");

    // fills and evaluates all mui dropdowns on location tab (identifiers are tested separately)
    setSelect("restrictionId", 2);
    isDisabled("restrictionUntil", true);
    setSelect("restrictionId", 3);
    isDisabled("restrictionUntil", false);
    setSelect("nationalInterest", 2);
    setSelect("spatial_reference_system", 0);
    setSelect("location_precision", 2);
    setSelect("elevationPrecisionId", 2);
    setSelect("qtReferenceElevationId", 2);
    setSelect("referenceElevationTypeId", 4);

    evaluateSelect("restrictionId", "20111003");
    evaluateSelect("nationalInterest", "2");
    evaluateSelect("spatial_reference_system", "20104001");
    evaluateSelect("location_precision", "20113002");
    evaluateSelect("elevationPrecisionId", "20114002");
    evaluateSelect("qtReferenceElevationId", "20114002");
    evaluateSelect("referenceElevationTypeId", "20117004");

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

    evaluateInput("originalName", "Zena Rath");
    evaluateInput("alternateName", "Zena Rath");
    evaluateInput("projectName", "Reactive asymmetric alliance");
    evaluateSelect("restrictionId", "");
    evaluateSelect("nationalInterest", "0"); // No
    evaluateSelect("spatial_reference_system", "20104002"); // LV03
    evaluateSelect("location_precision", "20113005");

    evaluateInput("elevationZ", "3'519.948980314633");
    evaluateInput("referenceElevation", "3'554.9389396584306");
    evaluateSelect("elevationPrecisionId", "");
    evaluateSelect("qtReferenceElevationId", "20114007"); // not specified
    evaluateSelect("referenceElevationTypeId", "30000013"); // kelly bushing

    returnToOverview();
    clickOnRowWithText("Zena Mraz");
    evaluateInput("originalName", "Zena Mraz");
    evaluateInput("alternateName", "Zena Mraz");
    evaluateInput("projectName", "Ergonomic heuristic installation");
    evaluateSelect("restrictionId", "");
    evaluateSelect("nationalInterest", "1"); // Yes
    evaluateSelect("spatial_reference_system", "20104002"); // LV03
    evaluateSelect("location_precision", "20113007"); // not specified

    evaluateInput("elevationZ", "3'062.9991330499756");
    evaluateInput("referenceElevation", "3'478.1368118609007");
    evaluateSelect("elevationPrecisionId", "20114003"); // 1
    evaluateSelect("qtReferenceElevationId", "20114005"); //0.1
    evaluateSelect("referenceElevationTypeId", "30000013"); // kelly bushing
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
