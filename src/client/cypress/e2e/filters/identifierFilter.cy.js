import { addItem, saveWithSaveBar } from "../helpers/buttonHelpers";
import { checkAllVisibleRows, verifyPaginationText } from "../helpers/dataGridHelpers";
import { setInput, setSelect } from "../helpers/formHelpers";
import { newEditableBorehole, returnToOverview, stopBoreholeEditing } from "../helpers/testHelpers.js";

describe("Tests for filtering data by identifier.", () => {
  it("can filter by identifier", () => {
    newEditableBorehole().as("borehole_id");

    addItem("addIdentifier");
    setSelect("boreholeCodelists.0.codelistId", 1);
    setInput("boreholeCodelists.0.value", 819544732);
    saveWithSaveBar();

    stopBoreholeEditing();
    returnToOverview();
    cy.get('[data-cy="show-filter-button"]').click();

    cy.contains("h6", "Location").click();
    // show all options
    cy.get('[class="ui fitted toggle checkbox"]').eq(0).children().first().check({ force: true });

    verifyPaginationText("1–100 of 1627");

    cy.get('[data-cy="domain-dropdown"]')
      .first()
      .click({ force: true })
      .find('[role="option"]')
      .eq(1)
      .click({ force: true });

    verifyPaginationText("1–1 of 1");
    // click reset label
    cy.get('[data-cy="reset-filter-button"]').click();
    verifyPaginationText("1–100 of 1627");
  });

  it("can bulk edit boreholes while filter by identifier is set", () => {
    newEditableBorehole().as("borehole_id");
    addItem("addIdentifier");
    setSelect("boreholeCodelists.0.codelistId", 1);
    setInput("boreholeCodelists.0.value", 64531274);
    saveWithSaveBar();

    stopBoreholeEditing();
    returnToOverview();

    newEditableBorehole().as("borehole_id_2");
    addItem("addIdentifier");
    setSelect("boreholeCodelists.0.codelistId", 1);
    setInput("boreholeCodelists.0.value", 436584127);
    saveWithSaveBar();

    stopBoreholeEditing();
    returnToOverview();
    cy.get('[data-cy="show-filter-button"]').click();

    cy.contains("h6", "Location").click();
    // show all options
    cy.get('[class="ui fitted toggle checkbox"]').eq(0).children().first().check({ force: true });

    cy.get('[data-cy="domain-dropdown"]')
      .first()
      .click({ force: true })
      .find('[role="option"]')
      .eq(1)
      .click({ force: true });
    verifyPaginationText("1–2 of 2");
    checkAllVisibleRows();
    cy.contains("button", "Bulk editing").click({ force: true });

    // Bulk edit dialog should open.
    cy.get("[data-cy='bulk-edit-accordion']").should("have.length", 19);
    cy.contains("button", "Cancel").click();

    // click reset label
    cy.get('[data-cy="reset-filter-button"]').click();
  });
});
