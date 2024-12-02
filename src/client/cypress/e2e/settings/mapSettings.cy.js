import { goToRouteAndAcceptTerms, returnToOverview, selectByDataCyAttribute } from "../helpers/testHelpers.js";

describe("map settings", () => {
  it("Adds wms and wmts to user maps", () => {
    goToRouteAndAcceptTerms("/setting");

    const wmsName = "Army logistics centres (ALC)";
    const wmtsName = "Wetness potential agricultural land";

    cy.contains("Map").click();
    // Add WMS
    selectByDataCyAttribute("load-layers-button").click();
    selectByDataCyAttribute("wms-list-box").contains(wmsName);
    selectByDataCyAttribute("maps-for-user-box").should("not.exist");
    cy.contains("div.selectable", wmsName).find('[data-cy="add-layer-button"]').click();
    cy.wait("@setting");
    selectByDataCyAttribute("maps-for-user-box").contains(wmsName);

    // Select WMTS from Dropdown
    cy.get('[role="combobox"]').click();
    cy.get('div[role="option"]').last().click();

    // Add WMTS
    selectByDataCyAttribute("load-layers-button").click();
    selectByDataCyAttribute("wmts-list-box").contains(wmtsName);
    cy.contains("div.selectable", wmtsName).find('[data-cy="add-layer-button"]').click();
    cy.wait("@setting");
    selectByDataCyAttribute("maps-for-user-box").contains(wmtsName);

    // Verify layers are added to overview map
    returnToOverview();
    selectByDataCyAttribute("layers-button").click();
    cy.contains(wmsName);
    cy.contains(wmtsName);

    // Reload page to verify layers are correctly added
    cy.reload(true);
    goToRouteAndAcceptTerms("/");

    // Remove layers
    selectByDataCyAttribute("settings-button").click();
    cy.contains("Map").click();
    cy.wait(1000);
    selectByDataCyAttribute("maps-for-user-box").contains(wmtsName);
    selectByDataCyAttribute("maps-for-user-box").contains(wmsName);
    selectByDataCyAttribute("delete-user-map-button").eq(0).click();
    cy.wait("@setting");
    cy.wait("@setting");
    cy.wait("@setting"); //¯\_(ツ)_/¯

    selectByDataCyAttribute("maps-for-user-box").should("not.contain", wmsName);
    cy.wait(1000);

    selectByDataCyAttribute("delete-user-map-button").eq(0).click();
    selectByDataCyAttribute("maps-for-user-box").should("not.exist");
  });
});
