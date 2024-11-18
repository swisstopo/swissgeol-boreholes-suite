import { checkRowWithText, showTableAndWaitForData } from "../helpers/dataGridHelpers.js";
import { createBorehole, deleteDownloadedFile, loginAsAdmin, readDownloadedFile } from "../helpers/testHelpers";

describe("Test for exporting boreholes.", () => {
  it("exports a borehole", () => {
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

    const filename = `bulkexport_${new Date().toISOString().split("T")[0]}.json`;

    deleteDownloadedFile(filename);

    exportItem();

    readDownloadedFile(filename);
  });
});
