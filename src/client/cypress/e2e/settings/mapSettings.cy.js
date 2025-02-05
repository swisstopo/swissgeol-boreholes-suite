import { getElementByDataCy, goToRouteAndAcceptTerms, returnToOverview } from "../helpers/testHelpers.js";

describe("map settings", () => {
  it("Adds wms and wmts to user maps", () => {
    goToRouteAndAcceptTerms("/setting");

    const wmsName = "Army logistics centres (ALC)";
    const wmtsName = "Wetness potential agricultural land";

    getElementByDataCy("general-tab").click();
    cy.contains("Map").click();
    // Add WMS
    cy.get('[data-cy="load-layers-button"]').click();
    cy.get('[data-cy="wms-list-box"]').contains(wmsName);
    cy.get('[data-cy="maps-for-user-box"]').should("not.exist");
    cy.contains("div.selectable", wmsName).find('[data-cy="add-layer-button"]').click();
    cy.wait("@setting");
    cy.get('[data-cy="maps-for-user-box"]').contains(wmsName);

    // Select WMTS from Dropdown
    cy.get('[role="combobox"]').click();
    cy.get('div[role="option"]').last().click();

    // Add WMTS
    cy.get('[data-cy="load-layers-button"]').click();
    cy.get('[data-cy="wmts-list-box"]').contains(wmtsName);
    cy.contains("div.selectable", wmtsName).find('[data-cy="add-layer-button"]').click();
    cy.wait("@setting");
    cy.get('[data-cy="maps-for-user-box"]').contains(wmtsName);

    // Verify layers are added to overview map
    returnToOverview();
    cy.get('[data-cy="layers-button"]').click();
    cy.contains(wmsName);
    cy.contains(wmtsName);

    // Reload page to verify layers are correctly added
    cy.reload(true);
    goToRouteAndAcceptTerms("/");

    // Remove layers
    getElementByDataCy("settings-button").click();
    getElementByDataCy("general-tab").click();
    cy.contains("Map").click();
    cy.wait(1000);
    cy.get('[data-cy="maps-for-user-box"]').contains(wmtsName);
    cy.get('[data-cy="maps-for-user-box"]').contains(wmsName);
    cy.get('[data-cy="delete-user-map-button"]').eq(0).click();
    cy.wait("@setting");
    cy.wait("@setting");
    cy.wait("@setting"); //¯\_(ツ)_/¯

    cy.get('[data-cy="maps-for-user-box"]').should("not.contain", wmsName);
    cy.wait(1000);

    cy.get('[data-cy="delete-user-map-button"]').eq(0).click();
    cy.get('[data-cy="maps-for-user-box"]').should("not.exist");
  });
});
