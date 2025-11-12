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
  evaluateCheckbox,
  evaluateInput,
  evaluateMultiSelect,
  evaluateSelect,
  evaluateTextarea,
  hasError,
  setInput,
  setSelect,
  toggleCheckbox,
  toggleMultiSelect,
} from "../helpers/formHelpers.js";
import { isActiveMenuItem, navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers.js";
import {
  createBaseSelector,
  createBorehole,
  goToDetailRouteAndAcceptTerms,
  handlePrompt,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

// TODO: Remove rule once logic is implemented with https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2361
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertExportButtonsDisabled(isDisabled = true) {
  // TODO: Re-add once logic is implemented with https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2361
  // cy.dataCy("exportdata-button").should(isDisabled ? "have.attr" : "not.have.attr", "disabled");
  // cy.dataCy("exporttable-button").should(isDisabled ? "have.attr" : "not.have.attr", "disabled");
}

function assertRunCountDisplayed(textContent) {
  cy.dataCy("log-run-count").should("contain", textContent);
}

function assertFileCountDisplayed(textContent) {
  cy.dataCy("log-file-count").should("contain", textContent);
}

function verifyFullRowContent(cellContents, index) {
  for (const content of cellContents) {
    verifyRowContains(content, index);
  }
}

function addLogRun() {
  cy.dataCy("addlogrun-button").click();
}

function closeLogRunEditor() {
  cy.get(".MuiDialog-container").dataCy("close-button").click();
}

function addMinimalLogRun(fromDepth = 0, toDepth = 10, runNumber = "R01") {
  addLogRun();
  setInput("fromDepth", fromDepth);
  setInput("toDepth", toDepth);
  setInput("runNumber", runNumber);
  closeLogRunEditor();
}

function selectFile(filePath, parent) {
  const selector = createBaseSelector(parent) + `[data-cy="file-dropzone"]`;
  cy.get(selector).selectFile(`cypress/fixtures/${filePath}`, {
    force: true,
    fileName: filePath,
  });

  cy.get(selector).contains(filePath.split("/").pop());
  cy.get(selector).dataCy("iconButton").should("exist");
}

function removeFile(parent) {
  const selector = createBaseSelector(parent) + `[data-cy="file-dropzone"]`;
  cy.get(selector).dataCy("iconButton").click();
}

describe("Test for the borehole log.", () => {
  it("Correctly displays log run table", () => {
    goToDetailRouteAndAcceptTerms(`/1000070/log?dev=true`);
    assertExportButtonsDisabled();
    cy.dataCy("delete-button").should("not.exist");
    assertRunCountDisplayed("10 runs");

    startBoreholeEditing();
    assertExportButtonsDisabled();
    cy.dataCy("delete-button").should("be.visible");
    cy.dataCy("delete-button").should("have.attr", "disabled");

    checkAllVisibleRows();
    assertRunCountDisplayed("10 selected");
    uncheckAllVisibleRows();
    checkTwoFirstRows();
    assertRunCountDisplayed("2 selected");
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
    addLogRun();
    cy.contains("h4", "New run");
    closeLogRunEditor();
    cy.contains("p", "No run added yet...");

    // Displays validation errors when required fields missing
    addLogRun();
    setSelect("conveyanceMethodId", 3); //"PCL"
    closeLogRunEditor();
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
    closeLogRunEditor();

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

    closeLogRunEditor();
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
    closeLogRunEditor();

    // delete an existing log run
    checkRowWithIndex(3); //"R04"
    cy.dataCy("delete-button").click();
    verifyTableLength(4);
    verifyRowContains("R05", 3); // verify that R05 is now at index 3
    saveWithSaveBar();
    verifyTableLength(4);

    // verify that a change containing adds, edits and deletes can be saved
    // add
    addLogRun();
    setInput("fromDepth", 140);
    setInput("toDepth", 150);
    setInput("runNumber", "R02");
    hasError("runNumber", true);
    setInput("runNumber", "R06");
    hasError("runNumber", false);
    closeLogRunEditor();

    // verify that unique check also works when editing newly added run
    clickOnRowWithText("R06");
    evaluateInput("runNumber", "R06");
    setInput("toDepth", 155);
    closeLogRunEditor();

    // edit
    clickOnRowWithText("R02");
    setInput("runNumber", "R06");
    hasError("runNumber", true);
    setInput("runNumber", "R02-EDITED");
    hasError("runNumber", false);
    closeLogRunEditor();

    // delete
    checkRowWithIndex(3); //"R05"
    cy.dataCy("delete-button").click();

    verifyTableLength(4);
    saveWithSaveBar();
  });

  it("can add, update and delete log files", () => {
    createBorehole({ originalName: "FANCYPHANTOMFERRY" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}/log?dev=true`);
      cy.wait(["@borehole"]);
    });
    startBoreholeEditing();
    addMinimalLogRun(100, 110, "R01");
    verifyRowContains("R01", 0);
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    // can add new file
    clickOnRowWithText("R01");
    cy.dataCy("logRun-files").contains("No file added yet...");
    cy.dataCy("addfile-button").click();
    cy.dataCy("logRun-file-0").find(".MuiCardHeader-title").contains("New file");
    cy.dataCy("logRun-file-0").dataCy("delete-file-button").should("exist");
    selectFile("labeling_attachment.pdf", "logRun-file-0");
    cy.dataCy("logRun-file-0").find(".MuiCardHeader-title").contains("labeling_attachment.pdf");
    evaluateInput("logFiles.0.extension", "pdf");

    toggleMultiSelect("logFiles.0.toolTypeCodelistIds", [1, 2]);
    setSelect("logFiles.0.passTypeId", 3);
    setInput("logFiles.0.pass", 6);
    setSelect("logFiles.0.dataPackageId", 4);
    setInput("logFiles.0.deliveryDate", "2024-02-02");
    setSelect("logFiles.0.depthTypeId", 3);
    toggleCheckbox("logFiles.0.public");
    closeLogRunEditor();
    saveWithSaveBar();

    // can edit existing file
    clickOnRowWithText("R01");
    cy.dataCy("logRun-file-0").find(".MuiCardHeader-title").contains("labeling_attachment.pdf");
    evaluateMultiSelect("logFiles.0.toolTypeCodelistIds", ["CAL", "GYRO"]);
    evaluateSelect("logFiles.0.passTypeId", "Main & repeat");
    evaluateInput("logFiles.0.pass", "6");
    evaluateSelect("logFiles.0.dataPackageId", "Real-Time data (LWD)");
    evaluateInput("logFiles.0.deliveryDate", "2024-02-02");
    evaluateSelect("logFiles.0.depthTypeId", "MD & TVD");
    evaluateCheckbox("logFiles.0.public", true);
    removeFile("logRun-file-0");
    cy.dataCy("logRun-file-0").find(".MuiCardHeader-title").contains("-");
    evaluateInput("logFiles.0.extension", "");
    selectFile("import/COLDWATER.zip", "logRun-file-0");
    cy.dataCy("logRun-file-0").find(".MuiCardHeader-title").contains("COLDWATER.zip");
    evaluateInput("logFiles.0.extension", "zip");
    closeLogRunEditor();
    saveWithSaveBar();

    // verify files are reset for new log run
    addLogRun();
    cy.dataCy("logRun-files").contains("No file added yet...");
    closeLogRunEditor();

    // can delete existing file
    clickOnRowWithText("R01");
    cy.dataCy("logRun-file-0").find(".MuiCardHeader-title").contains("COLDWATER.zip");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.dataCy("logRun-file-0").dataCy("delete-file-button").click();
    cy.dataCy("logRun-files").contains("No file added yet...");
    closeLogRunEditor();
    saveWithSaveBar();

    clickOnRowWithText("R01");
    cy.dataCy("logRun-files").contains("No file added yet...");
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
    assertRunCountDisplayed("10 runs");
    cy.dataCy("filter-button").should("exist");
    cy.dataCy("filter-form").should("not.exist");
    cy.dataCy("filter-button").click();
    cy.dataCy("filter-form").should("exist");
    toggleMultiSelect("runNumbers", [3], 11); // "R49
    assertRunCountDisplayed("1 run");
    toggleMultiSelect("sections", [3], 8); // "Belgium (54.0 - 141.0)"
    assertRunCountDisplayed("0 runs");
    toggleMultiSelect("runNumbers", [0], 11); // Reset
    assertRunCountDisplayed("5 runs");
    toggleMultiSelect("toolTypes", [2, 3]);
    assertRunCountDisplayed("2 runs");
    cy.dataCy("filter-button").click();
    cy.dataCy("filter-form").should("not.exist");
    assertRunCountDisplayed("10 runs");
    cy.dataCy("filter-button").click();
    cy.dataCy("filter-form").should("exist");
    evaluateMultiSelect("runNumbers", []);
    evaluateMultiSelect("sections", []);
    evaluateMultiSelect("toolTypes", []);
  });

  it("filters log files", () => {
    createBorehole({ originalName: "FANCYPHANTOMFERRY" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}/log?dev=true`);
      cy.wait(["@borehole"]);
    });
    startBoreholeEditing();
    addMinimalLogRun(100, 110, "R01");
    verifyRowContains("R01", 0);

    // add two files
    clickOnRowWithText("R01");
    cy.dataCy("logRun-files").contains("No file added yet...");
    cy.dataCy("addfile-button").click();
    cy.dataCy("logRun-file-0").find(".MuiCardHeader-title").contains("New file");
    cy.dataCy("logRun-file-0").dataCy("delete-file-button").should("exist");
    selectFile("labeling_attachment.pdf", "logRun-file-0");
    cy.dataCy("logRun-file-0").find(".MuiCardHeader-title").contains("labeling_attachment.pdf");
    evaluateInput("logFiles.0.extension", "pdf");

    toggleMultiSelect("logFiles.0.toolTypeCodelistIds", [1, 2]);
    setSelect("logFiles.0.passTypeId", 3);
    setInput("logFiles.0.pass", 6);
    setSelect("logFiles.0.dataPackageId", 4);
    setInput("logFiles.0.deliveryDate", "2024-02-02");
    setSelect("logFiles.0.depthTypeId", 3);
    toggleCheckbox("logFiles.0.public");

    cy.dataCy("addfile-button").click();
    cy.dataCy("logRun-file-0").find(".MuiCardHeader-title").contains("New file");
    cy.dataCy("logRun-file-0").dataCy("delete-file-button").should("exist");
    selectFile("import/COLDWATER.zip", "logRun-file-0");
    cy.dataCy("logRun-file-0").find(".MuiCardHeader-title").contains("COLDWATER.zip");
    evaluateInput("logFiles.0.extension", "zip");

    toggleMultiSelect("logFiles.0.toolTypeCodelistIds", [3, 4]);
    setSelect("logFiles.0.passTypeId", 3);
    setInput("logFiles.0.pass", 4);
    setSelect("logFiles.0.dataPackageId", 4);
    setInput("logFiles.0.deliveryDate", "2021-08-11");
    setSelect("logFiles.0.depthTypeId", 3);

    closeLogRunEditor();
    saveWithSaveBar();
    stopBoreholeEditing();

    clickOnRowWithText("R01");
    assertFileCountDisplayed("2 files");
    cy.dataCy("logRun-files").dataCy("filter-button").should("exist");
    cy.dataCy("logRun-files").dataCy("filter-form").should("not.exist");
    cy.dataCy("logRun-files").dataCy("filter-button").click();
    cy.dataCy("logRun-files").dataCy("filter-form").should("exist");

    toggleMultiSelect("toolTypes", [1], 26, "logRun-files"); // "CAL"
    assertFileCountDisplayed("1 file");
    toggleMultiSelect("extensions", [2], 3, "logRun-files"); // "zip"
    assertFileCountDisplayed("0 files");
    toggleMultiSelect("toolTypes", [0], 26, "logRun-files"); // Reset
    assertFileCountDisplayed("1 file");
    toggleMultiSelect("passTypes", [3], 8, "logRun-files"); // "Main & repeat"
    assertFileCountDisplayed("1 file");
    toggleMultiSelect("extensions", [2], 3, "logRun-files"); // remove "zip"
    assertFileCountDisplayed("2 files");
    toggleMultiSelect("dataPackages", [2], 12, "logRun-files"); // "Field data (WL)"
    assertFileCountDisplayed("0 files");
    toggleMultiSelect("dataPackages", [4], 12, "logRun-files"); // "Real-time data (WL)"
    assertFileCountDisplayed("2 files");
    setSelect("public", 2, 3, "logRun-files"); // "No"
    assertFileCountDisplayed("1 file");

    cy.dataCy("logRun-files").dataCy("filter-button").click();
    cy.dataCy("logRun-files").dataCy("filter-form").should("not.exist");
    assertFileCountDisplayed("2 files");
    cy.dataCy("logRun-files").dataCy("filter-button").click();
    cy.dataCy("logRun-files").dataCy("filter-form").should("exist");
    evaluateMultiSelect("toolTypes", [], "logRun-files");
    evaluateMultiSelect("extensions", [], "logRun-files");
    evaluateMultiSelect("passTypes", [], "logRun-files");
    evaluateMultiSelect("dataPackages", [], "logRun-files");
    evaluateSelect("public", "", "logRun-files");
  });
});
