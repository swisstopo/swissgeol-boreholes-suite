import { deleteItem, exportItem, exportZipItem } from "../helpers/buttonHelpers";
import {
  checkAllVisibleRows,
  clickOnRowWithText,
  showTableAndWaitForData,
  verifyRowContains,
} from "../helpers/dataGridHelpers";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers";
import {
  createBorehole,
  getImportFileFromFixtures,
  giveAdminUser2workgroups,
  goToDetailRouteAndAcceptTerms,
  goToRouteAndAcceptTerms,
  handlePrompt,
  returnToOverview,
  selectInputFile,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

const addMinimalAttachment = (boreholeIdentifier: string, fileName: string) => {
  cy.get(boreholeIdentifier).then(id => {
    goToDetailRouteAndAcceptTerms(`/${id}/attachments`);
    startBoreholeEditing();
    selectInputFile(fileName, "text/plain");
    cy.dataCy("addProfile-button").should("be.visible").click();
    cy.wait(["@upload-files", "@getAllAttachments", "@borehole_by_id"]);
    stopBoreholeEditing();
  });
};

const dropFileIntoImportDropzone = (boreholeFile: DataTransfer) => {
  cy.dataCy("import-boreholeFile-input").within(() => {
    cy.get("input[type=file]").then(input => {
      (input[0] as HTMLInputElement).files = boreholeFile.files;
      input[0].dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
};

const testBadRequestError = (
  endpoint: string,
  statusCode: number,
  responseBody: object,
  fileName: string,
  fileType: string,
  expectedMessage: string,
) => {
  cy.intercept("POST", `**/api/v*/import/${endpoint}`, {
    statusCode,
    body: responseBody,
    headers: { "content-type": "application/problem+json" },
  });
  goToRouteAndAcceptTerms("/");
  cy.dataCy("import-borehole-button").click();
  const file = new File([fileName.includes("empty") ? "" : "content"], fileName, { type: fileType });
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);
  dropFileIntoImportDropzone(dataTransfer);

  cy.dataCy("import-button").click();
  cy.contains(expectedMessage);
};

describe("Test for importing boreholes.", () => {
  it("displays error for invalid or empty CSV file", () => {
    testBadRequestError(
      "csv",
      400,
      { detail: "Invalid or empty CSV file uploaded.", messageKey: "invalidOrEmptyCsvFile" },
      "empty.csv",
      "text/csv",
      "Invalid or empty CSV file uploaded.",
    );
  });

  it("displays error for invalid or empty JSON file", () => {
    testBadRequestError(
      "json",
      400,
      { detail: "Invalid or empty JSON file uploaded.", messageKey: "invalidOrEmptyJsonFile" },
      "empty.json",
      "application/json",
      "Invalid or empty JSON file uploaded.",
    );
  });

  it("displays error for invalid or empty ZIP file", () => {
    testBadRequestError(
      "zip",
      400,
      { detail: "Invalid or empty ZIP file uploaded.", messageKey: "invalidOrEmptyZipFile" },
      "empty.zip",
      "application/zip",
      "Invalid or empty ZIP file uploaded.",
    );
  });

  it("displays generic error message on request failure", () => {
    cy.intercept("POST", "api/v2/import/json*", req => req.destroy());
    goToRouteAndAcceptTerms("/");
    cy.dataCy("import-borehole-button").click();
    const fileName = "empty.json";
    const file = new File([fileName.includes("empty") ? "" : "content"], fileName, { type: "application/json" });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    dropFileIntoImportDropzone(dataTransfer);

    cy.dataCy("import-button").click();
    cy.contains(
      "No boreholes could be imported! Please make sure that the uploaded file has the correct format and content.",
    );
  });

  it("Successfully imports multiple boreholes with CSV.", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("import-borehole-button").click();

    // Select borehole csv file
    const boreholeFile = new DataTransfer();
    getImportFileFromFixtures("boreholes-multiple-valid.csv", "utf-8").then(fileContent => {
      const file = new File([fileContent], "boreholes-multiple-valid.csv", {
        type: "text/csv",
      });
      boreholeFile.items.add(file);
    });
    dropFileIntoImportDropzone(boreholeFile);

    // Import boreholes
    cy.dataCy("import-button").click();
    cy.wait("@borehole-upload");

    // Check if boreholes were imported
    cy.contains("boreholes were imported");
  });

  it("Displays borehole validation errors, when importing with CSV.", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("import-borehole-button").click();

    // Select borehole csv file
    getImportFileFromFixtures("boreholes-missing-required-fields.csv", null)
      .then(fileContent => {
        const file = new File([fileContent], "boreholes-missing-required-fields.csv", {
          type: "text/csv",
        });
        const boreholeFile = new DataTransfer();
        boreholeFile.items.add(file);
        return boreholeFile;
      })
      .then(boreholeFile => {
        dropFileIntoImportDropzone(boreholeFile);
      });
    cy.dataCy("import-button").click();

    cy.wait("@borehole-upload");
    cy.dataCy("borehole-import-dialog")
      .should("not.contain", "Row0")
      .should("contain", "Row1")
      .should("contain", "Field 'location_x' is required.")
      .should("contain", "Row2")
      .should("not.contain", "Row3");
  });

  it("can select workgroup when importing boreholes", () => {
    giveAdminUser2workgroups();
    goToRouteAndAcceptTerms(`/`);
    cy.dataCy("import-borehole-button").click();
    cy.dataCy("workgroup-formSelect").click();
    // Verify two workgroup options are visible
    cy.contains("Reset");
    cy.contains("Default");
    cy.contains("Blue");
  });

  it("exports and reimports boreholes with attachments", () => {
    const boreholeName = "COLDWATERDRINK";
    const boreholeName2 = "COLDWATERBATH";
    createBorehole({
      originalName: boreholeName,
      name: boreholeName,
      locationX: 100,
      locationY: 200,
    }).as("borehole_id");

    createBorehole({
      originalName: boreholeName2,
      name: boreholeName2,
      locationX: 300,
      locationY: 400,
    }).as("borehole_id2");

    addMinimalAttachment("@borehole_id", "FREEZINGCOLD.txt");
    addMinimalAttachment("@borehole_id2", "NICEANDCOOL.txt");
    addMinimalAttachment("@borehole_id2", "BREWINGHOT.txt");

    returnToOverview();
    cy.dataCy("show-filter-button").click();
    cy.contains("Location").click();
    cy.contains("Original name").next().find("input").type("COLDWATER");
    cy.wait("@edit_list");
    showTableAndWaitForData();

    cy.dataCy("boreholes-number-preview").should("have.text", "2");
    verifyRowContains("COLDWATERBATH", 0);
    verifyRowContains("COLDWATERDRINK", 1);

    checkAllVisibleRows();
    exportItem();
    exportZipItem();
    deleteItem();
    handlePrompt("Do you really want to delete these 2 boreholes? This cannot be undone.", "delete");

    // verify that boreholes were deleted
    cy.wait("@edit_deletelist");
    cy.dataCy("boreholes-number-preview").should("have.text", "0");

    // reupload prepared zip file
    getImportFileFromFixtures("COLDWATER.zip", "binary").then(fileContent => {
      const blob = Cypress.Blob.binaryStringToBlob(fileContent, "application/zip");
      const fileToReupload = new File([blob], "COLDWATER.zip", { type: "application/zip" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(fileToReupload);
      cy.dataCy("import-borehole-button").click();
      dropFileIntoImportDropzone(dataTransfer);
      cy.dataCy("import-button").click();
      cy.dataCy("boreholes-number-preview").should("have.text", "2");
      verifyRowContains("COLDWATERBATH", 0);
      verifyRowContains("COLDWATERDRINK", 1);
      clickOnRowWithText("COLDWATERBATH");
      navigateInSidebar(SidebarMenuItem.attachments);
      cy.contains("NICEANDCOOL.txt");
      cy.contains("BREWINGHOT.txt");
    });
  });
});
