import { deleteItem, exportItem, exportZipItem } from "../helpers/buttonHelpers.js";
import {
  checkAllVisibleRows,
  clickOnRowWithText,
  showTableAndWaitForData,
  verifyRowContains,
} from "../helpers/dataGridHelpers.js";
import {
  createBorehole,
  getElementByDataCy,
  getImportFileFromFixtures,
  goToRouteAndAcceptTerms,
  handlePrompt,
  loginAsAdmin,
  returnToOverview,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

describe("Test for importing boreholes.", () => {
  it("Successfully imports multiple boreholes.", () => {
    loginAsAdmin();
    getElementByDataCy("import-borehole-button").click();

    // Select borehole csv file
    let boreholeFile = new DataTransfer();
    getImportFileFromFixtures("boreholes-multiple-valid.csv", "utf-8").then(fileContent => {
      const file = new File([fileContent], "boreholes-multiple-valid.csv", {
        type: "text/csv",
      });
      boreholeFile.items.add(file);
    });

    getElementByDataCy("import-boreholeFile-input").within(() => {
      cy.get("input[type=file]", { force: true }).then(input => {
        input[0].files = boreholeFile.files;
        input[0].dispatchEvent(new Event("change", { bubbles: true }));
      });
    });

    // Import boreholes
    getElementByDataCy("import-button").click();
    cy.wait("@borehole-upload");

    // Check if boreholes were imported
    cy.contains("boreholes were imported");
  });

  it("Displays borehole validation errors.", () => {
    loginAsAdmin();
    getElementByDataCy("import-borehole-button").click();

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
        getElementByDataCy("import-boreholeFile-input").within(() => {
          cy.get("input[type=file]", { force: true }).then(input => {
            input[0].files = boreholeFile.files;
            input[0].dispatchEvent(new Event("change", { bubbles: true }));
          });
        });
      });
    getElementByDataCy("import-button").click();

    cy.wait("@borehole-upload");
    getElementByDataCy("borehole-import-dialog")
      .should("not.contain", "Row0")
      .should("contain", "Row1")
      .should("contain", "Field 'location_x' is required.")
      .should("contain", "Row2")
      .should("contain", "Row4")
      .should("contain", "Row5")
      .should("contain", "Borehole with same Coordinates (+/- 2m) and same TotalDepth is provided multiple times.");
  });

  it("exports and reimports boreholes with attachments", () => {
    // add two boreholes with attachments
    const boreholeName = "COLDWATERDRINK";
    const boreholeName2 = "COLDWATERBATH";
    createBorehole({
      "extended.original_name": boreholeName,
      "custom.alternate_name": boreholeName,
      location_x: 100,
      location_y: 200,
    }).as("borehole_id");

    createBorehole({
      "extended.original_name": boreholeName2,
      "custom.alternate_name": boreholeName2,
      location_x: 300,
      location_y: 400,
    }).as("borehole_id2");

    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}/attachments`);
      startBoreholeEditing();

      cy.get("input[type=file]").selectFile(
        {
          contents: Cypress.Buffer.from(Math.random().toString()),
          fileName: "FREEZINGCOLD.txt",
          mimeType: "text/plain",
        },
        { force: true },
      );

      getElementByDataCy("attachments-upload-button").should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);
      stopBoreholeEditing();
    });

    cy.get("@borehole_id2").then(id => {
      goToRouteAndAcceptTerms(`/${id}/attachments`);
      startBoreholeEditing();
      cy.get("input[type=file]").selectFile(
        {
          contents: Cypress.Buffer.from(Math.random().toString()),
          fileName: "NICEANDCOOL.txt",
          mimeType: "text/plain",
        },
        { force: true },
      );

      getElementByDataCy("attachments-upload-button").should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);
      cy.get("input[type=file]").selectFile(
        {
          contents: Cypress.Buffer.from(Math.random().toString()),
          fileName: "BREWINGHOT.txt",
          mimeType: "text/plain",
        },
        { force: true },
      );

      getElementByDataCy("attachments-upload-button").should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);
      stopBoreholeEditing();
    });

    returnToOverview();
    getElementByDataCy("show-filter-button").click();
    cy.contains("Location").click();
    cy.contains("Original name").next().find("input").type("COLDWATER");
    cy.wait("@edit_list");
    showTableAndWaitForData();

    getElementByDataCy("boreholes-number-preview").should("have.text", "2");
    verifyRowContains("COLDWATERBATH", 0);
    verifyRowContains("COLDWATERDRINK", 1);

    checkAllVisibleRows();
    exportItem();
    exportZipItem();
    deleteItem();
    handlePrompt("Do you really want to delete these 2 boreholes? This cannot be undone.", "Delete");

    // verify that boreholes were deleted
    cy.wait("@edit_deletelist");
    getElementByDataCy("boreholes-number-preview").should("have.text", "0");

    // reupload prepared zip file
    getImportFileFromFixtures("COLDWATER.zip", "binary").then(fileContent => {
      const blob = Cypress.Blob.binaryStringToBlob(fileContent, "application/zip");
      const fileToReupload = new File([blob], "COLDWATER.zip", { type: "application/zip" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(fileToReupload);
      getElementByDataCy("import-borehole-button").click();
      getElementByDataCy("import-boreholeFile-input").within(() => {
        cy.get('input[type="file"]', { force: true }).then(input => {
          input[0].files = dataTransfer.files;
          input[0].dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
      getElementByDataCy("import-button").click();
      getElementByDataCy("boreholes-number-preview").should("have.text", "2");
      verifyRowContains("COLDWATERBATH", 0);
      verifyRowContains("COLDWATERDRINK", 1);
      clickOnRowWithText("COLDWATERBATH");
      getElementByDataCy("attachments-menu-item").click();
      cy.contains("NICEANDCOOL.txt");
      cy.contains("BREWINGHOT.txt");
    });
  });
});
