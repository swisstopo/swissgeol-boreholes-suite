import { saveWithSaveBar } from "../helpers/buttonHelpers.js";
import { checkRowWithText, verifyRowContains, verifyTableLength } from "../helpers/dataGridHelpers.js";
import { evaluateInput, setInput } from "../helpers/formHelpers.js";
import {
  createBorehole,
  deleteBorehole,
  deleteDownloadedFile,
  getElementByDataCy,
  goToRouteAndAcceptTerms,
  readDownloadedFile,
  selectInputFile,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for 'Attachments' edit page.", () => {
  const uploadLoudSpatulaFile = () => {
    selectInputFile("LOUDSPATULA.txt", "text/plain");

    // // upload file
    getElementByDataCy("attachments-upload-button").should("be.visible").click();
    cy.wait(["@upload-files", "@getAllAttachments"]);
  };

  it("creates, downloads and deletes attachments.", () => {
    createBorehole({ "extended.original_name": "JUNIORSOUFFLE" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToRouteAndAcceptTerms(`/${boreholeId}`);

      startBoreholeEditing();
      // navigate to attachments tab
      getElementByDataCy("attachments-menu-item").click();
      uploadLoudSpatulaFile();

      // check list of attachments
      verifyTableLength(1);
      verifyRowContains("text/plain", 0);

      // create file "IRATETRINITY.pdf" for input
      selectInputFile("IRATETRINITY.pdf", "application/pdf");

      // upload and verify file IRATETRINITY.pdf
      getElementByDataCy("attachments-upload-button").should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);

      verifyTableLength(2);
      verifyRowContains("application/pdf", 1);

      // Upload and verify file "IRATETRINITY.pdf" for the second time but with different file name.
      selectInputFile("IRATETRINITY_2.pdf", "application/pdf");
      getElementByDataCy("attachments-upload-button").should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);

      verifyTableLength(3);
      verifyRowContains("application/pdf", 2);

      // Upload and verify file "WHITE   SPACE.pdf" to test file names with white spaces.
      selectInputFile("WHITE   SPACE.pdf", "application/pdf");
      cy.get('[data-cy="attachments-upload-button"]').should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);
      verifyTableLength(4);
      verifyRowContains("application/pdf", 3);

      // Ensure files does not exist in download folder before download. If so, delete them.
      deleteDownloadedFile("IRATETRINITY_2.pdf");
      deleteDownloadedFile("WHITE___SPACE.pdf");

      // Download recently uploaded file
      getElementByDataCy("'download-IRATETRINITY_2.pdf'").click();
      cy.wait("@download-file");

      // Check if the file is present in download folder.
      readDownloadedFile("IRATETRINITY_2.pdf");

      // Download recently uploaded file
      getElementByDataCy("'download-WHITE___SPACE.pdf'").click();
      cy.wait("@download-file");

      // Check if the file is present in download folder.
      readDownloadedFile("WHITE___SPACE.pdf");

      // edit attachment description and public status
      stopBoreholeEditing();
      cy.get('[class*="lucide-lock-open"]').should("not.exist");
      cy.get('[class*="lucide-lock"]').should("exist");
      startBoreholeEditing();
      getElementByDataCy("'input-IRATETRINITY_2.pdf'").type("a brand new description");
      checkRowWithText("IRATETRINITY.pdf"); // edit public status

      // stop editing and verify table content
      stopBoreholeEditing();
      verifyRowContains("a brand new description", 2);
      verifyRowContains("IRATETRINITY_2.pdf", 2);

      cy.get('[class*="lucide-lock-open"]').should("exist");
      cy.get('[class*="lucide-lock"]').should("exist");
      startBoreholeEditing();

      // delete attachments
      getElementByDataCy("attachments-detach-button").children().first().click();
      cy.wait(["@delete-file", "@getAllAttachments"]);
      verifyTableLength(3);
      getElementByDataCy("attachments-detach-button").children().first().click();
      cy.wait(["@delete-file", "@getAllAttachments"]);
      verifyTableLength(2);
      getElementByDataCy("attachments-detach-button").children().first().click();
      cy.wait(["@delete-file", "@getAllAttachments"]);
      verifyTableLength(1);
      getElementByDataCy("attachments-detach-button").children().first().click();
      cy.wait(["@delete-file", "@getAllAttachments"]);
      verifyTableLength(0);

      // reset test data
      deleteBorehole(boreholeId);
    });
  });

  it("can save changes on a  borehole with attachments.", () => {
    createBorehole({ "extended.original_name": "AAA_COBRA" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToRouteAndAcceptTerms(`/${boreholeId}`);
      startBoreholeEditing();
    });
    getElementByDataCy("attachments-menu-item").click();
    uploadLoudSpatulaFile();
    verifyTableLength(1);
    getElementByDataCy("borehole-menu-item").click();

    // change something and save
    setInput("totalDepth", 465);
    saveWithSaveBar();

    // navigate back to attachments and return
    getElementByDataCy("attachments-menu-item").click();
    verifyTableLength(1);

    getElementByDataCy("borehole-menu-item").click();
    evaluateInput("totalDepth", "465");
    stopBoreholeEditing();
  });
});
