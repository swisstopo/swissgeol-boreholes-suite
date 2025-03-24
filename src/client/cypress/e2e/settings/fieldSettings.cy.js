import { getElementByDataCy, goToRouteAndAcceptTerms, returnToOverview } from "../helpers/testHelpers";

it("checks that the field settings control the field visibility.", () => {
  goToRouteAndAcceptTerms("/");

  const waitForSettings = () => {
    cy.wait(["@setting", "@codes", "@codelist_GET"]);
  };
  getElementByDataCy("settings-button").click();
  getElementByDataCy("general-tab").click();
  cy.contains("Lithology fields").click();
  cy.contains("Select all").click();
  waitForSettings();

  goToRouteAndAcceptTerms("/1001140/stratigraphy/lithology");
  cy.get('[data-cy="styled-layer-9"]').click();
  cy.contains("From depth [m MD]").should("exist");
  cy.contains("To depth [m MD]").should("exist");
  cy.contains("End of borehole").should("exist");
  cy.contains("Completeness of entries").should("exist");
  cy.contains("Lithology").should("exist");
  cy.contains("Original lithology").should("exist");
  cy.contains("USCS original classification").should("exist");
  cy.contains("USCS way of determination").should("exist");
  cy.contains("USCS 1").should("exist");
  cy.contains("Grain size 1").should("exist");
  cy.contains("USCS 2").should("exist");
  cy.contains("Grain size 2").should("exist");
  cy.contains("USCS 3").should("exist");
  cy.contains("Grain shape").should("exist");
  cy.contains("Grain angularity").should("exist");
  cy.contains("Organic components").should("exist");
  cy.contains("Debris").should("exist");
  cy.contains("Debris lithology").should("exist");
  cy.contains("Striations").should("exist");
  cy.contains("Colour").should("exist");
  cy.contains("Consistency").should("exist");
  cy.contains("Plasticity").should("exist");
  cy.contains("Compactness").should("exist");
  cy.contains("Cohesion").should("exist");
  cy.contains("Gradation").should("exist");
  cy.contains("Humidity").should("exist");
  cy.contains("Alteration").should("exist");
  cy.contains("Notes").should("exist");

  returnToOverview();
  getElementByDataCy("settings-button").click();
  getElementByDataCy("general-tab").click();
  cy.contains("Lithology fields").click();
  cy.contains("Unselect all").click();
  waitForSettings();

  goToRouteAndAcceptTerms("/1001140/stratigraphy/lithology");
  cy.get('[data-cy="styled-layer-9"]').click();
  cy.contains("From depth [m MD]").should("exist");
  cy.contains("To depth [m MD]").should("exist");
  cy.contains("End of borehole").should("not.exist");
  cy.contains("Completeness of entries").should("not.exist");
  cy.contains("Original lithology").should("not.exist");
  cy.contains("USCS original classification").should("not.exist");
  cy.contains("USCS way of determination").should("not.exist");
  cy.contains("USCS 1").should("not.exist");
  cy.contains("Grain size 1").should("not.exist");
  cy.contains("USCS 2").should("not.exist");
  cy.contains("Grain size 2").should("not.exist");
  cy.contains("USCS 3").should("not.exist");
  cy.contains("Grain shape").should("not.exist");
  cy.contains("Grain angularity").should("not.exist");
  cy.contains("Organic components").should("not.exist");
  cy.contains("Debris").should("not.exist");
  cy.contains("Debris lithology").should("not.exist");
  cy.contains("Colour").should("not.exist");
  cy.contains("Consistency").should("not.exist");
  cy.contains("Plasticity").should("not.exist");
  cy.contains("Compactness").should("not.exist");
  cy.contains("Cohesion").should("not.exist");
  cy.contains("Gradation").should("not.exist");
  cy.contains("Humidity").should("not.exist");
  cy.contains("Alteration").should("not.exist");
  cy.contains("Notes").should("not.exist");

  returnToOverview();
  getElementByDataCy("settings-button").click();
  getElementByDataCy("general-tab").click();
  cy.contains("Lithology fields").click();
  waitForSettings();
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500);

  // manually check some and verify states
  cy.get('[data-cy="checkbox-original_lithology"]').click();
  cy.get('[data-cy="checkbox-plasticity"]').click();
  cy.get('[data-cy="checkbox-uscs_1"]').click();
  cy.get('[data-cy="checkbox-plasticity"] input').should("be.checked");
  cy.get('[data-cy="checkbox-original_lithology"] input').should("be.checked");
  cy.get('[data-cy="checkbox-uscs_1"] input').should("be.checked");

  cy.get('[data-cy="checkbox-humidity"] input').should("not.be.checked");
  cy.get('[data-cy="checkbox-gradation"] input').should("not.be.checked");
  cy.get('[data-cy="checkbox-cohesion"] input').should("not.be.checked");
  cy.get('[data-cy="checkbox-compactness"] input').should("not.be.checked");
});
