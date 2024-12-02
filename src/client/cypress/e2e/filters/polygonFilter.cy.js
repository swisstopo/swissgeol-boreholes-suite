import { loginAsAdmin, selectByDataCyAttribute } from "../helpers/testHelpers.js";

const buttonInactiveColor = "rgb(255, 255, 255)";
const buttonActiveColor = "rgb(214, 226, 230)";

function drawPolygon() {
  const canvas = cy.get("canvas");
  canvas.trigger("pointerdown", { x: 450, y: 300 }).trigger("pointerup", { x: 450, y: 300 });
  canvas.trigger("pointerdown", { x: 550, y: 810 }).trigger("pointerup", { x: 550, y: 810 });
  canvas.trigger("pointerdown", { x: 640, y: 810 }).trigger("pointerup", { x: 640, y: 810 });
  canvas.trigger("pointerdown", { x: 450, y: 300 }).trigger("pointerup", { x: 450, y: 300 });
  cy.wait(2000);
}

function assertIsFilteredByPolygon() {
  selectByDataCyAttribute("boreholes-number-preview").should("not.have.text", "1'626"); // exact number can vary based on screen.
  selectByDataCyAttribute("polygon-filter-chip").should("exist");
  selectByDataCyAttribute("polygon-filter-badge").should("exist");
}

function assertPolygonFilterInactive() {
  selectByDataCyAttribute("boreholes-number-preview").should("have.text", "1'626");
  selectByDataCyAttribute("polygon-filter-chip").should("not.exist");
  selectByDataCyAttribute("polygon-filter-badge").should("not.exist");
}

function assertPolygonFilterActive() {
  const polygonFilterButton = selectByDataCyAttribute("polygon-filter-button");
  polygonFilterButton.should("have.css", "background-color", buttonActiveColor);
  selectByDataCyAttribute("polygon-filter-chip").should("not.exist");
  selectByDataCyAttribute("polygon-filter-badge").should("not.exist");
}

describe("Polygon filter tests", () => {
  it("draws polygon and asserts filtering", () => {
    loginAsAdmin();
    cy.wait(5000);
    cy.wait("@borehole_geojson");
    selectByDataCyAttribute("show-filter-button").click();

    assertPolygonFilterInactive();

    selectByDataCyAttribute("polygon-filter-button").click();
    assertPolygonFilterActive();
    drawPolygon();
    assertIsFilteredByPolygon();

    // click delete icon
    selectByDataCyAttribute("polygon-filter-chip").children().eq(1).click();

    assertPolygonFilterInactive();
    cy.wait("@borehole_geojson");
    // wait for map to redraw
    cy.wait(2000);

    // Redraw polygon
    selectByDataCyAttribute("polygon-filter-button").click();
    drawPolygon();
    assertIsFilteredByPolygon();

    // click reset button
    selectByDataCyAttribute("reset-filter-button").click();
    assertPolygonFilterInactive();
    selectByDataCyAttribute("polygon-filter-button").should("have.css", "background-color", buttonInactiveColor);
  });
});
