import { goToRouteAndAcceptTerms, loginAsAdmin, loginAsEditor, selectLanguage } from "../helpers/testHelpers.js";

const TASK_TYPES = ["LocationMigration", "CoordinateMigration", "UserMerge"];

const makeTaskState = (type, overrides = {}) => ({
  type,
  status: "Idle",
  affectedCount: null,
  message: null,
  startedAt: null,
  completedAt: null,
  ...overrides,
});

const makeStatusResponse = (overridesByType = {}) => TASK_TYPES.map(type => makeTaskState(type, overridesByType[type]));

const makeLogResponse = (logEntries = [], totalCount = null) => ({
  totalCount: totalCount ?? logEntries.length,
  pageNumber: 1,
  pageSize: 10,
  logEntries,
});

const makeLogEntry = (overrides = {}) => ({
  taskType: "LocationMigration",
  status: "Completed",
  affectedCount: 0,
  message: null,
  parameters: null,
  isDryRun: false,
  onlyMissing: true,
  startedByName: "Test User",
  startedAt: "2026-02-20T10:00:00Z",
  completedAt: "2026-02-20T10:00:30Z",
  ...overrides,
});

const interceptStatus = (body, alias) => {
  cy.intercept("GET", "/api/v2/maintenance/status", { body }).as(alias);
};

const interceptLogs = (body, alias) => {
  cy.intercept("GET", "/api/v2/maintenance/logs*", { body }).as(alias);
};

/**
 * Stubs status, POST, and logs endpoints to simulate a migration lifecycle:
 * Idle -> POST 202 -> Running (runningPolls status polls) -> Completed.
 * Logs are empty while running and return the given entry after completion.
 */
const interceptMigrationProgress = (taskType, logEntry, { runningPolls = 2 } = {}) => {
  let statusCallCount = 0;
  let isIdle = true;

  cy.intercept("POST", `/api/v2/maintenance/${taskType}`, req => {
    isIdle = false;
    req.reply({ statusCode: 202 });
  }).as(`start-${taskType}`);

  const buildStatus = status => {
    const overrides = {
      status,
      startedAt: "2026-02-20T10:00:00Z",
      ...(status === "Completed" ? { completedAt: "2026-02-20T10:00:30Z" } : {}),
    };
    return makeStatusResponse({ [taskType]: overrides });
  };

  cy.intercept("GET", "/api/v2/maintenance/status", req => {
    if (isIdle) {
      req.reply({ body: makeStatusResponse() });
    } else {
      statusCallCount++;
      req.reply({ body: buildStatus(statusCallCount <= runningPolls ? "Running" : "Completed") });
    }
  }).as("get-status");

  cy.intercept("GET", "/api/v2/maintenance/logs*", req => {
    if (isIdle || statusCallCount <= runningPolls) {
      req.reply({ body: makeLogResponse() });
    } else {
      req.reply({ body: makeLogResponse([logEntry]) });
    }
  }).as("get-logs");
};

