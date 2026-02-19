import { deleteItem, exportItem, saveWithSaveBar, verifyNoUnsavedChanges } from "../helpers/buttonHelpers.js";
import {
  checkAllVisibleRows,
  checkRowWithIndex,
  checkRowWithText,
  setTextInRow,
  uncheckAllVisibleRows,
  unCheckRowWithText,
  verifyPaginationText,
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
  goToDetailRouteAndAcceptTerms,
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

function createBoreholeWithDocuments(numberOfDocuments, boreholeAlias) {
  createBorehole({
    originalName: "Borehole with many log runs",
    documents: Array.from({ length: numberOfDocuments }, (_, i) => ({
      name: `Test Document ${i + 1}`,
      url: `https://localhost/document${i + 1}.pdf`,
    })),
  }).as(boreholeAlias);
}

describe("Tests for 'Attachments' edit page.", () => {
  const photoFilename = "HARDOASIS_10.00-120.00_all.jpg";

  const uploadLoudSpatulaFile = () => {
    selectInputFile("LOUDSPATULA.txt", "text/plain");

    // upload file
    cy.dataCy("addProfile-button").should("be.visible").click();
    cy.wait(["@upload-files", "@getAllAttachments"]);
  };

  const uploadPhoto = () => {
    selectInputFile(photoFilename, "image/jpeg");

    cy.dataCy("addPhoto-button").should("be.visible").click();
    cy.wait(["@upload-photo", "@getAllPhotos"]);
  };

  it("creates, downloads and deletes profile.", () => {
    createBorehole({ originalName: "JUNIORSOUFFLE" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToDetailRouteAndAcceptTerms(`/${boreholeId}`);

      startBoreholeEditing();
      // navigate to attachments tab
      navigateInSidebar(SidebarMenuItem.attachments);
      uploadLoudSpatulaFile();

      // check list of attachments
      verifyTableLength(1);
      verifyRowContains("LOUDSPATULA.txt", 0);

      // create file "IRATETRINITY.pdf" for input
      selectInputFile("IRATETRINITY.pdf", "application/pdf");

      // upload and verify file IRATETRINITY.pdf
      cy.dataCy("addProfile-button").should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);

      verifyTableLength(2);
      verifyRowContains("IRATETRINITY.pdf", 1);

      // Upload and verify file "IRATETRINITY.pdf" for the second time but with different file name.
      selectInputFile("IRATETRINITY_2.pdf", "application/pdf");
      cy.dataCy("addProfile-button").should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);

      verifyTableLength(3);
      verifyRowContains("IRATETRINITY_2.pdf", 2);

      // Upload and verify file "WHITE   SPACE.pdf" to test file names with white spaces.
      selectInputFile("WHITE   SPACE.pdf", "application/pdf");
      cy.dataCy("addProfile-button").should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);
      verifyTableLength(4);
      verifyRowContains("WHITE___SPACE.pdf", 3);

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

      cy.dataCy("public-header").find('input[type="checkbox"]').should("not.be.checked");
      checkPublicStatus("IRATETRINITY_2.pdf", false, true);
      checkPublicStatus("WHITE___SPACE.pdf", false, true);
      checkRowWithText("IRATETRINITY_2.pdf", "public");
      cy.dataCy("public-header").find(".MuiCheckbox-indeterminate").should("exist");
      cy.dataCy("public-header").find('input[type="checkbox"]').click();
      cy.dataCy("public-header").find('input[type="checkbox"]').should("be.checked");
      checkPublicStatus("LOUDSPATULA.txt", true, true);
      checkPublicStatus("IRATETRINITY.pdf", true, true);
      checkPublicStatus("IRATETRINITY_2.pdf", true, true);
      checkPublicStatus("WHITE___SPACE.pdf", true, true);
      unCheckRowWithText("IRATETRINITY.pdf", "public");
      cy.dataCy("public-header").find(".MuiCheckbox-indeterminate").should("exist");
      checkRowWithText("IRATETRINITY.pdf", "public");
      cy.dataCy("public-header").find('input[type="checkbox"]').should("be.checked");
      cy.dataCy("public-header").find('input[type="checkbox"]').click();
      cy.dataCy("public-header").find('input[type="checkbox"]').should("not.be.checked");
      checkPublicStatus("LOUDSPATULA.txt", false, true);
      checkPublicStatus("IRATETRINITY.pdf", false, true);
      checkPublicStatus("IRATETRINITY_2.pdf", false, true);
      checkPublicStatus("WHITE___SPACE.pdf", false, true);
      checkRowWithText("IRATETRINITY_2.pdf", "public");

      setTextInRow("IRATETRINITY_2.pdf", "profile-description", "a brand new description");
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
      stopBoreholeEditing();
    });
  });

  it("creates, exports and deletes photos.", () => {
    createBorehole({ originalName: "JUNIORSOUFFLE" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToDetailRouteAndAcceptTerms(`/${boreholeId}`);

      startBoreholeEditing();
      // navigate to photos tab
      navigateInSidebar(SidebarMenuItem.attachments);
      cy.dataCy("photos-tab").click();

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
      cy.dataCy("public-header").find('input[type="checkbox"]').should("not.be.checked");
      cy.dataCy("public-header").find('input[type="checkbox"]').click();
      cy.dataCy("public-header").find('input[type="checkbox"]').should("be.checked");
      checkPublicStatus(photoFilename, true, true);
      unCheckRowWithText(photoFilename, "public");
      cy.dataCy("public-header").find('input[type="checkbox"]').should("not.be.checked");
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
      stopBoreholeEditing();
    });
  });

  it("can save changes on a borehole with attachments.", () => {
    createBorehole({ originalName: "AAA_COBRA" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToDetailRouteAndAcceptTerms(`/${boreholeId}`);
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
    createBorehole({ originalName: "HAPPYBOOK" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToDetailRouteAndAcceptTerms(`/${boreholeId}`);
      startBoreholeEditing();

      navigateInSidebar(SidebarMenuItem.attachments);
      cy.dataCy("documents-tab").click();
      cy.wait("@getAllDocuments");

      // create 2 documents
      cy.dataCy("addDocument-button").should("be.visible").click();
      cy.wait(["@document_POST", "@getAllDocuments"]);
      verifyTableLength(1);
      cy.dataCy("addDocument-button").should("be.visible").click();
      cy.wait(["@document_POST", "@getAllDocuments"]);
      verifyTableLength(2);

      // add data
      setTextInRow(0, "document-url", "https://localhost/document1.pdf");
      setTextInRow(0, "document-description", "some description");
      setTextInRow(1, "document-url", "https://localhost/document2.pdf");
      saveWithSaveBar();
      cy.wait(["@document_PUT", "@getAllDocuments"]);
      waitForTableData();
      checkRowWithText("https://localhost/document2.pdf", "public");

      // add another document
      cy.dataCy("addDocument-button").should("be.visible").click();
      cy.wait(["@document_POST", "@getAllDocuments"]);
      verifyTableLength(3);

      // verify all table data public state is still up to date
      checkPublicStatus("https://localhost/document1.pdf", false, true);
      checkPublicStatus("https://localhost/document2.pdf", true, true);

      saveWithSaveBar();
      cy.wait(["@document_PUT", "@getAllDocuments"]);
      waitForTableData();

      stopBoreholeEditing();

      verifyRowContains("https://localhost/document1.pdf", 0);
      verifyRowContains("some description", 0);
      verifyRowContains("https://localhost/document2.pdf", 1);
      checkPublicStatus("https://localhost/document1.pdf", false, false);
      checkPublicStatus("https://localhost/document2.pdf", true, false);

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
      verifyTableLength(2);

      // reset test data
      deleteBorehole(boreholeId);
    });
  });

  it("Displays table pagination for more than 50 documents", () => {
    createBoreholeWithDocuments(53, "borehole_id_53");
    cy.get("@borehole_id_53").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}/attachments#documents`);
      cy.wait(["@borehole"]);
    });

    verifyPaginationText("1–50 of 53");
    startBoreholeEditing();
    checkAllVisibleRows();
    unCheckRowWithText("Test Document 2");
    cy.dataCy("delete-button").click();
    cy.get(".MuiTablePagination-displayedRows").should("not.exist");
  });

  it("saves with ctrl s", () => {
    createBorehole({ originalName: "HAPPYBOOK" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToDetailRouteAndAcceptTerms(`/${boreholeId}`);
      startBoreholeEditing();

      navigateInSidebar(SidebarMenuItem.attachments);
      cy.dataCy("documents-tab").click();
      cy.wait("@getAllDocuments");

      cy.dataCy("addDocument-button").should("be.visible").click();
      cy.wait(["@document_POST", "@getAllDocuments"]);
      verifyTableLength(1);
      setTextInRow(0, "document-url", "https://localhost/document1.pdf");
      setTextInRow(0, "document-description", "some description");
      cy.get("body").type("{ctrl}s");
      verifyNoUnsavedChanges();
      verifyRowContains("https://localhost/document1.pdf", 0);
      verifyRowContains("some description", 0);

      stopBoreholeEditing();
      verifyRowContains("https://localhost/document1.pdf", 0);
      verifyRowContains("some description", 0);
    });
  });
});
