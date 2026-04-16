import { addItem, saveWithSaveBar } from "../helpers/buttonHelpers";
import { evaluateInput, evaluateSelect, hasError, openDropdown, setInput, setSelect } from "../helpers/formHelpers";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers";
import { goToRouteAndAcceptTerms, newEditableBorehole } from "../helpers/testHelpers";

function createBoreholeAndNavigateToIdentifiers() {
  goToRouteAndAcceptTerms("/");
  newEditableBorehole().as("borehole_id");
  navigateInSidebar(SidebarMenuItem.identifiers);
}

describe("Tests for the borehole 'IDs' edit page.", () => {
  it("adds, edits and deletes borehole identifiers with comments", () => {
    createBoreholeAndNavigateToIdentifiers();

    // add Identifiers (with comments)
    addItem("addIdentifier");
    setSelect("boreholeCodelists.0.codelistId", 1); // GeODin ID (100000000)
    setInput("boreholeCodelists.0.value", "AA_PANDAs_for_life");
    setInput("boreholeCodelists.0.comment", "primary id");

    addItem("addIdentifier");
    setSelect("boreholeCodelists.1.codelistId", 0); // original ID (100000004)
    setInput("boreholeCodelists.1.value", "freedom_for_felix");
    // Leave comment empty for second identifier to verify it's optional

    evaluateInput("boreholeCodelists.0.value", "AA_PANDAs_for_life");
    evaluateInput("boreholeCodelists.0.comment", "primary id");
    evaluateSelect("boreholeCodelists.0.codelistId", "GeODin ID");
    evaluateInput("boreholeCodelists.1.value", "freedom_for_felix");
    evaluateInput("boreholeCodelists.1.comment", "");
    evaluateSelect("boreholeCodelists.1.codelistId", "original ID");

    // edit identifier (value, codelist and comment)
    setSelect("boreholeCodelists.0.codelistId", 1); // InfoGeol ID
    setInput("boreholeCodelists.0.value", "we_must_stop_felix");
    setInput("boreholeCodelists.0.comment", "S.2; updated comment");

    // the edited entry stays at index 0 (no save/return reordering)
    evaluateInput("boreholeCodelists.0.value", "we_must_stop_felix");
    evaluateInput("boreholeCodelists.0.comment", "S.2; updated comment");
    evaluateSelect("boreholeCodelists.0.codelistId", "GeODin ID");
    evaluateInput("boreholeCodelists.1.value", "freedom_for_felix");
    evaluateInput("boreholeCodelists.1.comment", "");
    evaluateSelect("boreholeCodelists.1.codelistId", "original ID");

    // delete identifier row at position 0
    cy.get('[data-cy="boreholeCodelists.0.delete"]').click();
    // identifier on position 1 should now be on position 0
    evaluateInput("boreholeCodelists.0.value", "freedom_for_felix");
    evaluateInput("boreholeCodelists.0.comment", "");
    evaluateSelect("boreholeCodelists.0.codelistId", "original ID");

    evaluateInput("boreholeCodelists.0.value", "freedom_for_felix");
    evaluateInput("boreholeCodelists.0.comment", "");
    evaluateSelect("boreholeCodelists.0.codelistId", "original ID");
  });

  it("deletes an entire identifier card with all its rows", () => {
    createBoreholeAndNavigateToIdentifiers();

    // add two identifiers of different types
    addItem("addIdentifier");
    setSelect("boreholeCodelists.0.codelistId", 2);
    setInput("boreholeCodelists.0.value", "card_value_1");

    addItem("addIdentifier");
    setSelect("boreholeCodelists.1.codelistId", 1);
    setInput("boreholeCodelists.1.value", "card_value_2");

    saveWithSaveBar();

    // delete entire first card
    cy.get('[data-cy="boreholeCodelists.0.deleteCard"]').click();

    // only the second identifier should remain (now at index 0)
    evaluateInput("boreholeCodelists.0.value", "card_value_2");
    evaluateInput("boreholeCodelists.0.value", "card_value_2");

    // first card should not exist anymore
    cy.get('[data-cy="boreholeCodelists.1.value-formInput"]').should("not.exist");
  });

  it("validates required fields and prevents saving with errors", () => {
    createBoreholeAndNavigateToIdentifiers();

    // add an identifier without filling required fields
    addItem("addIdentifier");

    // attempt to save to trigger validation (mode: "onChange" only shows errors after interaction)
    cy.dataCy("save-button").click();

    // codelistId and value are required, comment is optional
    hasError("boreholeCodelists.0.codelistId", true);
    hasError("boreholeCodelists.0.value", true);
    hasError("boreholeCodelists.0.comment", false);

    // fill only the codelist, value should still show error
    setSelect("boreholeCodelists.0.codelistId", 0);
    hasError("boreholeCodelists.0.codelistId", false);
    hasError("boreholeCodelists.0.value", true);

    // fill value, form should now be valid
    setInput("boreholeCodelists.0.value", "valid_value");
    hasError("boreholeCodelists.0.value", false);
    cy.dataCy("save-button").should("not.be.disabled");
  });

  it("adds multiple ID codes per identifier type using the add row button", () => {
    createBoreholeAndNavigateToIdentifiers();

    // add first identifier
    addItem("addIdentifier");
    setSelect("boreholeCodelists.0.codelistId", 1); // GeODin ID
    setInput("boreholeCodelists.0.value", "first_code");
    setInput("boreholeCodelists.0.comment", "first comment");

    // add a second row within the same identifier type card
    cy.get('[data-cy="add-id-button"]').click();
    setInput("boreholeCodelists.1.value", "second_code");
    setInput("boreholeCodelists.1.comment", "second comment");

    evaluateInput("boreholeCodelists.0.value", "first_code");
    evaluateInput("boreholeCodelists.0.comment", "first comment");
    evaluateInput("boreholeCodelists.1.value", "second_code");
    evaluateInput("boreholeCodelists.1.comment", "second comment");
    // both should have the same codelist type
    evaluateSelect("boreholeCodelists.0.codelistId", "GeODin ID");
  });

  it("ensures each identifier type can only be selected once", () => {
    createBoreholeAndNavigateToIdentifiers();

    // add first identifier with a specific type
    addItem("addIdentifier");
    setSelect("boreholeCodelists.0.codelistId", 0); // original ID (100000004)

    // add second identifier
    addItem("addIdentifier");

    // open the dropdown for the second identifier's codelistId
    const selector = '[data-cy="boreholeCodelists.1.codelistId-formSelect"]';
    openDropdown(selector);

    // the already selected type (original ID) should not be available in the dropdown
    cy.get('.MuiPaper-elevation [role="listbox"]').within(() => {
      cy.contains("original ID").should("not.exist");
    });

    // close dropdown by pressing escape
    cy.get("body").type("{esc}");
  });
});
