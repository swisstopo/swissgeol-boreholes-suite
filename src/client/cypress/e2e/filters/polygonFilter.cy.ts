import { checkFilterChipExistsAndRemove, clickYesNoButton } from "../helpers/filterHelpers";
import { goToRouteAndAcceptTerms } from "../helpers/testHelpers";

const buttonInactiveColor = "rgb(255, 255, 255)";
const buttonActiveColor = "rgb(214, 226, 230)";

function drawPolygon() {
  const canvas = () => cy.get("canvas");
  canvas().trigger("pointerdown", { x: 450, y: 300 }).trigger("pointerup", { x: 450, y: 300 });
  canvas().trigger("pointerdown", { x: 550, y: 810 }).trigger("pointerup", { x: 550, y: 810 });
  canvas().trigger("pointerdown", { x: 640, y: 810 }).trigger("pointerup", { x: 640, y: 810 });
  canvas().trigger("pointerdown", { x: 450, y: 300 }).trigger("pointerup", { x: 450, y: 300 });
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(2000);
}

function assertIsFilteredByPolygon() {
  cy.get('[data-cy="boreholes-number-preview"]').should("not.have.text", "100"); // exact number can vary based on screen.
  cy.get('[data-cy="polygon-filter-chip"]').should("exist");
  cy.get('[data-cy="polygon-filter-badge"]').should("exist");
}

function assertPolygonFilterInactive() {
  cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "100");
  cy.get('[data-cy="polygon-filter-chip"]').should("not.exist");
  cy.get('[data-cy="polygon-filter-badge"]').should("not.exist");
}

function assertPolygonFilterActive() {
  cy.get('[data-cy="polygon-filter-button"]').should("have.css", "background-color", buttonActiveColor);
  cy.get('[data-cy="polygon-filter-chip"]').should("not.exist");
  cy.get('[data-cy="polygon-filter-badge"]').should("not.exist");
}

describe("Polygon filter tests", () => {
  it("draws polygon and asserts filtering", () => {
    goToRouteAndAcceptTerms("/");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);
    cy.wait("@borehole_filter");
    cy.get('[data-cy="show-filter-button"]').click();

    assertPolygonFilterInactive();

    cy.get('[data-cy="polygon-filter-button"]').click();
    assertPolygonFilterActive();
    drawPolygon();
    assertIsFilteredByPolygon();
    cy.location("search").should("contain", "polygon=");

    // click delete icon
    cy.get('[data-cy="polygon-filter-chip"]').children().eq(1).click();

    assertPolygonFilterInactive();
    cy.wait("@borehole_filter");
    // wait for map to redraw
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // Redraw polygon
    cy.get('[data-cy="polygon-filter-button"]').click();
    drawPolygon();
    assertIsFilteredByPolygon();

    // click reset button
    cy.get('[data-cy="reset-filter-button"]').click();
    assertPolygonFilterInactive();
    cy.get('[data-cy="polygon-filter-button"]').should("have.css", "background-color", buttonInactiveColor);
  });

  it("keeps the polygon in the URL and restores its boreholes when another filter is removed", () => {
    // Only requests with a polygon get an alias: the prefetch after login reads the filters from the empty session.
    // The filter alias changes before the reload, because waits yield the aliased requests in order and the
    // requests in between are never waited on.
    let filterAlias = "polygon_filter";
    const aliasRequestsWithPolygon = (getAlias: () => string) => (req: { body: unknown; alias?: string }) => {
      // The request body is untyped JSON.
      if ((req.body as { polygon?: unknown }).polygon) req.alias = getAlias();
    };
    cy.intercept(
      { method: "POST", pathname: "/api/v2/borehole/filter" },
      aliasRequestsWithPolygon(() => filterAlias),
    );
    cy.intercept(
      { method: "POST", pathname: "/api/v2/borehole/filter/stats" },
      aliasRequestsWithPolygon(() => "polygon_filter_stats"),
    );
    // The western half of the seed data, a fixed area unlike a drawn polygon: some but not all of its boreholes
    // have national interest.
    goToRouteAndAcceptTerms("/?polygon=2480000,1070000,2650000,1070000,2650000,1310000,2480000,1310000");
    cy.get('[data-cy="show-filter-button"]').click();
    assertIsFilteredByPolygon();
    cy.wait("@polygon_filter")
      .its("request.body")
      .should((body: { polygon?: { type: string } }) => {
        expect(body.polygon?.type).to.equal("Polygon");
        expect(body).not.to.have.property("ids");
      });
    cy.wait("@polygon_filter_stats").its("request.body.polygon.type").should("equal", "Polygon");
    cy.location("search").should("contain", "polygon=");
    cy.dataCy("boreholes-number-preview").should("have.text", "33");

    cy.contains("Borehole").click();
    clickYesNoButton("nationalInterest", "yes");
    cy.dataCy("filter-chip-nationalInterest").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "3");

    checkFilterChipExistsAndRemove("nationalInterest");

    cy.dataCy("boreholes-number-preview").should("have.text", "33");
    cy.get('[data-cy="polygon-filter-chip"]').should("exist");

    cy.then(() => {
      filterAlias = "polygon_filter_after_reload";
    });
    cy.reload();
    cy.wait("@polygon_filter_after_reload").its("request.body.polygon.type").should("equal", "Polygon");
    cy.dataCy("boreholes-number-preview").should("have.text", "33");
  });
});
