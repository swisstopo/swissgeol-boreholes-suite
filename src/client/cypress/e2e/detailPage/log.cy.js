import { saveWithSaveBar } from "../helpers/buttonHelpers.js";
import "cypress-real-events/support";
import {
  checkAllVisibleRows,
  checkTwoFirstRows,
  clickOnRowWithText,
  sortBy,
  uncheckAllVisibleRows,
  verifyRowContains,
  verifyRowWithTextCheckState,
  verifyTableLength,
} from "../helpers/dataGridHelpers.js";
import { evaluateInput, hasError, setInput, setSelect } from "../helpers/formHelpers.js";
import {
  createBorehole,
  getElementByDataCy,
  goToDetailRouteAndAcceptTerms,
  startBoreholeEditing,
} from "../helpers/testHelpers";

function assertExportButtonsDisabled(isDisabled = true) {
  getElementByDataCy("exportdata-button").should(isDisabled ? "have.attr" : "not.have.attr", "disabled");
  getElementByDataCy("exporttable-button").should(isDisabled ? "have.attr" : "not.have.attr", "disabled");
}

function assertCountDisplayed(textContent) {
  getElementByDataCy("log-run-count").should("contain", textContent);
}

function verifyFullRowContent(cellContents, index) {
  for (const content of cellContents) {
    verifyRowContains(content, index);
  }
}

function addMinimalLogRun(fromDepth = 0, toDepth = 10, runNumber = "R01") {
  getElementByDataCy("addlogrun-button").click();
  setInput("fromDepth", fromDepth);
  setInput("toDepth", toDepth);
  setInput("runNumber", runNumber);
  getElementByDataCy("close-button").click();
}

describe("Test for the borehole log.", () => {
  it("Correctly displays logs", () => {
    // Todo:  temporarily test with existing borehole, adding logs is not yet implemented. Integrate in new test when implemented.
    goToDetailRouteAndAcceptTerms(`/1000070/log?dev=true`);
    assertExportButtonsDisabled();
    getElementByDataCy("delete-button").should("not.exist");
    assertCountDisplayed("10 runs");

    startBoreholeEditing();
    assertExportButtonsDisabled();
    getElementByDataCy("delete-button").should("be.visible");
    getElementByDataCy("delete-button").should("have.attr", "disabled");

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

  it("Adds edits and deletes logs", () => {
    createBorehole({ originalName: "FANCYPHANTOMFERRY" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}/log?dev=true`);
      cy.wait(["@borehole"]);
    });
    startBoreholeEditing();

    // Does not add a new log run when nothing is entered
    getElementByDataCy("addlogrun-button").click();
    cy.contains("h4", "New run");
    getElementByDataCy("close-button").click();
    cy.contains("p", "No run added yet...");

    // Displays validation errors when required fields missing
    getElementByDataCy("addlogrun-button").click();
    setSelect("conveyanceMethodId", 3); //"PCL"
    getElementByDataCy("close-button").click();
    hasError("fromDepth", true);
    hasError("toDepth", true);
    hasError("runNumber", true);

    setInput("runNumber", "R01");
    hasError("runNumber", false);

    getElementByDataCy("fromDepth-formInput").realClick().clear().type("700456.67");
    evaluateInput("fromDepth", "700'456.67"); // verify formatting
    hasError("fromDepth", false);
    getElementByDataCy("toDepth-formInput").realClick().clear().type("800456.67");
    hasError("toDepth", false);

    //Todo: add check for fromDepth < toDepth error, is currently not working because of input focus issue
    getElementByDataCy("close-button").click();

    // One row was added
    verifyRowContains("R01", 0);
    verifyTableLength(1);

    // Add 5 more runs
    addMinimalLogRun(100, 110, "R02");
    addMinimalLogRun(110, 120, "R03");
    addMinimalLogRun(120, 130, "R04");
    addMinimalLogRun(130, 140, "R05");
    addMinimalLogRun(140, 150, "R06");
    verifyTableLength(6);

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

    getElementByDataCy("close-button").click();
    verifyRowContains("R03-EDITED", 2);
    saveWithSaveBar();

    // Todo:
    // can edit an existing log and save
    // can delete an existing log and save
    // can delete a temporary log and save
    // cannot save if required fields missing
    // can save with adds edits and deletes
    // verify navigation blocking
  });
});
