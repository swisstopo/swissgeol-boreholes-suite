import {
  createBorehole,
  deleteBorehole,
  deleteDownloadedFile,
  loginAsAdmin,
  readDownloadedFile,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for 'Attachments' edit page.", () => {
  it("creates, downloads and deletes attachments.", () => {
    createBorehole({ "extended.original_name": "JUNIORSOUFFLE" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      loginAsAdmin(`/${boreholeId}`);

      startBoreholeEditing();

      // navigate to attachments tab
      cy.get('[data-cy="attachments-menu-item"]').click();

      // intercept get all Attachments for borehole request
      cy.intercept("/api/v2/boreholefile/getAllForBorehole?boreholeId=**").as("getAllAttachments");
      // intercept upload file request
      cy.intercept("/api/v2/boreholefile/upload?boreholeId=**").as("upload-files");

      // create file "LOUDSPATULA.pdf" for input
      cy.get("input[type=file]").selectFile(
        {
          contents: Cypress.Buffer.from(Math.random().toString()),
          fileName: "LOUDSPATULA.txt",
          mimeType: "text/plain",
        },
        { force: true },
      );

      // // upload file
      cy.get('[data-cy="attachments-upload-button"]').should("be.visible").click();
      cy.wait(["@upload-files"]);
      cy.wait(["@getAllAttachments"]);

      // check list of attachments
      cy.get("tbody").children().should("have.length", 1);
      cy.get("tbody").children().contains("td", "text/plain");

      // create file "IRATETRINITY.pdf" for input
      let fileContent = Math.random().toString();
      cy.get("input[type=file]").selectFile(
        {
          contents: Cypress.Buffer.from(fileContent),
          fileName: "IRATETRINITY.pdf",
          mimeType: "application/pdf",
        },
        { force: true },
      );

      // upload and verify file IRATETRINITY.pdf
      cy.get('[data-cy="attachments-upload-button"]').should("be.visible").click();
      cy.wait(["@upload-files"]);
      cy.wait(["@getAllAttachments"]);
      cy.get("tbody").children().should("have.length", 2);
      cy.get("tbody").children().contains("td", "text/plain");
      cy.get("tbody").children().contains("td", "application/pdf");

      // Select "IRATETRINITY.pdf" second time.
      cy.get("input[type=file]").selectFile(
        {
          contents: Cypress.Buffer.from(fileContent),
          fileName: "IRATETRINITY.pdf",
          mimeType: "application/pdf",
        },
        { force: true },
      );

      // Upload "IRATETRINITY.pdf" second time. Should not be uploaded.
      cy.get('[data-cy="attachments-upload-button"]').should("be.visible").click();
      cy.wait(["@upload-files"]);

      // Check if error message is displayed.
      cy.contains("This file has already been uploaded for this borehole");

      // Ensure file does not exist in download folder before download. If so, delete it.
      deleteDownloadedFile("IRATETRINITY.pdf");

      // intercept download file request
      cy.intercept("/api/v2/boreholefile/download?boreholeFileId=**").as("download-file");

      // Download recently uploaded file
      cy.get("tbody").children().contains("span", "IRATETRINITY.pdf").click();
      cy.wait("@download-file");

      // Check if file is present in download folder.
      readDownloadedFile("IRATETRINITY.pdf");

      // intercept delete file request
      cy.intercept("/api/v2/boreholefile/detachFile?boreholeId=**&boreholeFileId=**").as("delete-file");

      // delete attachments
      cy.get("tbody").children().first().get("td button").children().first().click();
      cy.wait(["@delete-file"]);
      cy.wait(["@getAllAttachments"]);
      cy.get("tbody").children().first().get("td button").children().first().click();
      cy.wait(["@delete-file"]);
      cy.wait(["@getAllAttachments"]);
      cy.get("tbody").children().should("have.length", 0);

      // stop editing
      stopBoreholeEditing();

      // reset test data
      deleteBorehole(boreholeId);
    });
  });
});
