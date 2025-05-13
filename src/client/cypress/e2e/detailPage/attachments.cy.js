import { deleteItem, exportItem, saveWithSaveBar } from "../helpers/buttonHelpers.js";
import {
  checkAllVisibleRows,
  checkRowWithText,
  uncheckAllVisibleRows,
  verifyRowContains,
  verifyRowWithContentAlsoContains,
  verifyTableLength,
} from "../helpers/dataGridHelpers.js";
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

const checkPublicStatus = (text, checked, editingEnabled) => {
  if (editingEnabled) {
    cy.contains(".MuiDataGrid-row", text)
      .find('.public input[type="checkbox"]')
      .should(checked ? "be.checked" : "not.be.checked");
  } else {
    cy.contains(".MuiDataGrid-row", text)
      .find(".public")
      .should(checked ? "exist" : "not.exist");
  }
};

const setPublicStatus = (text, check) => {
  if (check) {
    cy.contains(".MuiDataGrid-row", text).find('.public input[type="checkbox"]').check();
  } else {
    cy.contains(".MuiDataGrid-row", text).find('.public input[type="checkbox"]').uncheck();
  }
};

describe("Tests for 'Attachments' edit page.", () => {
  const photoFilename = "HARDOASIS_10.00-120.00_all.jpg";

  const uploadLoudSpatulaFile = () => {
    selectInputFile("LOUDSPATULA.txt", "text/plain");

    // upload file
    getElementByDataCy("addProfile-button").should("be.visible").click();
    cy.wait(["@upload-files", "@getAllAttachments"]);
  };

  const uploadPhoto = () => {
    selectInputFile(photoFilename, "image/jpeg");

    getElementByDataCy("addPhoto-button").should("be.visible").click();
    cy.wait(["@upload-photo", "@getAllPhotos"]);
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
      getElementByDataCy("addProfile-button").should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);

      verifyTableLength(2);
      verifyRowContains("application/pdf", 1);

      // Upload and verify file "IRATETRINITY.pdf" for the second time but with different file name.
      selectInputFile("IRATETRINITY_2.pdf", "application/pdf");
      getElementByDataCy("addProfile-button").should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);

      verifyTableLength(3);
      verifyRowContains("application/pdf", 2);

      // Upload and verify file "WHITE   SPACE.pdf" to test file names with white spaces.
      selectInputFile("WHITE   SPACE.pdf", "application/pdf");
      cy.get('[data-cy="addProfile-button"]').should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);
      verifyTableLength(4);
      verifyRowContains("application/pdf", 3);

      // Ensure files does not exist in download folder before download. If so, delete them.
      deleteDownloadedFile("IRATETRINITY_2.pdf");
      deleteDownloadedFile("WHITE___SPACE.pdf");

      // Download recently uploaded file
      checkRowWithText("IRATETRINITY_2.pdf");
      checkRowWithText("WHITE___SPACE.pdf");
      exportItem("attachment-table-container");
      cy.wait("@download-file");

      // Check if the file is present in download folder.
      readDownloadedFile("IRATETRINITY_2.pdf");
      readDownloadedFile("WHITE___SPACE.pdf");

      // edit attachment description and public status
      stopBoreholeEditing();
      checkPublicStatus("IRATETRINITY_2.pdf", false, false);
      checkPublicStatus("WHITE___SPACE.pdf", false, false);
      startBoreholeEditing();

      getElementByDataCy("public-header").find('input[type="checkbox"]').should("not.be.checked");
      checkPublicStatus("IRATETRINITY_2.pdf", false, true);
      checkPublicStatus("WHITE___SPACE.pdf", false, true);
      setPublicStatus("IRATETRINITY_2.pdf", true);
      getElementByDataCy("public-header").find(".MuiCheckbox-indeterminate").should("exist");
      getElementByDataCy("public-header").find('input[type="checkbox"]').click();
      getElementByDataCy("public-header").find('input[type="checkbox"]').should("be.checked");
      checkPublicStatus("LOUDSPATULA.txt", true, true);
      checkPublicStatus("IRATETRINITY.pdf", true, true);
      checkPublicStatus("IRATETRINITY_2.pdf", true, true);
      checkPublicStatus("WHITE___SPACE.pdf", true, true);
      setPublicStatus("IRATETRINITY.pdf", false);
      getElementByDataCy("public-header").find(".MuiCheckbox-indeterminate").should("exist");
      setPublicStatus("IRATETRINITY.pdf", true);
      getElementByDataCy("public-header").find('input[type="checkbox"]').should("be.checked");
      getElementByDataCy("public-header").find('input[type="checkbox"]').click();
      getElementByDataCy("public-header").find('input[type="checkbox"]').should("not.be.checked");
      checkPublicStatus("LOUDSPATULA.txt", false, true);
      checkPublicStatus("IRATETRINITY.pdf", false, true);
      checkPublicStatus("IRATETRINITY_2.pdf", false, true);
      checkPublicStatus("WHITE___SPACE.pdf", false, true);
      setPublicStatus("IRATETRINITY_2.pdf", true);

      cy.contains(".MuiDataGrid-row", "IRATETRINITY_2.pdf").find(`[data-cy="profile-description"]`).click();
      cy.contains(".MuiDataGrid-row", "IRATETRINITY_2.pdf")
        .find(`[data-cy="profile-description"]`)
        .find('input[type="text"]')
        .type("a brand new description");

      saveWithSaveBar();

      // stop editing and verify table content
      stopBoreholeEditing();
      verifyRowWithContentAlsoContains("IRATETRINITY_2.pdf", "a brand new description");
      checkPublicStatus("IRATETRINITY_2.pdf", true, false);
      checkPublicStatus("WHITE___SPACE.pdf", false, false);

      checkAllVisibleRows();
      uncheckAllVisibleRows();

      startBoreholeEditing();

      // delete attachments
      checkRowWithText("IRATETRINITY_2.pdf");
      deleteItem("attachment-table-container");
      cy.wait(["@delete-file", "@getAllAttachments"]);
      verifyTableLength(3);

      checkAllVisibleRows();
      deleteItem("attachment-table-container");
      cy.wait(["@delete-file", "@getAllAttachments"]);
      verifyTableLength(0);

      // reset test data
      deleteBorehole(boreholeId);
    });
  });

  it("creates, exports and deletes photos.", () => {
    createBorehole({ "extended.original_name": "JUNIORSOUFFLE" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToRouteAndAcceptTerms(`/${boreholeId}`);

      startBoreholeEditing();
      // navigate to photos tab
      getElementByDataCy("attachments-menu-item").click();
      getElementByDataCy("photos-tab").click();

      uploadPhoto();

      // check table entry
      verifyTableLength(1);
      verifyRowContains("10 - 120", 0);

      // ensure file does not exist in download folder before download
      deleteDownloadedFile(photoFilename);

      // export photo
      checkRowWithText(photoFilename);
      exportItem("attachment-table-container");
      cy.wait("@export-photos");

      // check if the file is present in download folder
      readDownloadedFile(photoFilename);

      checkPublicStatus(photoFilename, false, true);
      getElementByDataCy("public-header").find('input[type="checkbox"]').should("not.be.checked");
      getElementByDataCy("public-header").find('input[type="checkbox"]').click();
      getElementByDataCy("public-header").find('input[type="checkbox"]').should("be.checked");
      checkPublicStatus(photoFilename, true, true);
      setPublicStatus(photoFilename, false);
      getElementByDataCy("public-header").find('input[type="checkbox"]').should("not.be.checked");
      setPublicStatus(photoFilename, true);
      saveWithSaveBar();

      // stop editing and verify table content
      stopBoreholeEditing();
      verifyRowContains(photoFilename, 0);
      verifyRowContains("10 - 120", 0);
      checkPublicStatus(photoFilename, true, false);

      // delete photo
      startBoreholeEditing();
      checkRowWithText(photoFilename);
      deleteItem("attachment-table-container");
      cy.wait(["@delete-photos", "@getAllPhotos"]);
      verifyTableLength(0);

      // reset test data
      deleteBorehole(boreholeId);
    });
  });

  it("can save changes on a borehole with attachments.", () => {
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
