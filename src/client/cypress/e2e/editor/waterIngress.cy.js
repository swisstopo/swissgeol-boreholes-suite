import { createBorehole, adminUserAuth, login } from "../testHelpers";

describe("Tests for the wateringress editor.", () => {
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

    // open wateringress editor
    cy.get("@borehole_id").then(id =>
      login(`editor/${id}/hydrogeology/wateringress`),
    );

    // start editing session
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");
  });

  it("Creates, updates and deletes wateringresses", () => {
    // switch to german
    cy.get('[data-cy="menu"]').click({ force: true });
    cy.contains("span", "DE").click({ force: true });

    // create wateringress
    cy.get('[data-cy="add-wateringress-button"]').click({ force: true });
    cy.wait("@wateringress_GET");

    // fill quantity dropdown
    cy.get('[data-cy="quantity-select"]')
      .find('[role="button"]')
      .click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]')
      .find('[role="option"]')
      .eq(2)
      .click();

    // fill conditions dropdown
    cy.get('[data-cy="conditions-select"]')
      .find('[role="button"]')
      .click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]')
      .find('[role="option"]')
      .eq(3)
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

    // close editing mask
    cy.get('[data-cy="close-icon"]').click({ force: true });

    //assert wateringress is displayed
    cy.contains("viel (> 120 l/min)");
    cy.contains("frei/ungespannt");
    cy.contains("fraglich");

    // edit wateringress
    cy.get('[data-cy="edit-icon"]').click({ force: true });

    // change quantity dropdown
    cy.get('[data-cy="quantity-select"]')
      .find('[role="button"]')
      .click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]')
      .find('[role="option"]')
      .eq(1)
      .click();
    cy.get('[data-cy="close-icon"]').click({ force: true });
    cy.contains("mittel (30 - 120 l/min)");

    // delete wateringress
    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.wait("@wateringress_DELETE");
    cy.get("body").should("not.contain", "mittel (30 - 120 l/min)");
  });
});
