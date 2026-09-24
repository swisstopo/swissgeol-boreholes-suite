import { verifyTableLength } from "../helpers/dataGridHelpers";
import { setInput } from "../helpers/formHelpers";
import {
  createBorehole,
  goToDetailRouteAndAcceptTerms,
  handlePrompt,
  startBoreholeEditing,
} from "../helpers/testHelpers";

const importDialogSelector = ".MuiDialog-container";
const runsStepCsvInputSelector = '[data-cy="import-step-runs"] input[data-cy="file-dropzone"]';
const filesStepCsvInputSelector = '[data-cy="import-step-files"] input[data-cy="file-dropzone"]';

// A refused chunk is retried before the upload gives up, so what follows a failed upload arrives
// a good deal later than the refusal the test saw.
const uploadRetryTimeout = 30000;

function openImportDialog() {
  // The dialog carries an import button of its own, so it has to be gone before the panel's
  // button can be addressed by that name.
  cy.get(importDialogSelector).should("not.exist");
  cy.dataCy("import-button").should("be.visible").click();
  cy.get(importDialogSelector).contains("h4", "Import LOG runs from CSV file");
}

function removeSelectedFileIfPresent(containerSelector: string) {
  cy.get(containerSelector).then($el => {
    if ($el.find('[data-cy="iconButton"]').length > 0) {
      cy.get(`${containerSelector} [data-cy="iconButton"]`).first().click();
    }
  });
}

function selectLogRunsCsv(fileName: string) {
  removeSelectedFileIfPresent('[data-cy="import-step-runs"]');
  cy.get(runsStepCsvInputSelector).selectFile(
    { contents: `cypress/fixtures/import/${fileName}`, fileName },
    { force: true },
  );
  cy.dataCy("import-step-runs").should("contain", fileName);
}

function clickNextButton() {
  cy.get(importDialogSelector).dataCy("next-button").click();
}

function selectLogFilesCsv(fileName: string) {
  // The CSV dropzone is always the first one in the files step: the per-run attachment
  // dropzones that follow it only exist once a log files CSV has already been selected.
  cy.get(filesStepCsvInputSelector)
    .first()
    .selectFile({ contents: `cypress/fixtures/import/${fileName}`, fileName }, { force: true });
  cy.dataCy("import-step-files").should("contain", fileName);
}

function selectAttachmentsForRun(runNumber: string, fileNames: string[]) {
  const files = fileNames.map(name => ({
    contents: Cypress.Buffer.from(`dummy content for ${name}`),
    fileName: name,
  }));
  cy.get(`[data-cy="log-attachments-${runNumber}"] input[data-cy="file-dropzone"]`).selectFile(files, { force: true });

  // The dropzone also lists the file names it expects, so containment on the whole block would
  // hold even when nothing was selected. Only the chips of the selected files prove the drop.
  for (const name of fileNames) {
    cy.get(`[data-cy="log-attachments-${runNumber}"] div[data-cy="file-dropzone"]`).should("contain", name);
  }
}

function clickImportButton() {
  cy.get(importDialogSelector).dataCy("import-button").should("not.be.disabled").click();
}

function expectImportButtonDisabled() {
  cy.get(importDialogSelector).dataCy("import-button").should("be.disabled");
}

function clickCancelButton() {
  cy.get(importDialogSelector).dataCy("cancel-button").click();
}

function clickCloseButton() {
  cy.get(importDialogSelector).dataCy("close-button").click();
}

function clickBackButton() {
  cy.get(importDialogSelector).dataCy("back-button").should("not.be.disabled").click();
}

function expectReportContains(text: string) {
  cy.get(importDialogSelector).dataCy("import-step-report").should("contain", text);
}

/** Walks the wizard from the runs step through the files step and submits the import. */
function performImport(opts: {
  logRunsCsv?: string;
  logFilesCsv?: string;
  attachmentsPerRun?: Record<string, string[]>;
}) {
  openImportDialog();
  if (opts.logRunsCsv) selectLogRunsCsv(opts.logRunsCsv);
  clickNextButton();
  if (opts.logFilesCsv) selectLogFilesCsv(opts.logFilesCsv);
  if (opts.attachmentsPerRun) {
    for (const [runNumber, files] of Object.entries(opts.attachmentsPerRun)) {
      selectAttachmentsForRun(runNumber, files);
    }
  }
  clickImportButton();
}

