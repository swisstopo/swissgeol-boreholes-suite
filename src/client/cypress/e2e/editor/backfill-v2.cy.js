import { loginAsAdmin, bearerAuth, createBorehole } from "../testHelpers";

const openDropdown = dataCy => {
  cy.get(`[data-cy="${dataCy}"]`)
    .find('[role="combobox"]')
    .click({ force: true });
};

const selectDropdownOption = index => {
  cy.get('.MuiPaper-elevation [role="listbox"]')
    .find('[role="option"]')
    .eq(index)
    .click();
};

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
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");

    // Necessary to wait for the backfill data to be loaded.
    cy.wait(1000);

    // create backfill
    cy.get('[data-cy="add-backfill-button"]').click({ force: true });
    cy.wait("@backfill_GET");

    // Necessary to wait for the backfill form to be loaded.
    cy.wait(1000);

    // fill out form
    cy.get('[data-cy="notes-textfield"]')
      .click()
      .then(() => {
        cy.get('[data-cy="notes-textfield"]').type("Lorem.", {
          delay: 10,
        });
      });

    cy.get('input[name="fromDepth"]')
      .click()
      .then(() => {
        cy.get('input[name="fromDepth"]').type("123456", {
          delay: 10,
        });
      });

    cy.get('input[name="toDepth"]')
      .click()
      .then(() => {
        cy.get('input[name="toDepth"]').type("987654", {
          delay: 10,
        });
      });

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

    cy.wait("@backfill_GET");

    cy.get('input[name="fromDepth"]')
      .click()
      .then(() => {
        cy.get('input[name="fromDepth"]').type("222", {
          delay: 10,
        });
      });

    // Necessary to wait, otherwise the type is not finished yet.
    // It cannot be checked for the value of the input element, because the value is not updated yet.
    cy.wait(1000);

    // close editing mask
    cy.get('[data-cy="save-icon"]').click({ force: true });
    cy.contains("123456222");
    cy.contains("inactive");

    // delete backfill
    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.contains("From depth").should("not.exist");
  });
});
