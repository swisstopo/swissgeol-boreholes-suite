import { loginAsEditor } from "../helpers/testHelpers.js";

describe("Map tests", () => {
  it("map preserves zoom level and center", () => {
    loginAsEditor();
    cy.wait("@borehole_geojson");
    cy.get(".ol-viewport");

    // zoom in twice
    cy.get('[data-cy="zoom-in-button"]').click();
    cy.get('[data-cy="zoom-in-button"]').click();

    // drag map
    const canvas = cy.get("canvas");
    canvas.trigger("pointerdown", { x: 300, y: 300 });
    canvas.trigger("pointermove", { x: 500, y: 500 });
    canvas.trigger("pointerup", { x: 500, y: 500 });

    cy.window().then(win => {
      const view = win.olMap.getView();
      const resolution = view.getResolution();
      const mapCenter = view.getCenter();
      cy.wrap(resolution).as("resolution");
      cy.wrap(mapCenter).as("mapCenter");
    });

    // navigate to settings
    cy.get('[data-cy="settings-button"]').click();

    // return to map
    cy.contains("h3", "Done").click();

    // verify resolution and map center
    cy.window().then(win => {
      const view = win.olMap.getView();
      const resetResolution = view.getResolution();
      const resetMapCenter = view.getCenter();
      cy.get("@resolution").then(resolution => {
        expect(resolution).to.equal(resetResolution);
      });
      cy.get("@mapCenter").then(mapCenter => {
        expect(mapCenter).to.deep.equal(resetMapCenter);
      });
    });
  });
});