function setupBoreholeAndOpenLogTab(originalName: string, alias = "borehole_id") {
  createBorehole({ originalName }).as(alias);
  cy.get(`@${alias}`).then(id => {
    goToDetailRouteAndAcceptTerms(`/${id}/log`);
  });
  startBoreholeEditing();
}

function openSeedBoreholeLogTabInEditMode() {
  goToDetailRouteAndAcceptTerms(`/1000070/log`);
  startBoreholeEditing();
}

describe("Test for the borehole log import.", () => {
  it("does not show import button outside of edit mode", () => {
    goToDetailRouteAndAcceptTerms(`/1000070/log`);
    cy.dataCy("import-button").should("not.exist");
    startBoreholeEditing();
    cy.dataCy("import-button").should("be.visible");
  });

  it("keeps next enabled on the runs step and disables import until a CSV is present", () => {
    openSeedBoreholeLogTabInEditMode();
    openImportDialog();
    cy.get(importDialogSelector).dataCy("next-button").should("not.be.disabled");
    clickNextButton();
    expectImportButtonDisabled();
    selectLogFilesCsv("log-files-valid.csv");
    cy.get(importDialogSelector).dataCy("import-button").should("not.be.disabled");
    clickCancelButton();
    cy.get(importDialogSelector).should("not.exist");
  });

  it("shows per-run attachment dropzones only after a log files CSV is selected", () => {
    openSeedBoreholeLogTabInEditMode();
    openImportDialog();
    selectLogRunsCsv("log-runs-valid.csv");
    clickNextButton();
    // No per-run dropzones before a log files CSV is selected
    cy.get('[data-cy^="log-attachments-"]').should("not.exist");
    selectLogFilesCsv("log-files-valid.csv");
    // Per-run dropzones appear after selecting the log files CSV
    cy.get('[data-cy="log-attachments-IMP-RUN-1"]').should("be.visible");
    cy.get('[data-cy="log-attachments-IMP-RUN-2"]').should("be.visible");
    clickCancelButton();
  });

  it("imports log runs from a CSV file", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT RUNS ONLY");
    cy.contains("p", "No run added yet...");
    performImport({ logRunsCsv: "log-runs-valid.csv" });
    cy.wait("@log_import").its("response.statusCode").should("eq", 200);
    expectReportContains("IMP-RUN-1");
    expectReportContains("IMP-RUN-2");
    clickCloseButton();
    cy.get(importDialogSelector).should("not.exist");
    verifyTableLength(2);
    cy.contains("IMP-RUN-1");
    cy.contains("IMP-RUN-2");
  });

  it("imports log runs with their files", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT RUNS AND FILES");
    performImport({
      logRunsCsv: "log-runs-valid.csv",
      logFilesCsv: "log-files-valid.csv",
      attachmentsPerRun: { "IMP-RUN-1": ["welllog1.las"], "IMP-RUN-2": ["welllog2.txt"] },
    });
    cy.wait("@log_import").its("response.statusCode").should("eq", 200);
    cy.get('[data-cy="import-step-report"]').should("be.visible");
    cy.get('[data-cy="import-step-report"]').should("contain", "IMP-RUN-1");
    // Each row says what it is, because "IMP-RUN-1" and "IMP-RUN-1 / welllog1.las" do not.
    expectReportContains("LOG run");
    expectReportContains("LOG file");
    cy.wait("@log_upload", { timeout: uploadRetryTimeout }).its("response.statusCode").should("eq", 204);
    cy.wait("@log_upload", { timeout: uploadRetryTimeout }).its("response.statusCode").should("eq", 204);
    clickCloseButton();
    cy.get(importDialogSelector).should("not.exist");
    verifyTableLength(2);
    cy.contains("IMP-RUN-1");
    cy.contains("IMP-RUN-2");
  });

  it("reports a repeated import as already existing", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT ADDITIVE RERUN");
    performImport({ logRunsCsv: "log-runs-valid.csv" });
    cy.wait("@log_import").its("response.statusCode").should("eq", 200);
    clickCloseButton();
    cy.get(importDialogSelector).should("not.exist");
    verifyTableLength(2);

    // Importing the very same runs CSV again must report both runs as already existing
    // instead of failing or duplicating them.
    performImport({ logRunsCsv: "log-runs-valid.csv" });
    cy.wait("@log_import").its("response.statusCode").should("eq", 200);
    expectReportContains("Already exists");
    expectReportContains("A LOG run with this run number already exists for this borehole.");
    clickCloseButton();
    cy.get(importDialogSelector).should("not.exist");
    verifyTableLength(2);
  });

  it("reports row-level errors for invalid log runs in the error group", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT RUN ERRORS");
    performImport({ logRunsCsv: "log-runs-row-errors.csv" });
    cy.wait("@log_import").its("response.statusCode").should("eq", 200);

    // Row 1 has no run number.
    expectReportContains("Value in column RunNumber is required.");

    // Row 2 has several invalid fields; only the first is reported.
    expectReportContains("ERR-2");
    expectReportContains("Value in column FromDepth is required and must be a number.");

    // Row 3 is missing both depths; only the first is reported.
    expectReportContains("ERR-3");

    clickCloseButton();
    cy.get(importDialogSelector).should("not.exist");

    // None of the rows were valid, so nothing was added.
    cy.contains("p", "No run added yet...");
  });

  it("displays an error for duplicate run numbers within the import CSV", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT DUPLICATE");
    performImport({ logRunsCsv: "log-runs-duplicate.csv" });
    cy.wait("@log_import").its("response.statusCode").should("eq", 200);
    expectReportContains("DUP-1");
    expectReportContains('Value "DUP-1" in column RunNumber is duplicated in the import file.');
    clickCloseButton();
    cy.get(importDialogSelector).should("not.exist");
    verifyTableLength(1);
    cy.contains("DUP-1");
  });

  it("skips log files whose run is not found and reports row errors for invalid log files", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT FILE ERRORS");
    performImport({
      logRunsCsv: "log-runs-valid.csv",
      logFilesCsv: "log-files-row-errors.csv",
      attachmentsPerRun: { "WRONG-RUN": ["welllog1.las"], "IMP-RUN-1": ["notinlist.txt"] },
    });
    cy.wait("@log_import").its("response.statusCode").should("eq", 200);

    // WRONG-RUN is not part of this import and does not exist on the borehole, so its file is
    // skipped rather than failed: importing the missing run first and running the import again
    // would pick it up.
    expectReportContains('The LOG run "WRONG-RUN" does not exist yet. Import it first, then import this file again.');

    // IMP-RUN-1's row carries an invalid PassType.
    expectReportContains('Unknown value "NotAPassType" in column PassType.');

    clickCloseButton();
    cy.get(importDialogSelector).should("not.exist");
  });

  it("displays an error for attachments that are not referenced in the log files CSV", () => {
    openSeedBoreholeLogTabInEditMode();
    openImportDialog();
    selectLogRunsCsv("log-runs-valid.csv");
    clickNextButton();
    selectLogFilesCsv("log-files-two-in-one-run.csv");

    // Drop one valid and one unexpected file together
    const files = [
      { contents: Cypress.Buffer.from("dummy"), fileName: "welllog1.las" },
      { contents: Cypress.Buffer.from("dummy"), fileName: "orphan.bin" },
    ];
    cy.get('[data-cy="log-attachments-IMP-RUN-1"] input[data-cy="file-dropzone"]').selectFile(files, { force: true });

    // welllog1.las is accepted, orphan.bin is rejected with a client-side error
    cy.get('[data-cy="log-attachments-IMP-RUN-1"]').dataCy("file-dropzone").should("contain", "welllog1.las");
    cy.get('[data-cy="log-attachments-IMP-RUN-1"]').should("contain", "orphan.bin");
    cy.get('[data-cy="log-attachments-IMP-RUN-1"]').should("contain", "is not listed in the CSV");
    clickCancelButton();
  });

  it("prompts to discard unsaved changes before opening the import dialog", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT UNSAVED CHANGES");
    cy.dataCy("addlogrun-button").click();
    cy.contains("h4", "New run");
    setInput("fromDepth", 0);
    setInput("toDepth", 10);
    setInput("runNumber", "UNSAVED-1");
    cy.get(".MuiDialog-container").dataCy("apply-button").click();
    verifyTableLength(1);
    const unsavedChangesPrompt = "There are unsaved changes. Do you want to discard all changes?";
    cy.dataCy("import-button").click();
    handlePrompt(unsavedChangesPrompt, "cancel");
    cy.get(importDialogSelector).should("not.exist");
    verifyTableLength(1);
    cy.dataCy("import-button").click();
    handlePrompt(unsavedChangesPrompt, "discardChanges");
    cy.get(importDialogSelector).should("be.visible");
    verifyTableLength(0);

    clickCancelButton();
  });

  it("keeps the selected files when stepping back and forth between runs and files", () => {
    openSeedBoreholeLogTabInEditMode();
    openImportDialog();
    selectLogRunsCsv("log-runs-valid.csv");
    clickNextButton();
    selectLogFilesCsv("log-files-two-in-one-run.csv");
    selectAttachmentsForRun("IMP-RUN-1", ["welllog1.las"]);

    clickBackButton();
    cy.dataCy("import-step-runs").should("contain", "log-runs-valid.csv");

    clickNextButton();
    cy.dataCy("import-step-files").should("contain", "log-files-two-in-one-run.csv");
    cy.dataCy("log-attachments-IMP-RUN-1").should("contain", "welllog1.las");

    clickCancelButton();
  });

  it("returns from the report to the files step with the selection intact", () => {
    openSeedBoreholeLogTabInEditMode();
    performImport({ logRunsCsv: "log-runs-valid.csv" });
    expectReportContains("IMP-RUN-1");

    clickBackButton();

    cy.dataCy("import-step-files").should("be.visible");
    cy.dataCy("import-step-report").should("not.exist");

    // The runs are written already, so importing the same CSV again reports them as existing
    // rather than adding them twice.
    clickImportButton();
    expectReportContains("already exists");
    clickCloseButton();
  });

  it("clears the selected files when the import dialog is closed and reopened", () => {
    openSeedBoreholeLogTabInEditMode();
    openImportDialog();
    selectLogRunsCsv("log-runs-valid.csv");
    cy.dataCy("import-step-runs").should("contain", "log-runs-valid.csv");
    clickCancelButton();
    cy.get(importDialogSelector).should("not.exist");
    openImportDialog();
    cy.dataCy("import-step-runs").should("not.contain", "log-runs-valid.csv");
    clickNextButton();
    expectImportButtonDisabled();
    clickCancelButton();
  });

  it("marks an attachment as failed when its upload fails, but keeps the imported run", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT UPLOAD FAILURE");
    cy.intercept("POST", "/api/v2/log/upload/tus", { statusCode: 500, body: "boom" }).as("log_upload_fail");
    cy.intercept("DELETE", "/api/v2/log/file/*").as("log_file_delete");
    performImport({
      logRunsCsv: "log-runs-valid.csv",
      logFilesCsv: "log-files-valid.csv",
      attachmentsPerRun: { "IMP-RUN-1": ["welllog1.las"], "IMP-RUN-2": ["welllog2.txt"] },
    });
    cy.wait("@log_import").its("response.statusCode").should("eq", 200);
    cy.wait("@log_upload_fail", { timeout: uploadRetryTimeout }).its("response.statusCode").should("eq", 500);
    cy.wait("@log_file_delete", { timeout: uploadRetryTimeout }).its("response.statusCode").should("eq", 200);

    // The failed attachment's status is shown inline in the report, next to its row.
    cy.get(importDialogSelector).should("contain", "Upload failed");

    clickCloseButton();
    cy.get(importDialogSelector).should("not.exist");

    // The imported runs themselves are kept; only the attachment that failed to upload is not.
    verifyTableLength(2);
    cy.contains("IMP-RUN-1");
    cy.contains("IMP-RUN-2");
  });

  it("shows the global error toast when a mutation fails with a non-userError", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT GENERIC ERROR");
    cy.intercept("POST", "/api/v2/log/import**", { statusCode: 500, body: "" }).as("log_import_fail");
    openImportDialog();
    selectLogRunsCsv("log-runs-valid.csv");
    clickNextButton();
    clickImportButton();
    cy.wait("@log_import_fail").its("response.statusCode").should("eq", 500);

    // The MutationCache.onError handler in App.tsx shows the generic toast for non-ApiError errors.
    cy.get(".MuiAlert-message").should("contain", "Unexpected error. The action you triggered was not successful.");

    // The wizard stays on the files step, since the import never reached the report.
    cy.get(importDialogSelector).should("be.visible");
    cy.get('[data-cy="import-step-report"]').should("not.exist");
    clickCancelButton();
  });
});