describe("Maintenance Tasks page tests", () => {
  it("is not visible for non-admin users", () => {
    loginAsEditor("/setting");

    cy.dataCy("maintenance-tab").should("not.exist");
    cy.dataCy("users-tab").should("not.exist");
    cy.dataCy("workgroups-tab").should("not.exist");
    cy.dataCy("general-tab").should("exist");
  });

  describe("as admin", () => {
    beforeEach(() => {
      loginAsAdmin();
    });

    describe("with live API", () => {
      beforeEach(() => {
        goToRouteAndAcceptTerms("/setting#maintenance");
      });

      it("displays both migration cards with default state", () => {
        cy.dataCy("location-migration-card").should("be.visible");
        cy.dataCy("coordinate-migration-card").should("be.visible");

        ["location-migration", "coordinate-migration"].forEach(prefix => {
          cy.dataCy(`${prefix}-only-missing`).find("input").should("be.checked");
          cy.dataCy(`${prefix}-dry-run`).find("input").should("be.checked");
        });
      });

      it("displays execution log table", () => {
        cy.dataCy("execution-log-table").should("be.visible");
        cy.dataCy("execution-log-include-dry-run").find("input").should("be.checked");
      });

      it("starts location migration", () => {
        cy.wait("@get-maintenance-status");
        cy.dataCy("location-migration-start").click();
        cy.dataCy("location-migration-start").should("be.disabled");
        cy.wait("@start-location-migration");
        // Wait for migration to complete so it doesn't affect subsequent tests.
        cy.get("[data-cy=location-migration-start]", { timeout: 30000 }).should("not.be.disabled");
      });

      it("starts coordinate migration", () => {
        cy.wait("@get-maintenance-status");
        cy.dataCy("coordinate-migration-start").click();
        cy.dataCy("coordinate-migration-start").should("be.disabled");
        cy.wait("@start-coordinate-migration");
        // Wait for migration to complete so it doesn't affect subsequent tests.
        cy.get("[data-cy=coordinate-migration-start]", { timeout: 30000 }).should("not.be.disabled");
      });

      it("can toggle checkboxes", () => {
        ["location-migration-only-missing", "location-migration-dry-run"].forEach(cyName => {
          cy.dataCy(cyName).find("input").should("be.checked");
          cy.dataCy(cyName).find("input").uncheck();
          cy.dataCy(cyName).find("input").should("not.be.checked");
        });
      });

      it("renders the user merge card without onlyMissing checkbox", () => {
        cy.dataCy("user-merge-card").should("be.visible");
        cy.dataCy("user-merge-dry-run").find("input").should("be.checked");
        cy.dataCy("user-merge-only-missing").should("not.exist");
        cy.dataCy("user-merge-start").should("be.visible").and("not.be.disabled");
      });

      it("executes a user merge dry run and shows log entry", () => {
        cy.wait("@get-maintenance-status");
        cy.dataCy("user-merge-dry-run").find("input").should("be.checked");
        cy.dataCy("user-merge-start").click();
        cy.dataCy("user-merge-start").should("be.disabled");
        cy.wait("@start-user-merge");

        // Wait for task to complete.
        cy.get("[data-cy=user-merge-start]", { timeout: 30000 }).should("not.be.disabled");

        // Verify the log entry exists with correct task type.
        cy.dataCy("execution-log-table")
          .contains(/merge duplicate users/i)
          .should("be.visible");
      });
    });

    describe("with stubbed responses", () => {
      it("shows log entry after migration completes", () => {
        const logEntry = makeLogEntry({ affectedCount: 15, isDryRun: true });
        interceptMigrationProgress("LocationMigration", logEntry);

        goToRouteAndAcceptTerms("/setting#maintenance");

        cy.dataCy("execution-log-table").should("contain", "No rows");

        cy.dataCy("location-migration-start").click();
        cy.wait("@start-LocationMigration");

        // Wait for status to transition from Running to Completed.
        cy.wait("@get-status");
        cy.wait("@get-status");
        cy.wait("@get-logs");

        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").should("have.length", 1);
        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").first().should("contain", "15");
      });

      it("shows log entry when language changes before and during migration", () => {
        const logEntry = makeLogEntry({
          taskType: "CoordinateMigration",
          affectedCount: 5,
        });
        interceptMigrationProgress("CoordinateMigration", logEntry);

        goToRouteAndAcceptTerms("/setting#maintenance");

        // Switch language to Italian before starting.
        selectLanguage("it");

        cy.dataCy("coordinate-migration-start").click();
        cy.wait("@start-CoordinateMigration");

        // Switch language while task is running.
        selectLanguage("de");

        // Wait for status to transition from Running to Completed.
        cy.wait("@get-status");
        cy.wait("@get-status");
        cy.wait("@get-logs");

        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").should("have.length", 1);
        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").first().should("contain", "Abgeschlossen");
        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").first().should("contain", "Koordinaten migrieren");

        selectLanguage("en");
      });

      it("disables run button while a task is running", () => {
        interceptStatus(
          makeStatusResponse({ LocationMigration: { status: "Running", startedAt: new Date().toISOString() } }),
          "get-maintenance-status-running",
        );

        goToRouteAndAcceptTerms("/setting#maintenance");
        cy.wait("@get-maintenance-status-running");

        cy.dataCy("location-migration-start").should("be.disabled");
      });

      it("shows log entries in the execution log table", () => {
        interceptStatus(makeStatusResponse(), "get-maintenance-status-ok");
        interceptLogs(
          makeLogResponse([
            makeLogEntry({ affectedCount: 42 }),
            makeLogEntry({
              taskType: "CoordinateMigration",
              affectedCount: 10,
              isDryRun: true,
              startedAt: "2026-02-20T09:00:00Z",
              completedAt: "2026-02-20T09:02:30Z",
            }),
          ]),
          "get-maintenance-logs",
        );

        goToRouteAndAcceptTerms("/setting#maintenance");
        cy.wait("@get-maintenance-logs");

        cy.dataCy("execution-log-table").should("be.visible");
        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").should("have.length", 2);
        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").first().should("contain", "42");
      });

      it("toggles dry run entries in execution log", () => {
        const dryRunEntry = makeLogEntry({ affectedCount: 5, isDryRun: true, taskType: "LocationMigration" });
        const realEntry = makeLogEntry({ affectedCount: 42, isDryRun: false, taskType: "CoordinateMigration" });

        interceptStatus(makeStatusResponse(), "get-maintenance-status-ok");

        cy.intercept("GET", "/api/v2/maintenance/logs*", req => {
          if (req.url.includes("includeDryRun=true")) {
            req.reply({ body: makeLogResponse([dryRunEntry, realEntry]) });
          } else {
            req.reply({ body: makeLogResponse([realEntry]) });
          }
        }).as("get-logs");

        goToRouteAndAcceptTerms("/setting#maintenance");
        cy.wait("@get-logs");

        cy.dataCy("execution-log-include-dry-run").find("input").should("be.checked");
        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").should("have.length", 2);
        cy.dataCy("execution-log-table").should("contain", "5");
        cy.dataCy("execution-log-table").should("contain", "42");

        cy.dataCy("execution-log-include-dry-run").find("input").uncheck();
        cy.wait("@get-logs");

        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").should("have.length", 1);
        cy.dataCy("execution-log-table").should("contain", "42");
        cy.dataCy("execution-log-table").should("not.contain", "5");

        cy.dataCy("execution-log-include-dry-run").find("input").check();
        cy.wait("@get-logs");

        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").should("have.length", 2);
        cy.dataCy("execution-log-table").should("contain", "5");
        cy.dataCy("execution-log-table").should("contain", "42");
      });

      it("shows failed status with error message in log table", () => {
        interceptStatus(makeStatusResponse(), "get-maintenance-status-ok");
        interceptLogs(
          makeLogResponse([
            makeLogEntry({
              taskType: "CoordinateMigration",
              status: "Failed",
              affectedCount: null,
              message: "Connection refused",
              startedAt: "2026-02-20T10:00:00Z",
              completedAt: "2026-02-20T10:00:05Z",
            }),
          ]),
          "get-maintenance-logs-failed",
        );

        goToRouteAndAcceptTerms("/setting#maintenance");
        cy.wait("@get-maintenance-logs-failed");

        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").should("contain", "Connection refused");
      });

      it("shows empty state when no log entries exist", () => {
        interceptStatus(makeStatusResponse(), "get-maintenance-status-ok");
        interceptLogs(makeLogResponse(), "get-maintenance-logs-empty");

        goToRouteAndAcceptTerms("/setting#maintenance");
        cy.wait("@get-maintenance-logs-empty");

        cy.dataCy("execution-log-table").should("contain", "No rows");
      });

      it("paginates to the next page", () => {
        interceptStatus(makeStatusResponse(), "get-maintenance-status-ok");

        const page1Entries = Array.from({ length: 10 }, (_, i) => makeLogEntry({ affectedCount: i + 1 }));
        const page2Entries = Array.from({ length: 2 }, (_, i) => makeLogEntry({ affectedCount: 100 + i }));

        cy.intercept("GET", "/api/v2/maintenance/logs*", req => {
          if (req.url.includes("pageNumber=2")) {
            req.reply({ body: makeLogResponse(page2Entries, 12) });
          } else {
            req.reply({ body: makeLogResponse(page1Entries, 12) });
          }
        }).as("get-logs-paginated");

        goToRouteAndAcceptTerms("/setting#maintenance");
        cy.wait("@get-logs-paginated");

        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").should("have.length", 10);

        cy.dataCy("execution-log-table").find('[aria-label="next page"]').click();
        cy.wait("@get-logs-paginated");

        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").should("have.length", 2);
      });

      [
        { lng: "en", failed: "Failed", alreadyRunning: "Task is already running" },
        { lng: "de", failed: "Fehlgeschlagen", alreadyRunning: "Aufgabe wird bereits ausgeführt" },
        { lng: "fr", failed: "Échoué", alreadyRunning: "La tâche est déjà en cours d'exécution" },
        { lng: "it", failed: "Fallito", alreadyRunning: "L'attività è già in esecuzione" },
      ].forEach(({ lng, failed, alreadyRunning }) => {
        it(`shows localized error alert on 500 in ${lng}`, () => {
          interceptStatus(makeStatusResponse(), "get-maintenance-status-ok");
          cy.intercept("POST", "/api/v2/maintenance/LocationMigration", { statusCode: 500 }).as(
            "start-location-migration-fail",
          );

          goToRouteAndAcceptTerms("/setting#maintenance");
          selectLanguage(lng);
          cy.wait("@get-maintenance-status-ok");

          cy.dataCy("location-migration-start").click();
          cy.wait("@start-location-migration-fail");

          cy.get(".MuiAlert-message").should("contain", failed);
        });

        it(`shows localized error on 409 conflict in ${lng}`, () => {
          interceptStatus(makeStatusResponse(), "get-maintenance-status-ok");
          cy.intercept("POST", "/api/v2/maintenance/LocationMigration", {
            statusCode: 409,
            body: { type: "userError", detail: "The task is already running." },
          }).as("start-location-migration-conflict");

          goToRouteAndAcceptTerms("/setting#maintenance");
          selectLanguage(lng);
          cy.wait("@get-maintenance-status-ok");

          cy.dataCy("location-migration-start").click();
          cy.wait("@start-location-migration-conflict");

          cy.get(".MuiAlert-message").should("contain", alreadyRunning);
          cy.dataCy("location-migration-start").should("not.be.disabled");
        });
      });

      it("updates log table when one task completes while another is still running", () => {
        let statusCallCount = 0;
        let logCallCount = 0;
        const completedLogEntry = makeLogEntry({ affectedCount: 99 });

        // Dynamic status: first call both running, then location finished.
        cy.intercept("GET", "/api/v2/maintenance/status", req => {
          statusCallCount++;
          if (statusCallCount <= 1) {
            req.reply({
              body: makeStatusResponse({
                LocationMigration: { status: "Running", startedAt: "2026-02-20T10:00:00Z" },
                CoordinateMigration: { status: "Running", startedAt: "2026-02-20T10:00:00Z" },
              }),
            });
          } else {
            req.reply({
              body: makeStatusResponse({
                LocationMigration: {
                  status: "Completed",
                  startedAt: "2026-02-20T10:00:00Z",
                  completedAt: "2026-02-20T10:00:30Z",
                },
                CoordinateMigration: { status: "Running", startedAt: "2026-02-20T10:00:00Z" },
              }),
            });
          }
        }).as("get-status-partial");

        // Dynamic logs: first call empty, subsequent calls return the new entry.
        cy.intercept("GET", "/api/v2/maintenance/logs*", req => {
          logCallCount++;
          if (logCallCount <= 1) {
            req.reply({ body: makeLogResponse() });
          } else {
            req.reply({ body: makeLogResponse([completedLogEntry]) });
          }
        }).as("get-logs");

        goToRouteAndAcceptTerms("/setting#maintenance");
        cy.wait("@get-status-partial");
        cy.wait("@get-logs");

        // Table should initially show no rows.
        cy.dataCy("execution-log-table").should("contain", "No rows");

        // Wait for the next status poll to trigger the log invalidation.
        cy.wait("@get-status-partial");
        cy.wait("@get-logs");

        // The log table should now show the entry even though coordinate migration is still running.
        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").should("have.length", 1);
        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").first().should("contain", "99");
      });

      [
        { lng: "en", header: "Completed", relativeTime: "ago", duration: "30 seconds" },
        { lng: "de", header: "Abgeschlossen", relativeTime: "vor", duration: "30 Sekunden" },
        { lng: "fr", header: "Terminé", relativeTime: "il y a", duration: "30 secondes" },
        { lng: "it", header: "Completato", relativeTime: "fa", duration: "30 secondi" },
      ].forEach(({ lng, header, relativeTime, duration }) => {
        it(`renders log table correctly in ${lng}`, () => {
          localStorage.setItem("i18nextLng", lng);
          interceptStatus(makeStatusResponse(), "get-maintenance-status-ok");
          interceptLogs(makeLogResponse([makeLogEntry({ affectedCount: 7 })]), "get-maintenance-logs");

          goToRouteAndAcceptTerms("/setting#maintenance");
          cy.wait("@get-maintenance-logs");

          cy.dataCy("execution-log-table").find(".MuiDataGrid-columnHeader").should("contain", header);
          cy.dataCy("execution-log-table").find(".MuiDataGrid-row").first().should("contain", relativeTime);
          cy.dataCy("execution-log-table").find(".MuiDataGrid-row").first().should("contain", duration);
        });
      });

      it("renders log table correctly after cycling languages via UI", () => {
        interceptStatus(makeStatusResponse(), "get-maintenance-status-ok");
        interceptLogs(makeLogResponse([makeLogEntry({ affectedCount: 7 })]), "get-maintenance-logs");

        goToRouteAndAcceptTerms("/setting#maintenance");
        cy.wait("@get-maintenance-logs");

        [
          { lng: "de", header: "Abgeschlossen", relativeTime: "vor", duration: "30 Sekunden" },
          { lng: "fr", header: "Terminé", relativeTime: "il y a", duration: "30 secondes" },
          { lng: "it", header: "Completato", relativeTime: "fa", duration: "30 secondi" },
          { lng: "en", header: "Completed", relativeTime: "ago", duration: "30 seconds" },
        ].forEach(({ lng, header, relativeTime, duration }) => {
          selectLanguage(lng);
          cy.dataCy("execution-log-table").find(".MuiDataGrid-columnHeader").should("contain", header);
          cy.dataCy("execution-log-table").find(".MuiDataGrid-row").first().should("contain", relativeTime);
          cy.dataCy("execution-log-table").find(".MuiDataGrid-row").first().should("contain", duration);
        });
      });
    });
  });
});
