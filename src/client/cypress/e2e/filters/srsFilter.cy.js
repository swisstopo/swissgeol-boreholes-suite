import { loginAsAdmin, newEditableBorehole } from "../helpers/testHelpers.js";

describe("Tests for filtering data by reference system.", () => {
  function goToEditorLocationFilter() {
    cy.get('[data-cy="settings-button"]').click();
    cy.contains("div", "Location filters").click();
  }

  it("can set filters as editor", () => {
    loginAsAdmin();
    cy.visit("/");
    cy.get('[data-cy="show-filter-button"]').click();
    goToEditorLocationFilter();

    cy.contains("div", "Spatial reference system").children().first().children().first().as("checkbox");
    cy.get("@checkbox").check({ force: true });
    cy.get("@checkbox").should("be.checked");

    cy.get('[data-cy="backButton"]').click();
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("h6", "Location").click();
    cy.get('[data-cy="spatial-reference-filter"]').should("exist");

    goToEditorLocationFilter();
    cy.get("@checkbox").uncheck({ force: true });
    cy.get("@checkbox").should("not.be.checked");

    cy.get('[data-cy="backButton"]').click();
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("h6", "Location").click();
    cy.get('[data-cy="spatial-reference-filter"]').should("not.exist");
  });

  it("can filter by reference system", () => {
    newEditableBorehole().as("borehole_id");
    cy.get('[data-cy="LV03X"]').as("LV03X-input");
    cy.get('[data-cy="LV03Y"]').as("LV03Y-input");

    cy.get("input[value=20104002]").click();

    cy.get("@LV03X-input").type("645778", { delay: 10 });
    cy.get("@LV03Y-input").type("245794", { delay: 10 });

    cy.wait(["@edit_patch", "@edit_patch", "@edit_patch", "@edit_patch"]);

    cy.contains("a", "Stop editing").click();
    cy.wait("@edit_unlock");
    cy.get('[data-cy="backButton"]').click();
    cy.wait(["@edit_list", "@borehole"]);
    cy.get('[data-cy="show-filter-button"]').click();

    cy.contains("h6", "Location").click();
    cy.get('[class="ui fitted toggle checkbox"]').eq(0).children().first().check({ force: true });
    cy.get('[data-cy="radiobutton-all"]').click();
    cy.get("tbody").children().should("have.length", 100);

    cy.get('[data-cy="spatial-reference-filter"]').should("exist");

    cy.get('[data-cy="radiobutton-LV95"]').click();
    cy.get("tbody").children().should("have.length", 100);

    cy.get('[data-cy="radiobutton-LV03"]').click();
    cy.get("tbody").children().should("have.length", 100);

    // click reset label
    cy.get('[data-cy="reset-filter-button"]').click();
    cy.get("tbody").children().should("have.length", 100);
  });
});
