import { setSelect } from "../helpers/formHelpers";
import { bearerAuth, goToRouteAndAcceptTerms, returnToOverview } from "../helpers/testHelpers";

describe("map settings", () => {
  // Clear any user-map entries the test added
  afterEach(() => {
    cy.get("@access_token").then(token => {
      cy.request({
        method: "PUT",
        url: "/api/v2/user/self/maplayers",
        auth: bearerAuth(token),
        body: {},
      });
    });
  });

  it("Adds wms and wmts to user maps", () => {
    // Stub geo.admin.ch GetCapabilities so the test does not depend on the live service,
    // which is intermittently broken (MapServer "Unable to access file" errors).
    cy.fixture("wmsCapabilities.xml").then(wmsXml => {
      cy.intercept(/^https:\/\/wms\.geo\.admin\.ch/, {
        statusCode: 200,
        headers: { "Content-Type": "application/xml" },
        body: wmsXml,
      }).as("wmsCapabilities");
    });
    cy.fixture("wmtsCapabilities.xml").then(wmtsXml => {
      cy.intercept(/^https:\/\/wmts\.geo\.admin\.ch/, {
        statusCode: 200,
        headers: { "Content-Type": "application/xml" },
        body: wmtsXml,
      }).as("wmtsCapabilities");
    });

    goToRouteAndAcceptTerms("/setting");

    const wmsName = "Army logistics centres (ALC)";
    const wmtsName = "Wetness potential agricultural land";

    cy.dataCy("map-tab").click();
    // Add WMS
    cy.get('[data-cy="load-layers-button"]').click();
    cy.wait("@wmsCapabilities");
    cy.get('[data-cy="wms-list-box"]').contains(wmsName);
    cy.get('[data-cy="maps-for-user-box"]').should("not.exist");
    cy.contains("div.selectable", wmsName).find('[data-cy="add-layer-button"]').click();
    cy.wait("@setting");
    cy.get('[data-cy="maps-for-user-box"]').contains(wmsName);

    // Select WMTS from Dropdown
    setSelect("capabilities", 1);

    // Add WMTS
    cy.get('[data-cy="load-layers-button"]').click();
    cy.wait("@wmtsCapabilities");
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
    cy.dataCy("settings-button").click();
    cy.dataCy("map-tab").click();
    cy.get('[data-cy="maps-for-user-box"]').contains(wmtsName);
    cy.get('[data-cy="maps-for-user-box"]').contains(wmsName);
  });
});
