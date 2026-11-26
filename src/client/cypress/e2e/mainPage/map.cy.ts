import type Feature from "ol/Feature";
import type Point from "ol/geom/Point";
import type VectorLayer from "ol/layer/Vector";
import { showTableAndWaitForData, sortBy, verifyRowContains } from "../helpers/dataGridHelpers";
import { loginAsEditor, returnToOverview } from "../helpers/testHelpers";
import { WindowWithMaps } from "../helpers/window.ts";

// The seed data moves borehole 1'000'008 to the coordinates of 1'000'047, so the map draws them as one badge.
const badgeBoreholeIds = [1_000_008, 1_000_047];

// The OpenLayers objects come from the application's bundle, so they are not instances of the classes imported here.
const findBadgeCoordinates = (win: Window) => {
  const pointLayer = (win as WindowWithMaps).olMap
    ?.getLayers()
    .getArray()
    .find(layer => layer.get("name") === "points") as VectorLayer | undefined;
  const badge = pointLayer
    ?.getSource()
    ?.getFeatures()
    .find(feature => {
      const boreholes = feature.get("features") as Feature[] | undefined;
      return boreholes?.some(borehole => badgeBoreholeIds.includes(borehole.get("id") as number));
    });
  return (badge?.getGeometry() as Point | undefined)?.getCoordinates();
};

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

  it("keeps the legend theme after visiting a borehole", () => {
    const legendTitle = () => cy.get('[data-cy="map-legend-title"]');

    loginAsEditor();
    cy.wait("@borehole_filter_map");
    legendTitle().invoke("text").as("initialTitle", { type: "static" });

    cy.get('[data-cy="map-legend-switch"]').click();
    cy.location("search").should("contain", "legend=boreholeType");
    cy.get<string>("@initialTitle").then(initialTitle => legendTitle().should("not.have.text", initialTitle));
    legendTitle().invoke("text").as("switchedTitle", { type: "static" });

    showTableAndWaitForData();
    cy.get(".MuiDataGrid-row").first().click();
    cy.location("pathname").should("match", /^\/\d+/);

    returnToOverview();
    cy.get<string>("@switchedTitle").then(switchedTitle => legendTitle().should("have.text", switchedTitle));
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

  it("lists the boreholes of a badge and opens one of them", () => {
    loginAsEditor();
    cy.wait("@borehole_filter_map");

    // At the highest zoom level, the boreholes a few metres around the badge do not overlap it.
    cy.window()
      .should(win => expect(findBadgeCoordinates(win)).to.have.length(2))
      .then(win => {
        const map = (win as WindowWithMaps).olMap!;
        const coordinates = findBadgeCoordinates(win)!;
        map.getView().setCenter(coordinates);
        map.getView().setResolution(0.1);
        map.renderSync();
        return map.getPixelFromCoordinate(coordinates);
      })
      .as("badgePixel");

    cy.get<number[]>("@badgePixel").then(([x, y]) => {
      cy.get(".ol-viewport").trigger("pointermove", x, y);
    });
    cy.dataCy("map-popover-preview").find("li").should("have.length", 2);

    cy.get<number[]>("@badgePixel").then(([x, y]) => {
      cy.get(".ol-viewport").click(x, y);
    });
    cy.dataCy("map-popover").find('[data-cy="map-popover-row"]').should("have.length", 2);

    cy.dataCy("map-popover-row").first().click();
    cy.location("pathname").should("match", /^\/(1000008|1000047)\b/);
  });
});
