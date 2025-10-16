import {
  checkAllVisibleRows,
  checkTwoFirstRows,
  sortBy,
  uncheckAllVisibleRows,
  verifyRowContains,
  verifyRowWithTextCheckState,
} from "../helpers/dataGridHelpers.js";
import { toggleMultiSelect } from "../helpers/formHelpers.js";
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

  it("filters log runs in table", () => {
    // Todo:  temporarily test with existing borehole, adding logs is not yet implemented. Integrate in new test when implemented.
    goToDetailRouteAndAcceptTerms(`/1000070/log?dev=true`);
    assertCountDisplayed("10 runs");
    getElementByDataCy("filter-button").should("exist");
    getElementByDataCy("filter-form").should("not.exist");
    getElementByDataCy("filter-button").click();
    getElementByDataCy("filter-form").should("exist");
    toggleMultiSelect("runNumbers", [3], 11); // "R49
    assertCountDisplayed("1 run");
    toggleMultiSelect("section", [3], 8); // "Belgium (54.0 - 141.0)"
    assertCountDisplayed("0 runs");
    toggleMultiSelect("runNumbers", [0], 11); // Reset
    assertCountDisplayed("5 runs");
    toggleMultiSelect("toolTypes", [2, 3]);
    assertCountDisplayed("2 runs");
  });
});
