import { addItem, deleteItem, saveForm, startEditing } from "../helpers/buttonHelpers";
import { evaluateDisplayValue, setInput, setSelect } from "../helpers/formHelpers";
import {
  createBorehole,
  createCasing,
  createCompletion,
  goToRouteAndAcceptTerms,
  handlePrompt,
  selectLanguage,
  startBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for the groundwater level measurement editor.", () => {
  it("Creates, updates and deletes groundwater level measurement", () => {
    // Create borehole with completion and casing
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id =>
        createCompletion("test groundwaterlevel measurement", id, 16000002, true)
          .as("completion_id")
          .then(completionId => {
            createCasing("casing-1", id, completionId, "2021-01-01", "2021-01-02", [
              { fromDepth: 0, toDepth: 10, kindId: 25000103 },
            ]);
          }),
      );

    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}`);
    });
    startBoreholeEditing();

    cy.get('[data-cy="hydrogeology-menu-item"]').click({ force: true });
    cy.get('[data-cy="groundwaterlevelmeasurement-menu-item"]').click({
      force: true,
    });

    selectLanguage("de");

    // create groundwater level measurement
    addItem("addGroundwaterLevelMeasurement");
    cy.wait("@casing_GET");

    setSelect("kindId", 2);
    setSelect("casingId", 2);
    setInput("levelM", "78.1267");
    cy.get('[data-cy="groundwaterLevelMeasurement-card.0.edit"] [data-cy="levelMasl-formInput"] input').should(
      "be.disabled",
    );

    // close editing mask
    saveForm();
    evaluateDisplayValue("casingName", "test groundwaterlevel measurement - casing-1");
    evaluateDisplayValue("gwlm_kind", "Manometer");
    evaluateDisplayValue("gwlm_levelm", "78.127"); // Should round to 3 decimals
    evaluateDisplayValue("gwlm_levelmasl", "-");

    // edit groundwater level measurement
    startEditing();
    setSelect("kindId", 1);
    saveForm();
    evaluateDisplayValue("gwlm_kind", "Drucksonde");
    evaluateDisplayValue("casingName", "test groundwaterlevel measurement - casing-1");

    // delete groundwater level measurement
    deleteItem();
    handlePrompt("Wollen Sie diesen Eintrag wirklich löschen?", "Löschen");
    cy.wait("@groundwaterlevelmeasurement_DELETE");
    cy.get("body").should("not.contain", "Drucksonde");
  });
});
