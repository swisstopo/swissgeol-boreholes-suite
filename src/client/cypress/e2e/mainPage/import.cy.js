import { deleteItem, exportItem, exportZipItem } from "../helpers/buttonHelpers.js";
import {
  checkAllVisibleRows,
  clickOnRowWithText,
  showTableAndWaitForData,
  verifyRowContains,
} from "../helpers/dataGridHelpers.js";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers.js";
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

const addMinimalAttachment = (boreholeIdentifier, fileName) => {
  cy.get(boreholeIdentifier).then(id => {
    goToDetailRouteAndAcceptTerms(`/${id}/attachments`);
    startBoreholeEditing();
    selectInputFile(fileName, "text/plain");
    cy.dataCy("addProfile-button").should("be.visible").click();
    cy.wait(["@upload-files", "@getAllAttachments", "@borehole_by_id"]);
    stopBoreholeEditing();
  });
};

const dropFileIntoImportDropzone = boreholeFile => {
  cy.dataCy("import-boreholeFile-input").within(() => {
    cy.get("input[type=file]", { force: true }).then(input => {
      input[0].files = boreholeFile.files;
      input[0].dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
};

describe("Test for importing boreholes.", () => {
  it("Successfully imports multiple boreholes with CSV.", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("import-borehole-button").click();

    // Select borehole csv file
    let boreholeFile = new DataTransfer();
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
    getImportFileFromFixtures("boreholes-missing-fields-and-duplicates.csv", null)
      .then(fileContent => {
        const file = new File([fileContent], "boreholes-missing-fields-and-duplicates.csv", {
          type: "text/csv",
        });
        let boreholeFile = new DataTransfer();
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
      .should("contain", "Row4")
      .should("contain", "Row5")
      .should("contain", "Borehole with same Coordinates (+/- 2m) and same TotalDepth is provided multiple times.");
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
