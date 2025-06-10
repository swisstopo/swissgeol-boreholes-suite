import { deleteItem, exportItem, saveForm, saveWithSaveBar } from "../helpers/buttonHelpers.js";
import {
  checkAllVisibleRows,
  checkRowWithIndex,
  checkRowWithText,
  uncheckAllVisibleRows,
  unCheckRowWithText,
  verifyRowContains,
  verifyRowWithContentAlsoContains,
  verifyRowWithTextCheckState,
  verifyTableLength,
  waitForTableData,
} from "../helpers/dataGridHelpers.js";
import { evaluateInput, setInput } from "../helpers/formHelpers.js";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers.js";
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
    verifyRowWithTextCheckState(text, checked, "public");
  } else {
    cy.contains(".MuiDataGrid-row", text)
      .find('[data-field="public"] svg')
      .should(checked ? "exist" : "not.exist");
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
      navigateInSidebar(SidebarMenuItem.attachments);
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
      checkRowWithText("IRATETRINITY_2.pdf", "public");
      getElementByDataCy("public-header").find(".MuiCheckbox-indeterminate").should("exist");
      getElementByDataCy("public-header").find('input[type="checkbox"]').click();
      getElementByDataCy("public-header").find('input[type="checkbox"]').should("be.checked");
      checkPublicStatus("LOUDSPATULA.txt", true, true);
      checkPublicStatus("IRATETRINITY.pdf", true, true);
      checkPublicStatus("IRATETRINITY_2.pdf", true, true);
      checkPublicStatus("WHITE___SPACE.pdf", true, true);
      unCheckRowWithText("IRATETRINITY.pdf", "public");
      getElementByDataCy("public-header").find(".MuiCheckbox-indeterminate").should("exist");
      checkRowWithText("IRATETRINITY.pdf", "public");
      getElementByDataCy("public-header").find('input[type="checkbox"]').should("be.checked");
      getElementByDataCy("public-header").find('input[type="checkbox"]').click();
      getElementByDataCy("public-header").find('input[type="checkbox"]').should("not.be.checked");
      checkPublicStatus("LOUDSPATULA.txt", false, true);
      checkPublicStatus("IRATETRINITY.pdf", false, true);
      checkPublicStatus("IRATETRINITY_2.pdf", false, true);
      checkPublicStatus("WHITE___SPACE.pdf", false, true);
      checkRowWithText("IRATETRINITY_2.pdf", "public");

      cy.contains(".MuiDataGrid-row", "IRATETRINITY_2.pdf").find(`[data-cy="profile-description"]`).click();
      cy.contains(".MuiDataGrid-row", "IRATETRINITY_2.pdf")
        .find(`[data-cy="profile-description"]`)
        .find("textarea:visible")
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
      navigateInSidebar(SidebarMenuItem.attachments);
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
      unCheckRowWithText(photoFilename, "public");
      getElementByDataCy("public-header").find('input[type="checkbox"]').should("not.be.checked");
      checkRowWithText(photoFilename, "public");
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
    navigateInSidebar(SidebarMenuItem.attachments);
    uploadLoudSpatulaFile();
    verifyTableLength(1);
    navigateInSidebar(SidebarMenuItem.borehole);

    // change something and save
    setInput("totalDepth", 465);
    saveWithSaveBar();

    // navigate back to attachments and return
    navigateInSidebar(SidebarMenuItem.attachments);
    verifyTableLength(1);

    navigateInSidebar(SidebarMenuItem.borehole);
    evaluateInput("totalDepth", "465");
    stopBoreholeEditing();
  });

  it("creates, edits and deletes documents.", () => {
    createBorehole({ "extended.original_name": "HAPPYBOOK" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToRouteAndAcceptTerms(`/${boreholeId}`);
      startBoreholeEditing();

      navigateInSidebar(SidebarMenuItem.attachments);
      getElementByDataCy("documents-tab").click();
      cy.wait("@getAllDocuments");

      // create 2 documents
      getElementByDataCy("addDocument-button").should("be.visible").click();
      cy.wait(["@document_POST", "@getAllDocuments"]);
      verifyTableLength(1);
      getElementByDataCy("addDocument-button").should("be.visible").click();
      cy.wait(["@document_POST", "@getAllDocuments"]);
      verifyTableLength(2);

      // add data to the first document
      cy.get(".MuiDataGrid-row")
        .first()
        .find(`[data-cy="document-url"]`)
        .find("input:visible")
        .type("https://localhost/document1.pdf");
      cy.get(".MuiDataGrid-row")
        .first()
        .find(`[data-cy="document-description"]`)
        .find("textarea:visible")
        .type("some description");

      // add data to the second document
      cy.get(".MuiDataGrid-row")
        .eq(1)
        .find(`[data-cy="document-url"]`)
        .find("input:visible")
        .type("https://localhost/document2.pdf");

      saveForm();
      cy.wait(["@document_PUT", "@getAllDocuments"]);
      waitForTableData();
      stopBoreholeEditing();

      verifyRowContains("https://localhost/document1.pdf", 0);
      verifyRowContains("some description", 0);
      verifyRowContains("https://localhost/document2.pdf", 1);

      cy.contains("a", "https://localhost/document1.pdf").should(
        "have.attr",
        "href",
        "https://localhost/document1.pdf",
      );

      // delete the first document
      startBoreholeEditing();
      checkRowWithIndex(0);
      deleteItem("attachment-table-container");
      cy.wait(["@document_DELETE", "@getAllDocuments"]);
      verifyTableLength(1);

      // reset test data
      deleteBorehole(boreholeId);
    });
  });
});
