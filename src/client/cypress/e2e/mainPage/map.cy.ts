import { showTableAndWaitForData, sortBy, verifyRowContains } from "../helpers/dataGridHelpers";
import { loginAsEditor, returnToOverview } from "../helpers/testHelpers";
import { WindowWithMaps } from "../helpers/window.ts";

describe("Map tests", () => {
  it("map preserves zoom level and center", () => {
    loginAsEditor();
    cy.wait("@borehole_filter_map");
    cy.get(".ol-viewport");

    // zoom in twice
    cy.get('[data-cy="zoom-in-button"]').click();
    cy.get('[data-cy="zoom-in-button"]').click();

    // drag map
    const canvas = () => cy.get("canvas");
    canvas().trigger("pointerdown", { x: 300, y: 300 });
    canvas().trigger("pointermove", { x: 500, y: 500 });
    canvas().trigger("pointerup", { x: 500, y: 500 });

    cy.window().then(win => {
      const window = win as WindowWithMaps;
      const view = window.olMap?.getView();
      const resolution = view?.getResolution();
      const mapCenter = view?.getCenter();
      cy.wrap(resolution).as("resolution");
      cy.wrap(mapCenter).as("mapCenter");
    });

    // navigate to settings
    cy.get('[data-cy="settings-button"]').click();

    // return to map
    returnToOverview();

    // verify resolution and map center
    cy.window().then(win => {
      const window = win as WindowWithMaps;
      const view = window.olMap?.getView();
      const resetResolution = view?.getResolution();
      const resetMapCenter = view?.getCenter();
      cy.get("@resolution").then(resolution => {
        expect(resolution).to.equal(resetResolution);
      });
      cy.get("@mapCenter").then(mapCenter => {
        expect(mapCenter).to.deep.equal(resetMapCenter);
      });
    });
  });

  it("keeps the map view and data when the table is sorted", () => {
    const mapView = (win: Window) => (win as WindowWithMaps).olMap?.getView();

    loginAsEditor();
    cy.wait("@borehole_filter_map");
    showTableAndWaitForData();

    cy.get('[data-cy="zoom-in-button"]').click();
    cy.get('[data-cy="zoom-in-button"]').click();
    cy.window()
      .then(win => mapView(win)?.getResolution())
      .as("resolution");
    cy.window()
      .then(win => mapView(win)?.getCenter())
      .as("center");

    cy.intercept({ method: "POST", pathname: "/api/v2/borehole/filter" }).as("sorted_filter");
    cy.intercept({ method: "POST", pathname: "/api/v2/borehole/filter/map" }).as("map_after_sort");

    sortBy("Name");
    cy.wait("@sorted_filter");
    verifyRowContains("Zelma Gorczany", 0);

    cy.get<number>("@resolution").then(resolution => {
      cy.window().should(win => expect(mapView(win)?.getResolution()).to.equal(resolution));
    });
    cy.get<number[]>("@center").then(center => {
      cy.window().should(win => expect(mapView(win)?.getCenter()).to.deep.equal(center));
    });
    cy.get("@map_after_sort.all").should("have.length", 0);
  });
});
