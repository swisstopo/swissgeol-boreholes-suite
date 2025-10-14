import {
  checkAllVisibleRows,
  checkTwoFirstRows,
  sortBy,
  uncheckAllVisibleRows,
  verifyRowContains,
  verifyRowWithTextCheckState,
} from "../helpers/dataGridHelpers.js";
import { getElementByDataCy, goToDetailRouteAndAcceptTerms, startBoreholeEditing } from "../helpers/testHelpers";

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

    verifyFullRowContent(["R44", "0.0 - 10.0", "CAL, GYRO", "Not specified", "06/04/2021"], 0);
    verifyRowWithTextCheckState("R44", true);

    // sort by all columns
    sortBy("Run number");
    verifyFullRowContent(["R01", "30.0 - 40.0", "CAL", "CH", "19/05/2021"], 0);
    verifyRowWithTextCheckState("R01", false);

    sortBy("Logged interval");
    verifyFullRowContent(["R44", "0.0 - 10.0", "CAL, GYRO, GR", "Not specified", "06/04/2021"], 0);
    verifyRowWithTextCheckState("R44", true);

    // sortBy("Service or tool"); currently hardcoded
    sortBy("Borehole status");
    sortBy("Borehole status"); // sort descending
    verifyFullRowContent(["R96", "10.0 - 20.0", "CAL, GYRO, GR", "Other", "20/12/2021"], 0);
    verifyRowWithTextCheckState("R96", true);

    sortBy("Run date");
    verifyFullRowContent(["R53", "40.0 - 50.0", "CAL, GYRO", "Other", "01/02/2021"], 0);
    verifyRowWithTextCheckState("R53", false);
    sortBy("Comment");
    verifyFullRowContent(["R96", "10.0 - 20.0", "CAL, GYRO, GR", "Other", "20/12/2021"], 0);
    verifyRowWithTextCheckState("R96", true);
  });
});
