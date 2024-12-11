import { exportCSVItem, exportJsonItem, saveWithSaveBar } from "../helpers/buttonHelpers";
import {
  checkAllVisibleRows,
  checkRowWithText,
  clickOnRowWithText,
  showTableAndWaitForData,
} from "../helpers/dataGridHelpers.js";
import { evaluateInput, setInput, setSelect } from "../helpers/formHelpers";
import {
  createBorehole,
  deleteDownloadedFile,
  getElementByDataCy,
  getImportFileFromFixtures,
  goToRouteAndAcceptTerms,
  handlePrompt,
  prepareDownloadPath,
  readDownloadedFile,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

const jsonFileName = `bulkexport_${new Date().toISOString().split("T")[0]}.json`;
const csvFileName = `bulkexport_${new Date().toISOString().split("T")[0]}.csv`;

const verifyTVDContentInCSVFile = (
  fileName,
  expectedTotalDepthVD,
  expectedTopBedrockFreshTVD,
  expectedTopBedrockWeatheredTVD,
) => {
  cy.readFile(prepareDownloadPath(fileName)).then(fileContent => {
    const lines = fileContent.split("\n");
    const rows = lines.map(row => row.split(";"));
    expect(lines.length).to.equal(3);
    expect(rows[0][28]).to.equal("TotalDepthTvd");
    expect(rows[1][28]).to.equal(expectedTotalDepthVD);
    expect(rows[0][29]).to.equal("TopBedrockFreshTvd");
    expect(rows[1][29]).to.equal(expectedTopBedrockFreshTVD);
    expect(rows[0][30]).to.equal("TopBedrockWeatheredTvd\r");
    expect(rows[1][30]).to.equal(expectedTopBedrockWeatheredTVD);
  });
};

describe("Test for exporting boreholes.", () => {
  it("bulk exports boreholes to json and csv", () => {
    createBorehole({ "extended.original_name": "AAA_NINTIC", "custom.alternate_name": "AAA_NINTIC" }).as(
      "borehole_id_1",
    );
    createBorehole({ "extended.original_name": "AAA_LOMONE", "custom.alternate_name": "AAA_LOMONE" }).as(
      "borehole_id_2",
    );
    showTableAndWaitForData();
    getElementByDataCy("borehole-table").within(() => {
      checkRowWithText("AAA_NINTIC");
      checkRowWithText("AAA_LOMONE");
    });

    deleteDownloadedFile(jsonFileName);
    deleteDownloadedFile(csvFileName);
    exportJsonItem();
    exportCSVItem();
    readDownloadedFile(jsonFileName);
    readDownloadedFile(csvFileName);

    clickOnRowWithText("AAA_NINTIC");
  });

  it("exports TVD for a borehole with and without geometry", () => {
    const boreholeName = "AAA_FROGGY";
    createBorehole({ "extended.original_name": boreholeName, "custom.alternate_name": boreholeName }).as("borehole_id");

    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}`);
    });

    //add geometry to borehole and verify export tvd changed
    getElementByDataCy("borehole-menu-item").click();
    startBoreholeEditing();
    setInput("totalDepth", 700);
    setInput("topBedrockFreshMd", 800);
    setInput("topBedrockWeatheredMd", 900);
    evaluateInput("totalDepth", "700");
    evaluateInput("total_depth_tvd", "700");
    evaluateInput("topBedrockFreshMd", "800");
    evaluateInput("top_bedrock_fresh_tvd", "800");
    evaluateInput("topBedrockWeatheredMd", "900");
    evaluateInput("top_bedrock_weathered_tvd", "900");

    saveWithSaveBar();

    stopBoreholeEditing();
    exportCSVItem();

    const fileName = `${boreholeName}.csv`;
    verifyTVDContentInCSVFile(fileName, "700", "800", "900\r");
    deleteDownloadedFile(fileName);
    startBoreholeEditing();

    getElementByDataCy("geometry-tab").click();
    getElementByDataCy("boreholegeometryimport-button").should("be.disabled");

    // upload geometry csv file
    let geometryFile = new DataTransfer();
    getImportFileFromFixtures("geometry_azimuth_inclination.csv", null).then(fileContent => {
      const file = new File([fileContent], "geometry_azimuth_inclination.csv", {
        type: "text/csv",
      });
      geometryFile.items.add(file);
    });
    getElementByDataCy("import-geometry-input").within(() => {
      cy.get("input[type=file]", { force: true }).then(input => {
        input[0].files = geometryFile.files;
        input[0].dispatchEvent(new Event("change", { bubbles: true }));
      });
    });

    setSelect("geometryFormat", 1);
    getElementByDataCy("boreholegeometryimport-button").click();
    cy.wait(["@boreholegeometry_POST", "@boreholegeometry_GET"]);
    cy.get(".MuiTableBody-root").should("exist");

    getElementByDataCy("general-tab").click();
    evaluateInput("totalDepth", "700");
    evaluateInput("total_depth_tvd", "674.87");
    getElementByDataCy("location-menu-item").click();
    const newBoreholeName = "AAA_FISHY";
    setInput("originalName", newBoreholeName); // change name to avoid potential CSV filename conflict
    saveWithSaveBar();
    stopBoreholeEditing();
    exportCSVItem();
    const newFileName = `${newBoreholeName}.csv`;
    verifyTVDContentInCSVFile(newFileName, "674.8678208299723", "762.6098263945338", "846.9637100889873" + "\r");
    deleteDownloadedFile(newFileName);
  });

  it("downloads a maximum of 100 boreholes", () => {
    showTableAndWaitForData();
    checkAllVisibleRows();
    deleteDownloadedFile(csvFileName);
    exportCSVItem();

    const moreThan100SelectedPrompt =
      "You have selected more than 100 boreholes and a maximum of 100 boreholes can be exported. Do you want to continue?";
    handlePrompt(moreThan100SelectedPrompt, "Cancel");
    cy.get("@borehole_export_csv").should("not.exist");
    exportCSVItem();
    handlePrompt(moreThan100SelectedPrompt, "Export 100 boreholes");
    cy.wait("@borehole_export_csv").its("response.statusCode").should("eq", 200);
    readDownloadedFile(csvFileName);

    // Verify file length
    cy.readFile(prepareDownloadPath(csvFileName)).then(fileContent => {
      const lines = fileContent.split("\n");
      expect(lines.length).to.equal(102);
    });

    deleteDownloadedFile(jsonFileName);
    exportJsonItem();
    handlePrompt(moreThan100SelectedPrompt, "Cancel");
  });
});
