import { createBorehole, adminUserAuth, login } from "../testHelpers";

const openDropdown = dataCy => {
  cy.get(`[data-cy="${dataCy}"]`)
    .find('[role="button"]')
    .click({ force: true });
};

const closeDropdown = () => {
  cy.get("body").click();
};

const checkDropdownOptionsLength = length => {
  cy.get('.MuiPaper-elevation [role="listbox"]').should($listbox => {
    expect($listbox.find('[role="option"]')).to.have.length(length);
  });
};

const selectDropdownOption = index => {
  cy.get('.MuiPaper-elevation [role="listbox"]')
    .find('[role="option"]')
    .eq(index)
    .click();
};

describe("Tests for the hydrotest editor.", () => {
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

    // open hydrotest editor
    cy.get("@borehole_id").then(id =>
      login(`editor/${id}/hydrogeology/hydrotest`),
    );

    // start editing session
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");
  });

  it("Creates, updates and deletes hydrotests", () => {
    // switch to german
    cy.get('[data-cy="menu"]').click({ force: true });
    cy.contains("span", "DE").click({ force: true });

    // create hydrotest
    cy.get('[data-cy="add-hydrotest-button"]').click({ force: true });
    cy.wait("@hydrotest_GET");

    // fill hydrotest kind dropdown
    openDropdown("hydrotest-kind-select");
    selectDropdownOption(2);
    cy.wait("@codelist_GET");

    // fill reliability dropdown
    openDropdown("reliability-select");
    selectDropdownOption(1);

    // fill start time
    cy.get('[data-cy="start-time-textfield"]').type("2012-11-14T12:06");

    // close editing mask
    cy.get('[data-cy="save-icon"]').click({ force: true });

    //assert hydrotest is displayed
    cy.contains("Pump-/Injektionsversuch, variable Rate");
    cy.contains("fraglich");

    cy.get('[data-cy="edit-icon"]').click({ force: true });

    // check flow direction options
    openDropdown("flow-direction-select");
    checkDropdownOptionsLength(3);
    closeDropdown();

    // check evaluation method options
    openDropdown("evaluation-method-select");
    checkDropdownOptionsLength(4);
    closeDropdown();

    // check hydrotest parameter options
    cy.get('[data-cy="add-hydrotestresult-button"]').click({ force: true });
    openDropdown("parameter-select");
    checkDropdownOptionsLength(6);
    closeDropdown();

    // change hydrotest kind dropdown to
    openDropdown("hydrotest-kind-select");
    selectDropdownOption(9);
    cy.wait("@codelist_GET");
    closeDropdown();

    // check flow direction options
    openDropdown("flow-direction-select");
    checkDropdownOptionsLength(2);
    selectDropdownOption(1);
    selectDropdownOption(0);
    closeDropdown();

    // check evaluation method options
    openDropdown("evaluation-method-select");
    checkDropdownOptionsLength(3);
    selectDropdownOption(1);
    selectDropdownOption(0);
    closeDropdown();

    // check hydrotest parameter options
    cy.get('[data-cy="add-hydrotestresult-button"]').click({ force: true });
    openDropdown("parameter-select");
    checkDropdownOptionsLength(1);
    selectDropdownOption(0);
    closeDropdown();

    // check if everything is displayed
    cy.get('[data-cy="save-hydrotest-result-icon"]').click({ force: true });
    cy.get('[data-cy="save-icon"]').click({ force: true });
    cy.contains("Infiltrationsversuch, ungesättigte Zone");
    cy.contains("Injektion, keine Angaben");
    cy.contains("instationär, numerisch");

    // delete hydrotest
    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.wait("@hydrotest_DELETE");
    cy.get("body").should(
      "not.contain",
      "Infiltrationsversuch, ungesättigte Zone",
    );
  });
});
