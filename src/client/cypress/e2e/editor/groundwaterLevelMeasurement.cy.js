import { createBorehole, adminUserAuth, login } from "../testHelpers";

describe("Tests for the groundwater level measurement editor.", () => {
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

    // open groundwater level measurement editor
    cy.get("@borehole_id").then(id =>
      login(`editor/${id}/hydrogeology/groundwaterlevelmeasurement`),
    );

    // start editing session
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");
  });

  it("Creates, updates and deletes groundwater level measurement", () => {
    // switch to german
    cy.get('[data-cy="menu"]').click({ force: true });
    cy.contains("span", "DE").click({ force: true });

    // create groundwater level measurement
    cy.get('[data-cy="add-groundwaterlevelmeasurement-button"]').click({
      force: true,
    });
    cy.wait("@groundwaterlevelmeasurement_GET");

    // fill kind dropdown
    cy.get('[data-cy="kind-select"]')
      .find('[role="button"]')
      .click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]')
      .find('[role="option"]')
      .eq(2)
      .click();

    // fill reliability dropdown
    cy.get('[data-cy="reliability-select"]')
      .find('[role="button"]')
      .click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]')
      .find('[role="option"]')
      .eq(1)
      .click();

    // fill start time
    cy.get('[data-cy="start-time-textfield"]').type("2012-11-14T12:06");

    // fill levels
    cy.get('[data-cy="level-m-textfield"]').type("789.12");
    cy.get('[data-cy="level-masl-textfield"]').type("5.4567");

    // close editing mask
    cy.get('[data-cy="close-icon"]').click({ force: true });

    //assert groundwater level measurement is displayed
    cy.contains("Manometer");
    cy.contains("789.12");
    cy.contains("5.4567");
    cy.contains("fraglich");

    // edit groundwater level measurement
    cy.get('[data-cy="edit-icon"]').click({ force: true });

    // change kind dropdown
    cy.get('[data-cy="kind-select"]')
      .find('[role="button"]')
      .click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]')
      .find('[role="option"]')
      .eq(1)
      .click();
    cy.get('[data-cy="close-icon"]').click({ force: true });
    cy.contains("Drucksonde");

    // delete groundwater level measurement
    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.wait("@groundwaterlevelmeasurement_DELETE");
    cy.get("body").should("not.contain", "mittel (30 - 120 l/min)");
  });
});
