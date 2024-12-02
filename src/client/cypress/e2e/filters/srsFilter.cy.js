import { saveWithSaveBar } from "../helpers/buttonHelpers";
import { verifyPaginationText } from "../helpers/dataGridHelpers";
import { setSelect } from "../helpers/formHelpers";
import {
  loginAsAdmin,
  newEditableBorehole,
  returnToOverview,
  selectByDataCyAttribute,
  stopBoreholeEditing,
} from "../helpers/testHelpers.js";

describe("Tests for filtering data by reference system.", () => {
  function goToEditorLocationFilter() {
    selectByDataCyAttribute("settings-button").click();
    cy.contains("div", "Location filters").click();
  }

  it("can set filters as editor", () => {
    loginAsAdmin();
    selectByDataCyAttribute("show-filter-button").click();
    goToEditorLocationFilter();

    cy.contains("div", "Spatial reference system").children().first().children().first().as("checkbox");
    cy.get("@checkbox").check({ force: true });
    cy.get("@checkbox").should("be.checked");

    returnToOverview();
    selectByDataCyAttribute("show-filter-button").click();
    cy.contains("h6", "Location").click();
    selectByDataCyAttribute("spatial-reference-filter").should("exist");

    goToEditorLocationFilter();
    cy.get("@checkbox").uncheck({ force: true });
    cy.get("@checkbox").should("not.be.checked");

    returnToOverview();
    selectByDataCyAttribute("show-filter-button").click();
    cy.contains("h6", "Location").click();
    selectByDataCyAttribute("spatial-reference-filter").should("not.exist");
  });

  it("can filter by reference system", () => {
    newEditableBorehole().as("borehole_id");
    selectByDataCyAttribute("locationXLV03-formCoordinate").as("LV03X-input");
    selectByDataCyAttribute("locationXLV03-formCoordinate").as("LV03Y-input");

    setSelect("originalReferenceSystem", 1);

    cy.get("@LV03X-input").type("645778", { delay: 10 });
    cy.get("@LV03Y-input").type("245794", { delay: 10 });

    saveWithSaveBar();

    stopBoreholeEditing();
    returnToOverview();
    selectByDataCyAttribute("show-filter-button").click();

    cy.contains("h6", "Location").click();
    cy.get('[class="ui fitted toggle checkbox"]').eq(0).children().first().check({ force: true });
    selectByDataCyAttribute("radiobutton-all").click();
    verifyPaginationText("1–100 of 1627");

    selectByDataCyAttribute("spatial-reference-filter").should("exist");

    selectByDataCyAttribute("radiobutton-LV95").click();
    verifyPaginationText("1–100 of 813");

    selectByDataCyAttribute("radiobutton-LV03").click();
    verifyPaginationText("1–100 of 814");

    // click reset label
    selectByDataCyAttribute("reset-filter-button").click();
    verifyPaginationText("1–100 of 1627");
  });
});
