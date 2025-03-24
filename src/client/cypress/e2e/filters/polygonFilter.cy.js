import { goToRouteAndAcceptTerms } from "../helpers/testHelpers.js";

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
  cy.get('[data-cy="boreholes-number-preview"]').should("not.have.text", "1'626"); // exact number can vary based on screen.
  cy.get('[data-cy="polygon-filter-chip"]').should("exist");
  cy.get('[data-cy="polygon-filter-badge"]').should("exist");
}

function assertPolygonFilterInactive() {
  cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "1'626");
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
    cy.wait("@borehole_geojson");
    cy.get('[data-cy="show-filter-button"]').click();

    assertPolygonFilterInactive();

    cy.get('[data-cy="polygon-filter-button"]').click();
    assertPolygonFilterActive();
    drawPolygon();
    assertIsFilteredByPolygon();

    // click delete icon
    cy.get('[data-cy="polygon-filter-chip"]').children().eq(1).click();

    assertPolygonFilterInactive();
    cy.wait("@borehole_geojson");
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
});
