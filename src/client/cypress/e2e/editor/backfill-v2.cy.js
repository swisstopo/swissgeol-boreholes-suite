import {
  loginAsAdmin,
  bearerAuth,
  createBorehole,
  startBoreholeEditing,
  setTextfield,
  openDropdown,
  selectDropdownOption,
} from "../testHelpers";

describe("Backfill crud tests", () => {
  it("add, edit and delete backfills", () => {
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

    // select backfill tab
    cy.get("[data-cy=completion-content-header-tab-Backfill]").click();
    cy.wait("@get-backfill-by-completionId");

    // add new backfill card
    cy.get('[data-cy="add-backfill-button"]').click({ force: true });
    cy.wait("@codelist_GET");

    // fill out form
    setTextfield('textarea[name="notes"]', "Lorem.");
    setTextfield('input[name="fromDepth"]', "123456");
    setTextfield('input[name="toDepth"]', "987654");
    openDropdown("backfill-kind-select");
    selectDropdownOption(2);
    openDropdown("backfill-material-select");
    selectDropdownOption(1);

    // save backfill
    cy.get('[data-cy="save-icon"]').click();

    // check if backfill is saved
    cy.contains("123456");
    cy.contains("987654");
    cy.contains("Lorem.");
    cy.contains("casing plugging");
    cy.contains("filter gravel");

    // edit backfill
    cy.get('[data-cy="edit-icon"]').click({ force: true });
    cy.wait("@codelist_GET");

    setTextfield('input[name="fromDepth"]', "222");

    // close editing mask
    cy.get('[data-cy="save-icon"]').click({ force: true });
    cy.contains("123456222");
    cy.contains("inactive");

    // delete backfill
    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.contains("From depth").should("not.exist");
  });
});
