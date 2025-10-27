import { discardChanges, saveWithSaveBar } from "../helpers/buttonHelpers.js";
import {
  checkAllVisibleRows,
  checkRowWithIndex,
  checkTwoFirstRows,
  clickOnRowWithText,
  sortBy,
  uncheckAllVisibleRows,
  verifyRowContains,
  verifyRowWithTextCheckState,
  verifyTableLength,
} from "../helpers/dataGridHelpers.js";
import {
  evaluateInput,
  evaluateMultiSelect,
  evaluateSelect,
  evaluateTextarea,
  hasError,
  setInput,
  setSelect,
  toggleMultiSelect,
} from "../helpers/formHelpers.js";
import { isActiveMenuItem, navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers.js";
import {
  createBorehole,
  goToDetailRouteAndAcceptTerms,
  handlePrompt,
  startBoreholeEditing,
} from "../helpers/testHelpers";

// TODO: Remove rule once logic is implemented with https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2361
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertExportButtonsDisabled(isDisabled = true) {
  // TODO: Re-add once logic is implemented with https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2361
  // cy.dataCy("exportdata-button").should(isDisabled ? "have.attr" : "not.have.attr", "disabled");
  // cy.dataCy("exporttable-button").should(isDisabled ? "have.attr" : "not.have.attr", "disabled");
}

function assertCountDisplayed(textContent) {
  cy.dataCy("log-run-count").should("contain", textContent);
}

function verifyFullRowContent(cellContents, index) {
  for (const content of cellContents) {
    verifyRowContains(content, index);
  }
}

function addMinimalLogRun(fromDepth = 0, toDepth = 10, runNumber = "R01") {
  cy.dataCy("addlogrun-button").click();
  setInput("fromDepth", fromDepth);
  setInput("toDepth", toDepth);
  setInput("runNumber", runNumber);
  cy.dataCy("close-button").click();
}

describe("Test for the borehole log.", () => {
  it("Correctly displays log run table", () => {
    goToDetailRouteAndAcceptTerms(`/1000070/log?dev=true`);
    assertExportButtonsDisabled();
    cy.dataCy("delete-button").should("not.exist");
    assertCountDisplayed("10 runs");

    startBoreholeEditing();
    assertExportButtonsDisabled();
    cy.dataCy("delete-button").should("be.visible");
    cy.dataCy("delete-button").should("have.attr", "disabled");

    checkAllVisibleRows();
    assertCountDisplayed("10 selected");
    uncheckAllVisibleRows();
    checkTwoFirstRows();
    assertCountDisplayed("2 selected");
    assertExportButtonsDisabled(false);

    verifyFullRowContent(["R44", "0.0 - 10.0", "CAL, GYRO", "Not specified"], 0);
    verifyRowWithTextCheckState("R44", true);

    // sort by all columns
    sortBy("Run number");
    verifyFullRowContent(["R01", "30.0 - 40.0", "CAL", "CH"], 0);
    verifyRowWithTextCheckState("R01", false);

    sortBy("Logged interval");
    verifyFullRowContent(["R44", "0.0 - 10.0", "CAL, GYRO, GR", "Not specified"], 0);
    verifyRowWithTextCheckState("R44", true);

    sortBy("Service or tool");
    sortBy("Borehole status");
    sortBy("Borehole status"); // sort descending
    verifyFullRowContent(["R96", "10.0 - 20.0", "CAL, GYRO, GR", "Other"], 0);
    verifyRowWithTextCheckState("R96", true);

    sortBy("Comment");
    verifyFullRowContent(["R96", "10.0 - 20.0", "CAL, GYRO, GR", "Other"], 0);
    verifyRowWithTextCheckState("R96", true);
  });

  it("Adds, edits and deletes logs", () => {
    createBorehole({ originalName: "FANCYPHANTOMFERRY" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}/log?dev=true`);
      cy.wait(["@borehole"]);
    });
    startBoreholeEditing();

    // Does not add a new log run when nothing is entered
    cy.dataCy("addlogrun-button").click();
    cy.contains("h4", "New run");
    cy.dataCy("close-button").click();
    cy.contains("p", "No run added yet...");

    // Displays validation errors when required fields missing
    cy.dataCy("addlogrun-button").click();
    setSelect("conveyanceMethodId", 3); //"PCL"
    cy.dataCy("close-button").click();
    hasError("fromDepth", true);
    hasError("toDepth", true);
    hasError("runNumber", true);

    setInput("runNumber", "R01");
    hasError("runNumber", false);

    setInput("fromDepth", "700456.67");
    evaluateInput("fromDepth", "700'456.67"); // verify formatting
    hasError("fromDepth", false);

    setInput("toDepth", "8");
    hasError("toDepth", true);
    cy.contains("To depth must be greater than from depth");

    // Focus  the "toDepth" field and clear it using backspace
    cy.contains("Bottom of logged interval").click();
    cy.focused().type("{backspace}");
    evaluateInput("toDepth", "");

    setInput("toDepth", "800456");
    hasError("toDepth", false);
    cy.dataCy("close-button").click();

    // verify one row was added
    verifyRowContains("R01", 0);
    verifyTableLength(1);

    // add 5 more runs
    addMinimalLogRun(100, 110, "R02");
    addMinimalLogRun(110, 120, "R03");
    addMinimalLogRun(120, 130, "R04");
    addMinimalLogRun(130, 140, "R05");
    addMinimalLogRun(140, 150, "R06");
    verifyTableLength(6);

    // delete temporary log run
    checkRowWithIndex(5); //"R06"
    cy.dataCy("delete-button").click();
    verifyTableLength(5);

    saveWithSaveBar();

    // can edit an existing log and save
    clickOnRowWithText("R03");
    setInput("runNumber", "R03-EDITED");
    setSelect("boreholeStatusId", 2);
    setSelect("conveyanceMethodId", 3);
    setInput("runDate", "2024-01-01");
    setInput("bitSize", 789456.7897);
    setInput("serviceCo", "A new service company");
    setInput("comment", "A comment");

    cy.dataCy("close-button").click();
    verifyRowContains("R03-EDITED", 2);
    saveWithSaveBar();

    // verify that changes were saved
    clickOnRowWithText("R03-EDITED");
    evaluateInput("runNumber", "R03-EDITED");
    evaluateSelect("boreholeStatusId", "CH");
    evaluateSelect("conveyanceMethodId", "PCL");
    evaluateInput("bitSize", "789'456.7897");
    evaluateInput("serviceCo", "A new service company");
    evaluateTextarea("comment", "A comment");
    cy.dataCy("close-button").click();

    // delete an existing log run
    checkRowWithIndex(3); //"R04"
    cy.dataCy("delete-button").click();
    verifyTableLength(4);
    verifyRowContains("R05", 3); // verify that R05 is now at index 3
    saveWithSaveBar();
    verifyTableLength(4);

    // verify that a change containing adds, edits and deletes can be saved
    // add
    cy.dataCy("addlogrun-button").click();
    setInput("fromDepth", 140);
    setInput("toDepth", 150);
    setInput("runNumber", "R02");
    hasError("runNumber", true);
    setInput("runNumber", "R06");
    hasError("runNumber", false);
    cy.dataCy("close-button").click();

    // verify that unique check also works when editing newly added run
    clickOnRowWithText("R06");
    evaluateInput("runNumber", "R06");
    setInput("toDepth", 155);
    cy.dataCy("close-button").click();

    // edit
    clickOnRowWithText("R02");
    setInput("runNumber", "R06");
    hasError("runNumber", true);
    setInput("runNumber", "R02-EDITED");
    hasError("runNumber", false);
    cy.dataCy("close-button").click();

    // delete
    checkRowWithIndex(3); //"R05"
    cy.dataCy("delete-button").click();

    verifyTableLength(4);
    saveWithSaveBar();
  });

  it("Blocks navigation with unsaved changes", () => {
    createBorehole({ originalName: "BLOCKING TIME!" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}/log?dev=true`);
      cy.wait(["@borehole"]);
    });
    startBoreholeEditing();

    // can discard changes
    addMinimalLogRun(1, 10, "BLOCK ME");
    verifyTableLength(1);
    discardChanges();
    verifyTableLength(0);
    addMinimalLogRun(1, 10, "BLOCK ME");

    // blocks navigation with unsaved changes
    cy.dataCy("attachments-menu-item").click();
    const messageUnsavedChanges = "There are unsaved changes. Do you want to discard all changes?";
    handlePrompt(messageUnsavedChanges, "cancel");

    // remains on page
    cy.contains("BLOCK ME");
    cy.dataCy("attachments-menu-item").click();
    handlePrompt(messageUnsavedChanges, "discardchanges");

    // navigates away
    isActiveMenuItem(SidebarMenuItem.attachments);

    navigateInSidebar(SidebarMenuItem.log);
    isActiveMenuItem(SidebarMenuItem.log);
    cy.contains("No run added yet...");
    cy.contains("Unsaved changes").should("not.exist");
  });

  it("Filters log runs in table", () => {
    goToDetailRouteAndAcceptTerms(`/1000070/log?dev=true`);
    assertCountDisplayed("10 runs");
    cy.dataCy("filter-button").should("exist");
    cy.dataCy("filter-form").should("not.exist");
    cy.dataCy("filter-button").click();
    cy.dataCy("filter-form").should("exist");
    toggleMultiSelect("runNumbers", [3], 11); // "R49
    assertCountDisplayed("1 run");
    toggleMultiSelect("sections", [3], 8); // "Belgium (54.0 - 141.0)"
    assertCountDisplayed("0 runs");
    toggleMultiSelect("runNumbers", [0], 11); // Reset
    assertCountDisplayed("5 runs");
    toggleMultiSelect("toolTypes", [2, 3]);
    assertCountDisplayed("2 runs");
    cy.dataCy("filter-button").click();
    cy.dataCy("filter-form").should("not.exist");
    assertCountDisplayed("10 runs");
    cy.dataCy("filter-button").click();
    cy.dataCy("filter-form").should("exist");
    evaluateMultiSelect("runNumbers", []);
    evaluateMultiSelect("sections", []);
    evaluateMultiSelect("toolTypes", []);
  });
});
