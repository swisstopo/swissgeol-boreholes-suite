import { addItem, saveWithSaveBar } from "../helpers/buttonHelpers";
import { clickOnRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers";
import { evaluateInput, evaluateSelect, setInput, setOriginalName, setSelect } from "../helpers/formHelpers";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers";
import {
  goToRouteAndAcceptTerms,
  newEditableBorehole,
  returnToOverview,
  startBoreholeEditing,
} from "../helpers/testHelpers";

function saveFormAndReturnToOverview() {
  saveWithSaveBar();
  returnToOverview();
}

function returnToFormAndStartEditing() {
  clickOnRowWithText("AAA_FELIX_THE_PANDA");
  startBoreholeEditing();
  navigateInSidebar(SidebarMenuItem.identifiers);
}

describe("Tests for the borehole 'IDs' edit page.", () => {
  it("adds, edits and deletes borehole identifiers with comments", () => {
    goToRouteAndAcceptTerms("/");
    newEditableBorehole().as("borehole_id");

    setOriginalName("AAA_FELIX_THE_PANDA");
    evaluateInput("name", "AAA_FELIX_THE_PANDA");

    // navigate to the new IDs tab
    navigateInSidebar(SidebarMenuItem.identifiers);

    // add Identifiers (with comments)
    addItem("addIdentifier");
    setSelect("boreholeCodelists.0.codelistId", 2); // codelistId 100000000
    setInput("boreholeCodelists.0.value", "pandas_for_life");
    setInput("boreholeCodelists.0.comment", "primary id");

    addItem("addIdentifier");
    setSelect("boreholeCodelists.1.codelistId", 1); // codelistId 100000004
    setInput("boreholeCodelists.1.value", "freedom_for_felix");
    // Leave comment empty for second identifier to verify it's optional

    // save and return
    saveFormAndReturnToOverview();
    showTableAndWaitForData();
    returnToFormAndStartEditing();

    evaluateInput("boreholeCodelists.0.value", "pandas_for_life");
    evaluateInput("boreholeCodelists.0.comment", "primary id");
    evaluateSelect("boreholeCodelists.0.codelistId", "ID GeODin-Shortname");
    evaluateInput("boreholeCodelists.1.value", "freedom_for_felix");
    evaluateInput("boreholeCodelists.1.comment", "");
    evaluateSelect("boreholeCodelists.1.codelistId", "ID Original");

    // edit identifier (value, codelist and comment)
    setSelect("boreholeCodelists.0.codelistId", 3); // ID InfoGeol
    setInput("boreholeCodelists.0.value", "we_must_stop_felix");
    setInput("boreholeCodelists.0.comment", "S.2; updated comment");

    // save and return
    saveFormAndReturnToOverview();
    returnToFormAndStartEditing();

    // first id is the (untouched) "freedom_for_felix" and the previously edited one moved to position 1
    evaluateInput("boreholeCodelists.0.value", "freedom_for_felix");
    evaluateSelect("boreholeCodelists.0.codelistId", "ID Original");
    evaluateInput("boreholeCodelists.0.comment", "");
    evaluateInput("boreholeCodelists.1.value", "we_must_stop_felix");
    evaluateInput("boreholeCodelists.1.comment", "S.2; updated comment");
    evaluateSelect("boreholeCodelists.1.codelistId", "ID InfoGeol");

    // delete identifier
    cy.get('[data-cy="boreholeCodelists.0.delete"]').click();
    // identifier on position 1 should now be on position 0
    evaluateInput("boreholeCodelists.0.value", "we_must_stop_felix");
    evaluateInput("boreholeCodelists.0.comment", "S.2; updated comment");
    evaluateSelect("boreholeCodelists.0.codelistId", "ID InfoGeol");

    saveFormAndReturnToOverview();
    returnToFormAndStartEditing();

    evaluateInput("boreholeCodelists.0.value", "we_must_stop_felix");
    evaluateInput("boreholeCodelists.0.comment", "S.2; updated comment");
    evaluateSelect("boreholeCodelists.0.codelistId", "ID InfoGeol");
  });
});
