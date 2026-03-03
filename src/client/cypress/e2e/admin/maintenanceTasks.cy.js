import { goToRouteAndAcceptTerms, loginAsAdmin, loginAsEditor } from "../helpers/testHelpers.js";

const makeTaskState = (type, overrides = {}) => ({
  type,
  status: "Idle",
  affectedCount: null,
  message: null,
  startedAt: null,
  completedAt: null,
  ...overrides,
});

const makeStatusResponse = (locationOverrides = {}, coordinateOverrides = {}) => [
  makeTaskState("LocationMigration", locationOverrides),
  makeTaskState("CoordinateMigration", coordinateOverrides),
];

const makeLogResponse = (logEntries = [], totalCount = null) => ({
  totalCount: totalCount ?? logEntries.length,
  pageNumber: 1,
  pageSize: 5,
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
        cy.dataCy("execution-log-section").should("be.visible");
        cy.dataCy("execution-log-table").should("be.visible");
        cy.dataCy("execution-log-include-dry-run").find("input").should("not.be.checked");
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

      it("shows log entry after dry-run migration completes", () => {
        cy.wait("@get-maintenance-status");

        // Enable "show dry runs" so the log entry will be visible.
        cy.dataCy("execution-log-include-dry-run").find("input").check();

        // Count rows before starting the migration (may be zero).
        cy.dataCy("execution-log-table").then($table => {
          const initialCount = $table.find(".MuiDataGrid-row").length;

          // Start the dry-run migration (defaults: dry run + only missing).
          cy.dataCy("location-migration-start").click();
          cy.wait("@start-location-migration");

          // Wait for the button to become enabled again (task completed).
          cy.get("[data-cy=location-migration-start]", { timeout: 30000 }).should("not.be.disabled");

          // Verify a new row was added.
          cy.dataCy("execution-log-table")
            .find(".MuiDataGrid-row", { timeout: 10000 })
            .should("have.length.greaterThan", initialCount);
        });
      });

      it("can toggle checkboxes", () => {
        ["location-migration-only-missing", "location-migration-dry-run"].forEach(cyName => {
          cy.dataCy(cyName).find("input").should("be.checked");
          cy.dataCy(cyName).find("input").uncheck();
          cy.dataCy(cyName).find("input").should("not.be.checked");
        });
      });
    });

    describe("with stubbed responses", () => {
      it("disables run button while a task is running", () => {
        interceptStatus(
          makeStatusResponse({ status: "Running", startedAt: new Date().toISOString() }),
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

        const page1Entries = Array.from({ length: 5 }, (_, i) => makeLogEntry({ affectedCount: i + 1 }));
        const page2Entries = Array.from({ length: 2 }, (_, i) => makeLogEntry({ affectedCount: 100 + i }));

        cy.intercept("GET", "/api/v2/maintenance/logs*", req => {
          if (req.url.includes("pageNumber=2")) {
            req.reply({ body: makeLogResponse(page2Entries, 7) });
          } else {
            req.reply({ body: makeLogResponse(page1Entries, 7) });
          }
        }).as("get-logs-paginated");

        goToRouteAndAcceptTerms("/setting#maintenance");
        cy.wait("@get-logs-paginated");

        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").should("have.length", 5);

        cy.dataCy("execution-log-table").find('[aria-label="next page"]').click();
        cy.wait("@get-logs-paginated");

        cy.dataCy("execution-log-table").find(".MuiDataGrid-row").should("have.length", 2);
      });

      it("shows error alert when migration start fails", () => {
        cy.intercept("POST", "/api/v2/maintenance/LocationMigration", { statusCode: 500 }).as(
          "start-location-migration-fail",
        );

        goToRouteAndAcceptTerms("/setting#maintenance");
        cy.wait("@get-maintenance-status");

        cy.dataCy("location-migration-start").click();
        cy.wait("@start-location-migration-fail");

        cy.get(".MuiAlert-message").should("contain", "Failed");
      });

      it("shows already running error on 409 conflict", () => {
        interceptStatus(makeStatusResponse(), "get-maintenance-status-ok");
        cy.intercept("POST", "/api/v2/maintenance/LocationMigration", {
          statusCode: 409,
          body: { type: "userError", detail: "The task is already running." },
        }).as("start-location-migration-conflict");

        goToRouteAndAcceptTerms("/setting#maintenance");
        cy.wait("@get-maintenance-status-ok");

        cy.dataCy("location-migration-start").click();
        cy.wait("@start-location-migration-conflict");

        cy.get(".MuiAlert-message").should("contain", "Task is already running");
        cy.dataCy("location-migration-start").should("not.be.disabled");
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
              body: makeStatusResponse(
                { status: "Running", startedAt: "2026-02-20T10:00:00Z" },
                { status: "Running", startedAt: "2026-02-20T10:00:00Z" },
              ),
            });
          } else {
            req.reply({
              body: makeStatusResponse(
                { status: "Completed", startedAt: "2026-02-20T10:00:00Z", completedAt: "2026-02-20T10:00:30Z" },
                { status: "Running", startedAt: "2026-02-20T10:00:00Z" },
              ),
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
    });
  });
});
