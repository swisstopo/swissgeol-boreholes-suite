import type Feature from "ol/Feature";
import type Point from "ol/geom/Point";
import type VectorLayer from "ol/layer/Vector";
import type VectorSource from "ol/source/Vector";
import { showTableAndWaitForData, sortBy, verifyRowContains } from "../helpers/dataGridHelpers";
import { loginAsEditor, returnToOverview } from "../helpers/testHelpers";
import { WindowWithMaps } from "../helpers/window.ts";

// The seed data moves borehole 1'000'008 to the coordinates of 1'000'047, so the map draws them as one badge, and six
// more boreholes a few metres around them.
const badgeBoreholeIds = [1_000_008, 1_000_047];

const getMap = (win: Window) => (win as WindowWithMaps).olMap!;

// The OpenLayers objects come from the application's bundle, so they are not instances of the classes imported here.
const findBadge = (win: Window) => {
  const pointLayer = getMap(win)
    .getLayers()
    .getArray()
    .find(layer => layer.get("name") === "points") as VectorLayer<VectorSource<Feature>> | undefined;
  const badge = pointLayer
    ?.getSource()
    ?.getFeatures()
    .find(feature => {
      const boreholes = feature.get("features") as Feature[] | undefined;
      return boreholes?.some(borehole => badgeBoreholeIds.includes(borehole.get("id") as number));
    });
  if (!badge) return undefined;
  return {
    coordinates: (badge.getGeometry() as Point).getCoordinates(),
    boreholeCount: (badge.get("features") as Feature[]).length,
  };
};

const atBadge = (action: (x: number, y: number) => void) => {
  cy.window().then(win => {
    const map = getMap(win);
    map.renderSync();
    const [x, y] = map.getPixelFromCoordinate(findBadge(win)!.coordinates);
    action(x, y);
  });
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

  it("zooms into a badge with nearby boreholes and lists the boreholes at its location", () => {
    loginAsEditor();
    cy.wait("@borehole_filter_map");

    // At 0.5 m per pixel, the badge takes in the six boreholes around it, which it touches.
    cy.window()
      .should(win => expect(findBadge(win)).to.exist)
      .then(win => {
        const view = getMap(win).getView();
        view.setCenter(findBadge(win)!.coordinates);
        view.setResolution(0.5);
      });
    cy.window().should(win => expect(findBadge(win)?.boreholeCount).to.equal(8));

    // Its click zooms in like a cluster, up to the closest zoom, where only the boreholes at its location remain.
    atBadge((x, y) => {
      cy.get(".ol-viewport").click(x, y);
    });
    cy.window().should(win => {
      const view = getMap(win).getView();
      expect(view.getAnimating()).to.equal(false);
      expect(view.getResolution()).to.equal(view.getMinResolution());
      expect(findBadge(win)?.boreholeCount).to.equal(2);
    });

    atBadge((x, y) => {
      cy.get(".ol-viewport").trigger("pointermove", x, y);
    });
    cy.dataCy("map-popover-preview").find("li").should("have.length", 2);

    atBadge((x, y) => {
      cy.get(".ol-viewport").click(x, y);
    });
    cy.dataCy("map-popover").find('[data-cy="map-popover-row"]').should("have.length", 2);

    cy.dataCy("map-popover-row").first().click();
    cy.location("pathname").should("match", /^\/(1000008|1000047)\b/);
  });
});
