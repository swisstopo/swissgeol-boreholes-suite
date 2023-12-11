import { createBorehole, adminUserAuth, login } from "../testHelpers";

describe("Tests for the field measurement editor.", () => {
  beforeEach(function () {
    // add new borehole
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => {
        cy.request({
          method: "POST",
          url: "/api/v1/borehole/stratigraphy/edit",
          body: {
            action: "CREATE",
            id: id,
            kind: 3000,
          },
          auth: adminUserAuth,
        });
      })
      .then(response => {
        expect(response.body).to.have.property("success", true);
      });

    // open field measurement editor
    cy.get("@borehole_id").then(id =>
      login(`editor/${id}/hydrogeology/fieldmeasurement`),
    );

    // start editing session
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");
  });

  it("Creates, updates and deletes field measurement", () => {
    // switch to german
    cy.get('[data-cy="menu"]').click({ force: true });
    cy.contains("span", "DE").click({ force: true });

    // create field measurement
    cy.get('[data-cy="add-fieldmeasurement-button"]').click({
      force: true,
    });
    cy.wait("@fieldmeasurement_GET");

    // fill reliability dropdown
    cy.get('[data-cy="reliability-select"]')
      .find('[role="combobox"]')
      .click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]')
      .find('[role="option"]')
      .eq(1)
      .click();

    // fill start time
    cy.get('[data-cy="start-time-textfield"]').type("2012-11-14T12:06");

    // fill sample type dropdown
    cy.get('[data-cy="sample-type-select"]')
      .find('[role="combobox"]')
      .click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]')
      .find('[role="option"]')
      .eq(1)
      .click();

    // fill parameter dropdown
    cy.get('[data-cy="parameter-select"]')
      .find('[role="combobox"]')
      .click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]')
      .find('[role="option"]')
      .eq(2)
      .click();

    // fill value
    cy.get('[data-cy="value-textfield"]').type("77.1045");

    // close editing mask
    cy.get('[data-cy="close-icon"]').click({ force: true });

    //assert field measurementis displayed
    cy.contains("Schöpfprobe");
    cy.contains("elektrische Leitfähigkeit (20 °C)");
    cy.contains("77.1045");

    // edit field measurement
    cy.get('[data-cy="edit-icon"]').click({ force: true });

    // fill sample type dropdown
    cy.get('[data-cy="sample-type-select"]')
      .find('[role="combobox"]')
      .click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]')
      .find('[role="option"]')
      .eq(0)
      .click();
    cy.get('[data-cy="close-icon"]').click({ force: true });
    cy.contains("Pumpprobe");

    // delete field measurement
    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.wait("@fieldmeasurement_DELETE");
    cy.get("body").should("not.contain", "Pumpprobe");
  });
});
