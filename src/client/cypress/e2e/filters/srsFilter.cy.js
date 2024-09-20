import { loginAsAdmin, newEditableBorehole, returnToOverview, stopBoreholeEditing } from "../helpers/testHelpers.js";
import { verifyPaginationText } from "../helpers/dataGridHelpers";
import { setSelect } from "../helpers/formHelpers";

describe("Tests for filtering data by reference system.", () => {
  function goToEditorLocationFilter() {
    cy.get('[data-cy="settings-button"]').click();
    cy.contains("div", "Location filters").click();
  }

  it("can set filters as editor", () => {
    loginAsAdmin();
    cy.get('[data-cy="show-filter-button"]').click();
    goToEditorLocationFilter();

    cy.contains("div", "Spatial reference system").children().first().children().first().as("checkbox");
    cy.get("@checkbox").check({ force: true });
    cy.get("@checkbox").should("be.checked");

    cy.contains("h3", "Done").click();
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("h6", "Location").click();
    cy.get('[data-cy="spatial-reference-filter"]').should("exist");

    goToEditorLocationFilter();
    cy.get("@checkbox").uncheck({ force: true });
    cy.get("@checkbox").should("not.be.checked");

    cy.contains("h3", "Done").click();
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("h6", "Location").click();
    cy.get('[data-cy="spatial-reference-filter"]').should("not.exist");
  });

  it("can filter by reference system", () => {
    newEditableBorehole().as("borehole_id");
    cy.get('[data-cy="location_x_lv03-formCoordinate"]').as("LV03X-input");
    cy.get('[data-cy="location_y_lv03-formCoordinate"]').as("LV03Y-input");

    setSelect("spatial_reference_system", 1);

    cy.get("@LV03X-input").type("645778", { delay: 10 });
    cy.get("@LV03Y-input").type("245794", { delay: 10 });

    cy.wait(["@edit_patch", "@edit_patch", "@edit_patch", "@edit_patch"]);

    stopBoreholeEditing();
    returnToOverview();
    cy.get('[data-cy="show-filter-button"]').click();

    cy.contains("h6", "Location").click();
    cy.get('[class="ui fitted toggle checkbox"]').eq(0).children().first().check({ force: true });
    cy.get('[data-cy="radiobutton-all"]').click();
    verifyPaginationText("1–100 of 1627");

    cy.get('[data-cy="spatial-reference-filter"]').should("exist");

    cy.get('[data-cy="radiobutton-LV95"]').click();
    verifyPaginationText("1–100 of 813");

    cy.get('[data-cy="radiobutton-LV03"]').click();
    verifyPaginationText("1–100 of 814");

    // click reset label
    cy.get('[data-cy="reset-filter-button"]').click();
    verifyPaginationText("1–100 of 1627");
  });
});
