import {
  loginAsAdmin,
  bearerAuth,
  createBorehole,
  startBoreholeEditing,
  setTextfield,
  openDropdown,
  selectDropdownOption,
} from "../testHelpers";

describe("Casing crud tests", () => {
  it("add, edit and delete casings", () => {
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id =>
        cy.get("@id_token").then(token => {
          cy.request({
            method: "POST",
            url: "/api/v2/completion",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              boreholeId: id,
              isPrimary: true,
              kindId: 16000002,
            },
            auth: bearerAuth(token),
          }).then(response => {
            expect(response).to.have.property("status", 200);
          });
        }),
      );

    // open completion editor
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/completion/v2`);
    });

    cy.wait("@get-completions-by-boreholeId");

    // start editing session
    startBoreholeEditing();

    // select casing tab
    cy.get("[data-cy=completion-content-header-tab-Casing]").click();
    cy.wait("@casing_GET");

    // create casing
    cy.get('[data-cy="add-casing-button"]').click();
    cy.wait("@codelist_GET");

    setTextfield('input[name="name"]', "casing-1");
    setTextfield('input[name="fromDepth"]', "0");
    setTextfield('input[name="toDepth"]', "10");
    openDropdown("casing-kind-select");
    selectDropdownOption(2);
    openDropdown("casing-material-select");
    selectDropdownOption(3);
    setTextfield('input[name="dateStart"]', "2021-01-01");
    setTextfield('input[name="dateFinish"]', "2021-01-02");
    setTextfield('input[name="innerDiameter"]', "3");
    setTextfield('input[name="outerDiameter"]', "4");
    setTextfield('textarea[name="notes"]', "Lorem.");

    cy.get('[data-cy="save-icon"]').click();
    cy.wait("@casing_GET");

    cy.get('[data-cy="casing-name"]').contains("casing-1");
    cy.get('[data-cy="casing-fromDepth"]').contains("0");
    cy.get('[data-cy="casing-toDepth"]').contains("10");
    cy.get('[data-cy="casing-kind"]').contains("conductor pipe");
    cy.get('[data-cy="casing-material"]').contains("steel");
    cy.get('[data-cy="casing-dateStart"]').contains("01. Jan. 2021");
    cy.get('[data-cy="casing-dateFinish"]').contains("02. Jan. 2021");
    cy.get('[data-cy="casing-innerDiameter"]').contains("3");
    cy.get('[data-cy="casing-outerDiameter"]').contains("4");
    cy.get('[data-cy="casing-notes"]').contains("Lorem.");

    // update casing
    cy.get('[data-cy="edit-icon"]').click();
    cy.wait("@codelist_GET");

    setTextfield('input[name="name"]', " updated");
    openDropdown("casing-material-select");
    selectDropdownOption(5);

    cy.get('[data-cy="save-icon"]').click({ force: true });
    cy.get('[data-cy="casing-name"]').contains("casing-1 updated");
    cy.get('[data-cy="casing-material"]').contains("concrete");
    cy.get('[data-cy="casing-innerDiameter"]').contains("3");

    // delete casing
    // Precondition: instrumentation with reference to casing
    cy.get("[data-cy=completion-content-header-tab-Instrumentation]").click();
    cy.wait("@instrumentation_GET");

    cy.get('[data-cy="add-instrumentation-button"]').click({ force: true });
    cy.wait("@casing_GET");

    setTextfield('textarea[name="notes"]', "Lorem.");
    setTextfield('input[name="name"]', "Inst-1");
    setTextfield('input[name="fromDepth"]', "123456");
    setTextfield('input[name="toDepth"]', "987654");
    openDropdown("instrumentation-kind-select");
    selectDropdownOption(2);
    openDropdown("instrumentation-status-select");
    selectDropdownOption(1);
    openDropdown("instrumentation-casing-id-select");
    selectDropdownOption(1);
    cy.get('[data-cy="save-icon"]').click({ force: true });

    cy.get("[data-cy=completion-content-header-tab-Casing]").click();
    cy.wait("@casing_GET");

    // cannot delete if connected to instrumentation
    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.wait("@casing_DELETE");
    cy.on("window:alert", txt => {
      expect(txt).to.contains(
        "Cannot delete casing because it is referenced by an instrumentation.",
      );
    });
    cy.on("window:confirm", () => true);

    // can delete if not connected to instrumentation
    cy.get("[data-cy=completion-content-header-tab-Instrumentation]").click();
    cy.wait("@instrumentation_GET");
    cy.get('[data-cy="edit-icon"]').click();
    openDropdown("instrumentation-casing-id-select");
    selectDropdownOption(0);
    cy.get('[data-cy="save-icon"]').click({ force: true });

    cy.get("[data-cy=completion-content-header-tab-Casing]").click();
    cy.wait("@casing_GET");

    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.wait("@casing_DELETE");
    cy.contains("casing-1 updated").should("not.exist");
  });
});
