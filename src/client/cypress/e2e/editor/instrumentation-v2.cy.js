import {
  loginAsAdmin,
  bearerAuth,
  createBorehole,
  startBoreholeEditing,
  openDropdown,
  selectDropdownOption,
  setTextfield,
} from "../testHelpers";

describe("Instrumentation crud tests", () => {
  it("add, edit and delete instrumentations", () => {
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

    // Precondition: Create casing to later link in instrumentation
    cy.get("[data-cy=completion-content-header-tab-Casing]").click();
    cy.wait("@casing_GET");

    cy.get('[data-cy="add-casing-button"]').click({ force: true });
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

    cy.get('[data-cy="save-icon"]').click();
    cy.wait("@get-casing-by-completionId");

    cy.get("[data-cy=completion-content-header-tab-Instrumentation]").click();
    cy.wait("@instrumentation_GET");

    // create instrumentation
    cy.get('[data-cy="add-instrumentation-button"]').click({ force: true });
    cy.wait("@codelist_GET");

    // fill out form
    setTextfield('textarea[name="notes"]', "Lorem.");
    setTextfield('input[name="name"]', "Inst-1");
    setTextfield('input[name="fromDepth"]', "123456");
    setTextfield('input[name="toDepth"]', "987654");
    openDropdown("instrumentation-kind-select");
    selectDropdownOption(2);
    openDropdown("instrumentation-status-select");
    selectDropdownOption(1);

    // save instrumentation
    cy.get('[data-cy="save-icon"]').click();

    // check if instrumentation is saved
    cy.contains("123456");
    cy.contains("987654");
    cy.contains("Inst-1");
    cy.contains("Lorem.");
    cy.contains("suction pump");
    cy.contains("inactive");

    // edit instrumentation
    cy.get('[data-cy="edit-icon"]').click({ force: true });

    // We need the casings for the casing name dropdown
    cy.wait("@get-casing-by-completionId");

    setTextfield('input[name="fromDepth"]', "222");
    openDropdown("instrumentation-casing-id-select");
    selectDropdownOption(1);

    // close editing mask
    cy.get('[data-cy="save-icon"]').click({ force: true });
    cy.contains("casing-1");
    cy.contains("123456222");
    cy.contains("inactive");

    // delete instrumentation
    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.contains("From depth").should("not.exist");
  });
});
