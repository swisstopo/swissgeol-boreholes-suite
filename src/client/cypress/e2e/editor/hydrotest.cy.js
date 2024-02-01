import {
  createBorehole,
  createStratigraphy,
  loginAsAdmin,
} from "../helpers/testHelpers";
import {
  evaluateDisplayValue,
  openDropdown,
  selectDropdownOption,
  closeDropdown,
  setInput,
  setSelect,
  toggleMultiSelect,
} from "../helpers/formHelpers";

describe("Tests for the hydrotest editor.", () => {
  beforeEach(function () {
    // add new borehole
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => createStratigraphy(id, 3000))
      .then(response => {
        expect(response).to.have.property("status", 200);
      });

    // open hydrotest editor
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`editor/${id}/hydrogeology/hydrotest`);
    });

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
    toggleMultiSelect("testKindId", [2]);

    setSelect("reliabilityId", 1);
    setInput("startTime", "2012-11-14T12:06");

    // close editing mask
    cy.get('[data-cy="save-icon"]').click({ force: true });

    //assert hydrotest is displayed
    cy.contains("Pump-/Injektionsversuch, variable Rate");
    evaluateDisplayValue("reliability", "fraglich");

    cy.get('[data-cy="edit-icon"]').click({ force: true });

    // check flow direction options
    toggleMultiSelect("flowDirectionId", [1, 0], 3);

    // check evaluation method options
    toggleMultiSelect("evaluationMethodId", [1, 0], 4);

    // check hydrotest parameter options
    cy.get('[data-cy="add-hydrotestresult-button"]').click({ force: true });
    openDropdown("parameter-select");
    selectDropdownOption(0);
    closeDropdown();

    // check if everything is displayed
    cy.get('[data-cy="save-hydrotest-result-icon"]').click({ force: true });
    cy.get('[data-cy="save-icon"]').click({ force: true });
    cy.contains("Pump-/Injektionsversuch, variable Rate");
    cy.contains("Injektion, Entnahme");
    cy.contains("stationär, instationär");

    // delete hydrotest
    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.wait("@hydrotest_DELETE");
    cy.get("body").should(
      "not.contain",
      "Pump-/Injektionsversuch, variable Rate",
    );
  });
});
