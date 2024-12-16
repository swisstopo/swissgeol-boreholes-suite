import { exportCSVItem, exportItem, exportJsonItem } from "../helpers/buttonHelpers";
import { checkAllVisibleRows, checkRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers.js";
import {
  createBorehole,
  deleteDownloadedFile,
  handlePrompt,
  loginAsAdmin,
  prepareDownloadPath,
  readDownloadedFile,
} from "../helpers/testHelpers";

const jsonFileName = `bulkexport_${new Date().toISOString().split("T")[0]}.json`;
const csvFileName = `bulkexport_${new Date().toISOString().split("T")[0]}.csv`;

describe("Test for exporting boreholes.", () => {
  it("bulk exports boreholes to json and csv", () => {
    createBorehole({ "extended.original_name": "AAA_NINTIC", "custom.alternate_name": "AAA_NINTIC" }).as(
      "borehole_id_1",
    );
    createBorehole({ "extended.original_name": "AAA_LOMONE", "custom.alternate_name": "AAA_LOMONE" }).as(
      "borehole_id_2",
    );
    loginAsAdmin();
    showTableAndWaitForData();
    cy.get('[data-cy="borehole-table"]').within(() => {
      checkRowWithText("AAA_NINTIC");
      checkRowWithText("AAA_LOMONE");
    });

    deleteDownloadedFile(jsonFileName);
    deleteDownloadedFile(csvFileName);
    exportItem();
    exportJsonItem();
    exportItem();
    exportCSVItem();
    readDownloadedFile(jsonFileName);
    readDownloadedFile(csvFileName);
  });

  it("downloads a maximum of 100 boreholes", () => {
    loginAsAdmin();
    showTableAndWaitForData();
    checkAllVisibleRows();
    deleteDownloadedFile(csvFileName);
    exportItem();

    const moreThan100SelectedPrompt =
      "You have selected more than 100 boreholes and a maximum of 100 boreholes can be exported. Do you want to continue?";
    handlePrompt(moreThan100SelectedPrompt, "Cancel");
    exportItem();
    handlePrompt(moreThan100SelectedPrompt, "Export 100 boreholes");
    exportCSVItem();
    cy.wait("@borehole_export_csv").its("response.statusCode").should("eq", 200);
    readDownloadedFile(csvFileName);

    // Verify file length
    cy.readFile(prepareDownloadPath(csvFileName)).then(fileContent => {
      const lines = fileContent.split("\n");
      expect(lines.length).to.equal(102);
    });

    deleteDownloadedFile(jsonFileName);
  });
});
