import {
  createBorehole,
  bearerAuth,
  startBoreholeEditing,
  loginAsAdmin,
} from "../helpers/testHelpers";
import { setInput, setSelect } from "../helpers/formHelpers";

describe("Tests for the wateringress editor.", () => {
  // beforeEach(function () {
  //   // add new borehole
  //   createBorehole({ "extended.original_name": "INTEADAL" })
  //     .as("borehole_id")
  //     .then(id => createStratigraphy(id, 3000))
  //     .then(response => {
  //       expect(response).to.have.property("status", 200);
  //     });

  //   // open wateringress editor
  //   cy.get("@borehole_id").then(id => {
  //     loginAsAdmin();
  //     cy.visit(`editor/${id}/hydrogeology/wateringress`);
  //   });

  //   // start editing session
  //   cy.contains("a", "Start editing").click();
  //   cy.wait("@edit_lock");
  // });

  it("Creates, updates and deletes wateringresses", () => {
    // Precondition: Create casing to later link in observation
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
      cy.visit(`/editor/${id}/completion`);
    });

    cy.wait("@get-completions-by-boreholeId");

    // start editing session
    startBoreholeEditing();

    cy.get("[data-cy=completion-content-header-tab-Casing]").click();
    cy.wait("@casing_GET");

    cy.get('[data-cy="addCasing-button"]').click({ force: true });
    cy.wait("@codelist_GET");

    setInput("name", "casing-1");
    setInput("fromDepth", "0");
    setInput("toDepth", "10");
    setSelect("kindId", 2);
    setSelect("materialId", 3);
    setInput("dateStart", "2021-01-01");
    setInput("dateFinish", "2021-01-02");
    setInput("innerDiameter", "3");
    setInput("outerDiameter", "4");

    cy.get('[data-cy="save-icon"]').click();
    cy.wait("@casing_GET");

    cy.get('[data-cy="hydrogeology-menu-item"]').click({ force: true });
    cy.get('[data-cy="wateringress-menu-item"]').click({ force: true });

    cy.wait("@wateringress_GET");

    // switch to german
    cy.get('[data-cy="menu"]').click({ force: true });
    cy.contains("span", "DE").click({ force: true });

    // create wateringress
    cy.get('[data-cy="add-wateringress-button"]').click({ force: true });
    cy.wait("@casing_GET");

    // fill quantity dropdown
    cy.get('[data-cy="quantity-select"]')
      .find('[role="combobox"]')
      .click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]')
      .find('[role="option"]')
      .eq(2)
      .click();

    // fill conditions dropdown
    cy.get('[data-cy="conditions-select"]')
      .find('[role="combobox"]')
      .click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]')
      .find('[role="option"]')
      .eq(3)
      .click();

    // fill reliability dropdown
    cy.get('[data-cy="reliability-select"]')
      .find('[role="combobox"]')
      .click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]')
      .find('[role="option"]')
      .eq(1)
      .click();

    // fill casing dropdown
    cy.get('[data-cy="casing-select"]')
      .find('[role="combobox"]')
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
      .find('[role="combobox"]')
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
