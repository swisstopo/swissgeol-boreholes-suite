import { referenceSystems } from "../../../src/pages/detail/form/location/coordinateSegmentConstants.ts";
import {
  addItem,
  deleteItem,
  exportCSVItem,
  exportItem,
  exportJsonItem,
  exportZipItem,
  saveWithSaveBar,
} from "../helpers/buttonHelpers";
import {
  checkAllVisibleRows,
  checkRowWithText,
  checkTwoFirstRows,
  clickOnRowWithText,
  showTableAndWaitForData,
} from "../helpers/dataGridHelpers.js";
import { evaluateInput, setInput, setOriginalName, setSelect } from "../helpers/formHelpers";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers.js";
import {
  createBorehole,
  createWateringress,
  deleteDownloadedFile,
  getImportFileFromFixtures,
  goToDetailRouteAndAcceptTerms,
  goToRouteAndAcceptTerms,
  handlePrompt,
  newEditableBorehole,
  prepareDownloadPath,
  readDownloadedFile,
  returnToOverview,
  selectInputFile,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

const jsonFileName = `bulkexport_${new Date().toISOString().split("T")[0]}.json`;
const csvFileName = `bulkexport_${new Date().toISOString().split("T")[0]}.csv`;

const splitFileContent = fileContent => {
  const lines = fileContent.split("\n");
  const rows = lines.map(row => row.split(";"));
  return { lines, rows };
};

const verifyTVDContentInCSVFile = (
  fileName,
  expectedTotalDepthVD,
  expectedTopBedrockFreshTVD,
  expectedTopBedrockWeatheredTVD,
) => {
  cy.readFile(prepareDownloadPath(fileName)).then(fileContent => {
    const { lines, rows } = splitFileContent(fileContent);
    expect(lines.length).to.equal(3);
    expect(rows[0][26]).to.equal("TotalDepthTvd");
    expect(rows[1][26]).to.equal(expectedTotalDepthVD);
    expect(rows[0][27]).to.equal("TopBedrockFreshTvd");
    expect(rows[1][27]).to.equal(expectedTopBedrockFreshTVD);
    expect(rows[0][28]).to.equal("TopBedrockWeatheredTvd");
    expect(rows[1][28]).to.equal(expectedTopBedrockWeatheredTVD);
  });
};

describe("Test for exporting boreholes.", () => {
  it("bulk exports boreholes to json and csv", () => {
    deleteDownloadedFile(jsonFileName);
    deleteDownloadedFile(csvFileName);
    createBorehole({ originalName: "AAA_NINTIC", name: "AAA_NINTIC" }).as("borehole_id_1");
    createBorehole({ originalName: "AAA_LOMONE", name: "AAA_LOMONE" }).as("borehole_id_2");
    goToRouteAndAcceptTerms("/");
    showTableAndWaitForData();
    checkRowWithText("AAA_NINTIC");
    checkRowWithText("AAA_LOMONE");

    deleteDownloadedFile(jsonFileName);
    deleteDownloadedFile(csvFileName);
    exportItem();
    exportJsonItem();
    exportItem();
    exportCSVItem();
    readDownloadedFile(jsonFileName);
    readDownloadedFile(csvFileName);
    deleteItem(); // bulk delete all added boreholes
    handlePrompt("Do you really want to delete these 2 boreholes? This cannot be undone.", "delete");
  });

  it("exports TVD for a borehole with and without geometry", () => {
    const boreholeName = "AAA_FROGGY";
    const secondBoreholeName = "AAA_FISHY";
    const fileName = `${boreholeName}.csv`;
    const secondFileName = `${secondBoreholeName}.csv`;

    deleteDownloadedFile(fileName);
    deleteDownloadedFile(secondFileName);

    createBorehole({ originalName: boreholeName, name: boreholeName }).as("borehole_id");

    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}`);
    });

    // add geometry to borehole and verify export tvd changed
    startBoreholeEditing();
    navigateInSidebar(SidebarMenuItem.borehole);
    setInput("totalDepth", 700);
    cy.wait(["@get-depth-tvd", "@get-depth-tvd", "@get-depth-tvd"]);
    setInput("topBedrockFreshMd", 800);
    cy.wait(["@get-depth-tvd", "@get-depth-tvd", "@get-depth-tvd"]);
    setInput("topBedrockWeatheredMd", 900);
    cy.wait(["@get-depth-tvd", "@get-depth-tvd", "@get-depth-tvd"]);
    evaluateInput("totalDepth", "700");
    evaluateInput("total_depth_tvd", "700");
    evaluateInput("topBedrockFreshMd", "800");
    evaluateInput("top_bedrock_fresh_tvd", "800");
    evaluateInput("topBedrockWeatheredMd", "900");
    evaluateInput("top_bedrock_weathered_tvd", "900");

    saveWithSaveBar();

    stopBoreholeEditing();
    exportItem();
    exportCSVItem();

    verifyTVDContentInCSVFile(fileName, "700", "800", "900");
    startBoreholeEditing();

    cy.dataCy("geometry-tab").click();
    cy.wait(["@boreholegeometry_GET", "@boreholegeometry_formats"]);
    cy.dataCy("boreholegeometryimport-button").should("be.disabled");

    // upload geometry csv file
    let geometryFile = new DataTransfer();
    getImportFileFromFixtures("geometry_azimuth_inclination.csv", null).then(fileContent => {
      const file = new File([fileContent], "geometry_azimuth_inclination.csv", {
        type: "text/csv",
      });
      geometryFile.items.add(file);
    });
    cy.dataCy("import-geometry-input").within(() => {
      cy.get("input[type=file]", { force: true }).then(input => {
        input[0].files = geometryFile.files;
        input[0].dispatchEvent(new Event("change", { bubbles: true }));
      });
    });

    cy.dataCy("boreholegeometryimport-button").should("be.enabled");
    setSelect("geometryFormat", 1);
    cy.dataCy("boreholegeometryimport-button").click();
    cy.wait(["@boreholegeometry_POST", "@boreholegeometry_GET"]);
    cy.get(".MuiTableBody-root").should("exist");

    cy.dataCy("general-tab").click();
    cy.wait(["@borehole_by_id", "@get-depth-tvd", "@get-depth-tvd", "@get-depth-tvd"]);
    evaluateInput("totalDepth", "700");
    evaluateInput("total_depth_tvd", "674.87");
    navigateInSidebar(SidebarMenuItem.location);
    setOriginalName(secondBoreholeName); // change name to avoid potential CSV filename conflict
    saveWithSaveBar();
    stopBoreholeEditing();
    exportItem();
    exportCSVItem();
    verifyTVDContentInCSVFile(secondFileName, "674.8678208299723", "762.6098263945338", "846.9637100889873");
    startBoreholeEditing();
    cy.dataCy("deleteborehole-button").click();
    handlePrompt("Do you really want to delete this borehole? This cannot be undone.", "delete");
  });

  it("exports custom Ids form borehole", () => {
    const firstBoreholeName = "AAA_DUCKY";
    const secondBoreholeName = "AAA_SNAKEY";
    deleteDownloadedFile(csvFileName);
    goToRouteAndAcceptTerms("/");
    newEditableBorehole().as("borehole_id");
    setInput("name", firstBoreholeName);
    addItem("addIdentifier");
    setSelect("boreholeCodelists.0.codelistId", 3);
    setInput("boreholeCodelists.0.value", 13);
    saveWithSaveBar();
    returnToOverview();

    newEditableBorehole().as("borehole_id_2");
    setInput("name", secondBoreholeName);
    addItem("addIdentifier");
    setSelect("boreholeCodelists.0.codelistId", 4);
    setInput("boreholeCodelists.0.value", 14);
    saveWithSaveBar();
    returnToOverview();
    showTableAndWaitForData();
    checkRowWithText(firstBoreholeName);
    checkRowWithText(secondBoreholeName);
    exportItem();
    exportCSVItem();
    cy.readFile(prepareDownloadPath(csvFileName)).then(fileContent => {
      const { lines, rows } = splitFileContent(fileContent);
      expect(lines.length).to.equal(4);

      expect(rows[0][3]).to.equal("Name");
      expect(rows[1][3]).to.equal(firstBoreholeName);
      expect(rows[2][3]).to.equal(secondBoreholeName);

      expect(rows[0][34]).to.equal("IDInfoGeol");
      expect(rows[1][34]).to.equal("");
      expect(rows[2][34]).to.equal("14");

      expect(rows[0][35]).to.equal("IDGeODin\r");
      expect(rows[1][35]).to.equal("13\r");
      expect(rows[2][35]).to.equal("\r");
    });
    deleteItem();
    handlePrompt("Do you really want to delete these 2 boreholes? This cannot be undone.", "delete");
  });

  it("downloads a maximum of 100 boreholes", () => {
    goToRouteAndAcceptTerms("/");
    deleteDownloadedFile(csvFileName);
    deleteDownloadedFile(jsonFileName);
    showTableAndWaitForData();
    checkAllVisibleRows();
    deleteDownloadedFile(csvFileName);
    exportItem();

    const moreThan100SelectedPrompt =
      "You have selected more than 100 boreholes and a maximum of 100 boreholes can be exported. Do you want to continue?";
    handlePrompt(moreThan100SelectedPrompt, "cancel");
    exportItem();
    handlePrompt(moreThan100SelectedPrompt, "export100Boreholes");
    exportItem();
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

  it("exports a single borehole as csv and json", () => {
    const boreholeName = "AAA_HIPPOPOTHAMUS";
    createBorehole({
      originalName: boreholeName,
      name: boreholeName,
    }).as("borehole_id");

    deleteDownloadedFile(`${boreholeName}.json`);
    deleteDownloadedFile(`${boreholeName}.csv`);

    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}`);
      cy.dataCy("edit-button").should("exist");
      cy.dataCy("editingstop-button").should("not.exist");
      exportItem();
      exportJsonItem();
      exportItem();
      exportCSVItem();
    });

    readDownloadedFile(`${boreholeName}.json`);
    readDownloadedFile(`${boreholeName}.csv`);
  });

  it("exports a single borehole with attachment as zip file", () => {
    const boreholeName = "COLDWATER";
    createBorehole({
      originalName: boreholeName,
      name: boreholeName,
    }).as("borehole_id");

    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}/attachments`);
      startBoreholeEditing();

      selectInputFile("FREEZINGCOLD.txt", "text/plain");

      cy.dataCy("addProfile-button").should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);

      exportItem("detail-header");
      exportZipItem();
    });

    readDownloadedFile(`${boreholeName}.zip`);
  });

  it("exports a single borehole from rich boreholes range and asserts stratigraphy", () => {
    const id = 1000055;
    goToRouteAndAcceptTerms(`/${id}`);
    const fileName = "Mohammed_Rice.json";

    exportItem("detail-header");
    exportJsonItem();

    cy.wait("@borehole_export_json").its("response.statusCode").should("eq", 200);
    readDownloadedFile(fileName);

    cy.readFile(prepareDownloadPath(fileName)).then(fileContent => {
      const json = typeof fileContent === "string" ? JSON.parse(fileContent) : fileContent;
      expect(json).to.be.an("array");
      expect(json[0].Stratigraphies).to.be.an("array");

      //First Stratigraphy
      expect(json[0].Stratigraphies[0]).to.have.property("IsPrimary");
      expect(json[0].Stratigraphies[0]).to.have.property("Name");
      expect(json[0].Stratigraphies[0]).to.have.property("Lithologies");
      expect(json[0].Stratigraphies[0].Lithologies).to.be.an("array");
      expect(json[0].Stratigraphies[0]).to.have.property("LithologicalDescriptions");
      expect(json[0].Stratigraphies[0].LithologicalDescriptions).to.be.an("array");
      expect(json[0].Stratigraphies[0]).to.have.property("FaciesDescriptions");
      expect(json[0].Stratigraphies[0].FaciesDescriptions).to.be.an("array");
      expect(json[0].Stratigraphies[0]).to.have.property("ChronostratigraphyLayers");
      expect(json[0].Stratigraphies[0].ChronostratigraphyLayers).to.be.an("array");
      expect(json[0].Stratigraphies[0]).to.have.property("LithostratigraphyLayers");
      expect(json[0].Stratigraphies[0].LithostratigraphyLayers).to.be.an("array");

      //First LithologicalDescription
      expect(json[0].Stratigraphies[0].LithologicalDescriptions[0]).to.have.property("Description");
      expect(json[0].Stratigraphies[0].LithologicalDescriptions[0]).to.have.property("ToDepth");

      //First FaciesDescription
      expect(json[0].Stratigraphies[0].FaciesDescriptions[0]).to.have.property("Description");
      expect(json[0].Stratigraphies[0].FaciesDescriptions[0]).to.have.property("FaciesId");
      expect(json[0].Stratigraphies[0].FaciesDescriptions[0]).to.have.property("FromDepth");

      //First Lithology
      expect(json[0].Stratigraphies[0].Lithologies[0]).to.have.property("IsUnconsolidated");
      expect(json[0].Stratigraphies[0].Lithologies[0]).to.have.property("ToDepth");
      expect(json[0].Stratigraphies[0].Lithologies[0]).to.have.property("LithologyDescriptions");

      //First LithologyDescription
      expect(json[0].Stratigraphies[0].Lithologies[0].LithologyDescriptions[0]).to.have.property(
        "LithologyUnconMainId",
      );
      expect(
        json[0].Stratigraphies[0].Lithologies[0].LithologyDescriptions[0].LithologyUnconDebrisCodelistIds,
      ).to.be.an("array");
    });
    deleteDownloadedFile(fileName);
  });

  it("exports a single borehole with observations", () => {
    const boreholeName = "AQUABED";
    const fileName = `${boreholeName}.json`;
    createBorehole({
      originalName: boreholeName,
      name: boreholeName,
    }).as("borehole_id");

    cy.get("@borehole_id").then(id => {
      createWateringress(id, "2012-11-14T12:06Z", 15203157, 15203161, null, 0, 10);
      goToRouteAndAcceptTerms(`/${id}/hydrogeology/wateringress`);

      exportItem("detail-header");
      exportJsonItem();

      cy.wait("@borehole_export_json").its("response.statusCode").should("eq", 200);
      readDownloadedFile(fileName);

      const expectedObservation = {
        CasingId: null,
        Comment: null,
        ConditionsId: null,
        Duration: null,
        EndTime: null,
        FromDepthM: 0,
        FromDepthMasl: null,
        IsOpenBorehole: false,
        OriginalVerticalReferenceSystem: 0,
        QuantityId: 15203161,
        ReliabilityId: 15203157,
        StartTime: "2012-11-14T12:06:00Z",
        ToDepthM: 10,
        ToDepthMasl: null,
        Type: 1,
      };

      cy.readFile(prepareDownloadPath(fileName)).then(fileContent => {
        const json = typeof fileContent === "string" ? JSON.parse(fileContent) : fileContent;
        expect(json).to.be.an("array");
        expect(json[0]).to.have.property("Observations");
        expect(json[0].Observations).to.be.an("array");
        expect(json[0].Observations).to.deep.include(expectedObservation);
      });

      deleteDownloadedFile(fileName);
    });
  });

  it("displays an error message when file was not found on S3 store", () => {
    goToRouteAndAcceptTerms("/");
    showTableAndWaitForData();
    checkTwoFirstRows();
    exportItem();

    // Fake Api error as returned from API
    cy.intercept("GET", "/api/v2/export/zip?**", {
      statusCode: 500,
      body: {
        title: "NoSuchKey",
        status: 500,
        detail: "An error occurred while fetching a file from the cloud storage.",
      },
    }).as("exportZipError");

    exportZipItem();
    cy.get(".MuiAlert-message").contains("An error occurred while fetching a file from the cloud storage.");
  });

  // TODO: Reactivate this test when import is fixed https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2174
  it.skip("exports and reimports a borehole using csv", () => {
    const boreholeName = "AAA_WALRUS";
    createBorehole({
      originalName: boreholeName,
      name: boreholeName,
      originalReferenceSystem: referenceSystems.LV95.code,
    }).as("borehole_id");

    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}`);
      startBoreholeEditing();

      // set two custom identifiers
      addItem("addIdentifier");
      setSelect("boreholeCodelists.0.codelistId", 1);
      setInput("boreholeCodelists.0.value", "w1");

      addItem("addIdentifier");
      setSelect("boreholeCodelists.1.codelistId", 2);
      setInput("boreholeCodelists.1.value", "w2");

      // add coordinates
      cy.get('[data-cy="locationX-formCoordinate"] input').type("2646000 ");
      cy.get('[data-cy="locationY-formCoordinate"] input').type("1247000 ");
      cy.wait("@location");
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(4000);
      saveWithSaveBar();

      exportItem();
      exportCSVItem();

      const downloadedFilePath = prepareDownloadPath(`${boreholeName}.csv`);
      cy.readFile(downloadedFilePath).should("exist");

      returnToOverview();
      showTableAndWaitForData();
      checkRowWithText(boreholeName);
      deleteItem();
      handlePrompt("Do you really want to delete this borehole? This cannot be undone.", "delete");
      cy.dataCy("import-borehole-button").click();
      cy.contains(boreholeName).should("not.exist");

      cy.readFile(downloadedFilePath, "utf-8").then(fileContent => {
        // Create a DataTransfer and a File from the downloaded content
        const boreholeFile = new DataTransfer();
        const file = new File([fileContent], `${boreholeName}.csv`, {
          type: "text/csv",
        });
        boreholeFile.items.add(file);

        cy.dataCy("import-boreholeFile-input").within(() => {
          cy.get("input[type=file]", { force: true }).then(input => {
            input[0].files = boreholeFile.files; // Attach the file
            input[0].dispatchEvent(new Event("change", { bubbles: true }));
          });
        });
        cy.dataCy("import-button").click();
        cy.wait("@borehole-upload");
      });

      clickOnRowWithText(boreholeName);
      evaluateInput("name", boreholeName);
      evaluateInput("boreholeCodelists.1.value", "w1");
      evaluateInput("boreholeCodelists.0.value", "w2");
      cy.get('[data-cy="locationX-formCoordinate"] input').should("have.value", `2'646'000`);
      cy.get('[data-cy="locationY-formCoordinate"] input').should("have.value", `1'247'000`);
    });
  });
});
