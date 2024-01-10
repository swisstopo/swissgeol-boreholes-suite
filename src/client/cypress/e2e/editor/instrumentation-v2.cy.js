import { loginAsAdmin, adminUserAuth, createBorehole } from "../testHelpers";

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

describe("Instrumentation crud tests", () => {
  it("add, edit and delete instrumentations", () => {
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id =>
        cy
          .request({
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
            auth: adminUserAuth,
          })
          .then(response => {
            expect(response).to.have.property("status", 200);
          }),
      );

    // open completion editor
    cy.get("@borehole_id").then(id =>
      loginAsAdmin(`/editor/${id}/completion/v2`),
    );

    cy.contains("Tabs");

    // start editing session
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");

    // Necessary to wait for the instrumentation data to be loaded.
    cy.wait(1000);

    // create instrumentation
    cy.get('[data-cy="add-instrumentation-button"]').click({ force: true });
    cy.wait("@instrumentation_GET");

    // Necessary to wait for the instrumentation form to be loaded.
    cy.wait(1000);

    // fill out form
    cy.get('[data-cy="notes-textfield"]')
      .click()
      .then(() => {
        cy.get('[data-cy="notes-textfield"]').type("Lorem.", {
          delay: 10,
        });
      });

    cy.get('input[name="name"]')
      .click()
      .then(() => {
        cy.get('input[name="name"]').type("Inst-1", {
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

    cy.wait("@instrumentation_GET");

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

    // delete instrumentation
    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.contains("From depth").should("not.exist");
  });
});
