import { saveWithSaveBar } from "../helpers/buttonHelpers.js";
import { evaluateInput, setInput } from "../helpers/formHelpers.js";
import {
  createBorehole,
  deleteBorehole,
  deleteDownloadedFile,
  getElementByDataCy,
  loginAsAdmin,
  readDownloadedFile,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for 'Attachments' edit page.", () => {
  const uploadLoudSpatulaFile = () => {
    cy.get("input[type=file]").selectFile(
      {
        contents: Cypress.Buffer.from(Math.random().toString()),
        fileName: "LOUDSPATULA.txt",
        mimeType: "text/plain",
      },
      { force: true },
    );

    // // upload file
    getElementByDataCy("attachments-upload-button").should("be.visible").click();
    cy.wait(["@upload-files", "@getAllAttachments"]);
  };

  it("creates, downloads and deletes attachments.", () => {
    createBorehole({ "extended.original_name": "JUNIORSOUFFLE" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      loginAsAdmin(`/${boreholeId}`);

      startBoreholeEditing();
      // navigate to attachments tab
      getElementByDataCy("attachments-menu-item").click();
      uploadLoudSpatulaFile();

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
      getElementByDataCy("attachments-upload-button").should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);
      cy.get("tbody").children().should("have.length", 2);
      cy.get("tbody").children().contains("td", "text/plain");
      cy.get("tbody").children().contains("td", "application/pdf");

      // Upload and verify file "IRATETRINITY.pdf" for the second time but with different file name.
      cy.get("input[type=file]").selectFile(
        {
          contents: Cypress.Buffer.from(fileContent),
          fileName: "IRATETRINITY_2.pdf",
          mimeType: "application/pdf",
        },
        { force: true },
      );
      getElementByDataCy("attachments-upload-button").should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);
      cy.get("tbody").children().should("have.length", 3);
      cy.get("tbody").children().contains("td", "text/plain");
      cy.get("tbody").children().contains("td", "application/pdf");

      // Upload and verify file "WHITE   SPACE.pdf" to test file names with white spaces.
      cy.get("input[type=file]").selectFile(
        {
          contents: Cypress.Buffer.from(fileContent),
          fileName: "WHITE   SPACE.pdf",
          mimeType: "application/pdf",
        },
        { force: true },
      );
      cy.get('[data-cy="attachments-upload-button"]').should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);
      cy.get("tbody").children().should("have.length", 4);
      cy.get("tbody").children().contains("td", "text/plain");
      cy.get("tbody").children().contains("td", "application/pdf");

      // Ensure files does not exist in download folder before download. If so, delete them.
      deleteDownloadedFile("IRATETRINITY_2.pdf");
      deleteDownloadedFile("WHITE   SPACE.pdf");

      // Download recently uploaded file
      cy.get("tbody").children().contains("span", "IRATETRINITY_2.pdf").click();
      cy.wait("@download-file");

      // Check if the file is present in download folder.
      readDownloadedFile("IRATETRINITY_2.pdf");

      // Download recently uploaded file
      cy.get("tbody").children().contains("span", "WHITE   SPACE.pdf").click();
      cy.wait("@download-file");

      // Check if the file is present in download folder.
      readDownloadedFile("WHITE   SPACE.pdf");

      // delete attachments
      getElementByDataCy("attachments-detach-button").children().first().click();
      cy.wait(["@delete-file", "@getAllAttachments"]);
      cy.get("tbody").children().should("have.length", 3);
      cy.get('[data-cy="attachments-detach-button"]').children().first().click();
      cy.wait(["@delete-file", "@getAllAttachments"]);
      cy.get("tbody").children().should("have.length", 2);
      cy.get('[data-cy="attachments-detach-button"]').children().first().click();
      cy.wait(["@delete-file", "@getAllAttachments"]);
      cy.get("tbody").children().should("have.length", 1);
      cy.get('[data-cy="attachments-detach-button"]').children().first().click();
      cy.wait(["@delete-file", "@getAllAttachments"]);
      cy.get("tbody").children().should("have.length", 0);

      // stop editing
      stopBoreholeEditing();

      // reset test data
      deleteBorehole(boreholeId);
    });
  });

  it("can save changes on a  borehole with attachments.", () => {
    createBorehole({ "extended.original_name": "AAA_COBRA" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      loginAsAdmin(`/${boreholeId}`);
      startBoreholeEditing();
    });
    getElementByDataCy("attachments-menu-item").click();
    uploadLoudSpatulaFile();
    cy.get("tbody").children().should("have.length", 1);
    getElementByDataCy("borehole-menu-item").click();

    // change something and save
    setInput("totalDepth", 465);
    saveWithSaveBar();

    // navigate back to attachments and return
    getElementByDataCy("attachments-menu-item").click();
    cy.get("tbody").children().should("have.length", 1);

    getElementByDataCy("borehole-menu-item").click();
    evaluateInput("totalDepth", "465");
    stopBoreholeEditing();
  });
});
