import { verifyTableLength } from "../helpers/dataGridHelpers";
import { setInput } from "../helpers/formHelpers";
import {
  createBorehole,
  goToDetailRouteAndAcceptTerms,
  handlePrompt,
  startBoreholeEditing,
} from "../helpers/testHelpers";

const importDialogSelector = ".MuiDialog-container";
const logRunsCsvInputSelector = '[data-cy="import-logRuns"] input[data-cy="file-dropzone"]';
const logFilesCsvInputSelector = '[data-cy="import-logFiles"] input[data-cy="file-dropzone"]:not([multiple])';

function openImportDialog() {
  cy.dataCy("import-button").should("be.visible").click();
  cy.contains("h4", "Import LOG runs from CSV file");
}

function removeSelectedFileIfPresent(parent: string) {
  cy.get(`[data-cy="${parent}"]`).then($el => {
    if ($el.find('[data-cy="iconButton"]').length > 0) {
      cy.get(`[data-cy="${parent}"] [data-cy="iconButton"]`).first().click();
    }
  });
}

function selectLogRunsCsv(fileName: string) {
  removeSelectedFileIfPresent("import-logRuns");
  cy.get(logRunsCsvInputSelector).selectFile(
    { contents: `cypress/fixtures/import/${fileName}`, fileName },
    { force: true },
  );
  cy.dataCy("import-logRuns").should("contain", fileName);
}

function selectLogFilesCsv(fileName: string) {
  cy.get(logFilesCsvInputSelector).selectFile(
    { contents: `cypress/fixtures/import/${fileName}`, fileName },
    { force: true },
  );
  cy.dataCy("import-logFiles").should("contain", fileName);
}

function selectAttachmentsForRun(runNumber: string, fileNames: string[]) {
  const files = fileNames.map(name => ({
    contents: Cypress.Buffer.from(`dummy content for ${name}`),
    fileName: name,
  }));
  cy.get(`[data-cy="log-attachments-${runNumber}"] input[data-cy="file-dropzone"]`).selectFile(files, { force: true });
  for (const name of fileNames) {
    cy.get(`[data-cy="log-attachments-${runNumber}"]`).should("contain", name);
  }
}

function clickModalImportButton() {
  cy.get(importDialogSelector).dataCy("import-button").should("not.be.disabled").click();
}

function performImport(opts: {
  logRunsCsv: string;
  logFilesCsv?: string;
  attachmentsPerRun?: Record<string, string[]>;
}) {
  openImportDialog();
  selectLogRunsCsv(opts.logRunsCsv);
  if (opts.logFilesCsv) selectLogFilesCsv(opts.logFilesCsv);
  if (opts.attachmentsPerRun) {
    for (const [runNumber, files] of Object.entries(opts.attachmentsPerRun)) {
      selectAttachmentsForRun(runNumber, files);
    }
  }
  clickModalImportButton();
}

function expectModalImportButtonDisabled() {
  cy.get(importDialogSelector).dataCy("import-button").should("be.disabled");
}

function clickModalCancelButton() {
  cy.get(importDialogSelector).dataCy("cancel-button").click();
}

function expectImportError(errorText: string) {
  cy.get(importDialogSelector).contains(errorText).scrollIntoView();
  cy.get(importDialogSelector).contains(errorText).should("be.visible");
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

  it("disables the import button in dialog until a log runs CSV is selected", () => {
    openSeedBoreholeLogTabInEditMode();
    openImportDialog();
    expectModalImportButtonDisabled();
    selectLogRunsCsv("log-runs-valid.csv");
    cy.get(importDialogSelector).dataCy("import-button").should("not.be.disabled");
    clickModalCancelButton();
    cy.get(importDialogSelector).should("not.exist");
  });

  it("disables the import button in dialog when a log files CSV is provided without attachments", () => {
    openSeedBoreholeLogTabInEditMode();
    openImportDialog();
    selectLogRunsCsv("log-runs-valid.csv");
    cy.get(importDialogSelector).dataCy("import-button").should("not.be.disabled");
    selectLogFilesCsv("log-files-valid.csv");
    // Per-run dropzones appear, but no attachments selected yet → import disabled
    cy.get('[data-cy="log-attachments-IMP-RUN-1"]').should("be.visible");
    cy.get('[data-cy="log-attachments-IMP-RUN-2"]').should("be.visible");
    expectModalImportButtonDisabled();
    selectAttachmentsForRun("IMP-RUN-1", ["welllog1.las"]);
    selectAttachmentsForRun("IMP-RUN-2", ["welllog2.txt"]);
    cy.get(importDialogSelector).dataCy("import-button").should("not.be.disabled");
    clickModalCancelButton();
  });

  it("shows per-run attachment dropzones only when a log files CSV is selected", () => {
    openSeedBoreholeLogTabInEditMode();
    openImportDialog();
    selectLogRunsCsv("log-runs-valid.csv");
    // No per-run dropzones before a log files CSV is selected
    cy.get('[data-cy^="log-attachments-"]').should("not.exist");
    selectLogFilesCsv("log-files-valid.csv");
    // Per-run dropzones appear after selecting the log files CSV
    cy.get('[data-cy="log-attachments-IMP-RUN-1"]').should("be.visible");
    cy.get('[data-cy="log-attachments-IMP-RUN-2"]').should("be.visible");
    clickModalCancelButton();
  });

  it("imports log runs from a CSV file", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT RUNS ONLY");
    cy.contains("p", "No run added yet...");
    performImport({ logRunsCsv: "log-runs-valid.csv" });
    cy.wait("@log_import").its("response.statusCode").should("eq", 200);
    cy.get(importDialogSelector).should("not.exist");
    verifyTableLength(2);
    cy.contains("IMP-RUN-1");
    cy.contains("IMP-RUN-2");
  });

  it("imports log runs together with log files and attachments", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT RUNS AND FILES");
    performImport({
      logRunsCsv: "log-runs-valid.csv",
      logFilesCsv: "log-files-valid.csv",
      attachmentsPerRun: { "IMP-RUN-1": ["welllog1.las"], "IMP-RUN-2": ["welllog2.txt"] },
    });
    cy.wait("@log_import").its("response.statusCode").should("eq", 200);
    cy.wait("@log_upload").its("response.statusCode").should("eq", 200);
    cy.wait("@log_upload").its("response.statusCode").should("eq", 200);
    cy.get(importDialogSelector).should("not.exist");
    verifyTableLength(2);
    cy.contains("IMP-RUN-1");
    cy.contains("IMP-RUN-2");
  });

  it("displays row-level errors for invalid log runs", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT RUN ERRORS");
    performImport({ logRunsCsv: "log-runs-row-errors.csv" });
    cy.wait("@log_import").its("response.statusCode").should("eq", 400);

    // Row 1 has no run number → fallback header "Run 1".
    expectImportError("Run 1");
    expectImportError("Value in column RunNumber is required.");

    // Row 2 uses the run number as header.
    expectImportError("ERR-2");
    expectImportError("Value in column FromDepth is required and must be a number.");
    expectImportError('Unknown value "NotAStatus" in column BoreholeStatus.');
    expectImportError('Unknown value "NotAMethod" in column ConveyanceMethod.');
    expectImportError('Invalid date format "not-a-date". Expected: dd.MM.yyyy.');
    expectImportError("ERR-3");
    expectImportError("Value in column ToDepth is required and must be a number.");

    // Import button stays disabled until file selection changes
    expectModalImportButtonDisabled();

    // Replacing the file clears errors and re-enables the button
    selectLogRunsCsv("log-runs-valid.csv");
    cy.get(importDialogSelector).contains("ERR-2").should("not.exist");
    cy.get(importDialogSelector).dataCy("import-button").should("not.be.disabled");
    clickModalCancelButton();
  });

  it("displays an error for duplicate run numbers within the import CSV", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT DUPLICATE");
    performImport({ logRunsCsv: "log-runs-duplicate.csv" });
    cy.wait("@log_import").its("response.statusCode").should("eq", 400);
    expectImportError("DUP-1");
    expectImportError('Value "DUP-1" in column RunNumber is duplicated in the import file.');
    clickModalCancelButton();
  });

  it("displays an error for run numbers that already exist on the borehole", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT EXISTING RUN");

    // Seed borehole with an existing run that conflicts with the import CSV.
    performImport({ logRunsCsv: "log-runs-existing.csv" });
    cy.wait("@log_import").its("response.statusCode").should("eq", 200);
    cy.get(importDialogSelector).should("not.exist");
    cy.contains("EXIST-RUN");

    // Re-importing the same run number must fail with the database conflict error.
    performImport({ logRunsCsv: "log-runs-existing.csv" });
    cy.wait("@log_import").its("response.statusCode").should("eq", 400);
    expectImportError("EXIST-RUN");
    expectImportError('Value "EXIST-RUN" in column RunNumber already exists for this borehole.');
    clickModalCancelButton();
  });

  it("displays row-level errors for invalid log files", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT FILE ERRORS");
    performImport({
      logRunsCsv: "log-runs-valid.csv",
      logFilesCsv: "log-files-row-errors.csv",
      attachmentsPerRun: { "WRONG-RUN": ["welllog1.las"], "IMP-RUN-1": ["notinlist.txt"] },
    });
    cy.wait("@log_import").its("response.statusCode").should("eq", 400);
    expectImportError("welllog1.las");
    expectImportError('Value "WRONG-RUN" in column RunNumber does not match any imported LOG run.');
    expectImportError('Unknown code "NOPE" in column ToolType.');
    expectImportError('Unknown value "NotAPassType" in column PassType.');
    expectImportError('Invalid date format "not-a-date". Expected: dd.MM.yyyy.');
    expectImportError('Unknown value "Maybe" in column Public. Expected: Yes/No.');
    expectModalImportButtonDisabled();
    clickModalCancelButton();
  });

  it("displays an error for attachments that are not referenced in the log files CSV", () => {
    openSeedBoreholeLogTabInEditMode();
    openImportDialog();
    selectLogRunsCsv("log-runs-valid.csv");
    selectLogFilesCsv("log-files-valid.csv");
    // Try to add an unexpected file to the first run's dropzone
    selectAttachmentsForRun("IMP-RUN-1", ["welllog1.las", "orphan.bin"]);
    // The dropzone should reject orphan.bin with a client-side error
    cy.get('[data-cy="log-attachments-IMP-RUN-1"]').should("contain", "orphan.bin");
    cy.get('[data-cy="log-attachments-IMP-RUN-1"]').should("contain", "is not listed in the CSV");
    // welllog1.las should still be accepted
    cy.get('[data-cy="log-attachments-IMP-RUN-1"]').dataCy("file-dropzone").should("contain", "welllog1.las");
    clickModalCancelButton();
  });

  it("prompts to discard unsaved changes before opening the import dialog", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT UNSAVED CHANGES");
    cy.dataCy("addlogrun-button").click();
    cy.contains("h4", "New run");
    setInput("fromDepth", 0);
    setInput("toDepth", 10);
    setInput("runNumber", "UNSAVED-1");
    cy.get(".MuiDialog-container").dataCy("close-button").click();
    verifyTableLength(1);
    const unsavedChangesPrompt = "There are unsaved changes. Do you want to discard all changes?";
    cy.dataCy("import-button").click();
    handlePrompt(unsavedChangesPrompt, "cancel");
    cy.get(importDialogSelector).should("not.exist");
    verifyTableLength(1);
    cy.dataCy("import-button").click();
    handlePrompt(unsavedChangesPrompt, "discardchanges");
    cy.get(importDialogSelector).should("be.visible");
    verifyTableLength(0);

    clickModalCancelButton();
  });

  it("clears the selected files when the import dialog is closed and reopened", () => {
    openSeedBoreholeLogTabInEditMode();
    openImportDialog();
    selectLogRunsCsv("log-runs-valid.csv");
    cy.dataCy("import-logRuns").should("contain", "log-runs-valid.csv");
    clickModalCancelButton();
    cy.get(importDialogSelector).should("not.exist");
    openImportDialog();
    cy.dataCy("import-logRuns").should("not.contain", "log-runs-valid.csv");
    expectModalImportButtonDisabled();
    clickModalCancelButton();
  });

  it("rolls back imported log runs when an attachment upload fails", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT UPLOAD FAILURE ROLLBACK");
    cy.intercept("POST", "/api/v2/log/upload**", { statusCode: 500, body: "boom" }).as("log_upload_fail");
    cy.intercept("DELETE", "/api/v2/log?logRunIds**").as("log_delete");
    performImport({
      logRunsCsv: "log-runs-valid.csv",
      logFilesCsv: "log-files-valid.csv",
      attachmentsPerRun: { "IMP-RUN-1": ["welllog1.las"], "IMP-RUN-2": ["welllog2.txt"] },
    });
    cy.wait("@log_import").its("response.statusCode").should("eq", 200);
    cy.wait("@log_upload_fail").its("response.statusCode").should("eq", 500);
    cy.wait("@log_delete").its("response.statusCode").should("eq", 200);

    // Generic global error toast (handled by App.tsx MutationCache.onError).
    cy.get(".MuiAlert-message").should("contain", "Unexpected error. The action you triggered was not successful.");

    // Modal stays open because the mutation rejected.
    cy.get(importDialogSelector).should("be.visible");
    clickModalCancelButton();
    cy.get(importDialogSelector).should("not.exist");

    // Imported runs were rolled back: table is empty.
    cy.contains("p", "No run added yet...");
  });

  it("shows the global error toast when a mutation fails with a non-userError", () => {
    setupBoreholeAndOpenLogTab("LOG IMPORT GENERIC ERROR");
    cy.intercept("POST", "/api/v2/log/import**", { statusCode: 500, body: "" }).as("log_import_fail");
    performImport({ logRunsCsv: "log-runs-valid.csv" });
    cy.wait("@log_import_fail").its("response.statusCode").should("eq", 500);

    // The MutationCache.onError handler in App.tsx shows the generic toast for non-ApiError errors.
    cy.get(".MuiAlert-message").should("contain", "Unexpected error. The action you triggered was not successful.");

    // No inline form errors and the modal stays open.
    cy.get(importDialogSelector).should("be.visible");
    cy.get(importDialogSelector).contains("in column RunNumber is required.").should("not.exist");
    clickModalCancelButton();
  });
});
