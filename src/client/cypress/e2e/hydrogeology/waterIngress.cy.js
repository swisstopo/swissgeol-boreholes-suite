import { addItem, deleteItem, saveForm, startEditing } from "../helpers/buttonHelpers";
import { evaluateDisplayValue, setInput, setSelect } from "../helpers/formHelpers";
import {
  createBorehole,
  createCasing,
  createCompletion,
  createWateringress,
  goToRouteAndAcceptTerms,
  handlePrompt,
  selectLanguage,
  startBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for the wateringress editor.", () => {
  it("Creates, updates and deletes wateringresses", () => {
    // Create borehole with completion and casing
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id =>
        createCompletion("test wateringress", id, 16000002, true)
          .as("completion_id")
          .then(completionId => {
            createCasing("casing-1", id, completionId, "2021-01-01", "2021-01-02", [
              { fromDepth: 0, toDepth: 10, kindId: 25000103 },
            ]);
          }),
      );

    // open completion editor
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}`);
    });

    // start editing session
    startBoreholeEditing();

    cy.get('[data-cy="hydrogeology-menu-item"]').click({ force: true });
    cy.get('[data-cy="wateringress-menu-item"]').click({ force: true });

    cy.wait("@wateringress_GET");

    selectLanguage("de");

    // create wateringress
    addItem("addWaterIngress");
    cy.wait("@casing_GET");

    setSelect("quantityId", 2);
    setSelect("reliabilityId", 2);
    setSelect("casingId", 2);
    setInput("startTime", "2012-11-14T12:06");

    // close editing mask
    saveForm();

    evaluateDisplayValue("quantity", "viel (> 120 l/min)");
    evaluateDisplayValue("reliability", "fraglich");
    evaluateDisplayValue("casingName", "test wateringress - casing-1");

    // edit wateringress
    startEditing();
    setSelect("quantityId", 1);
    setSelect("conditionsId", 3);
    saveForm();
    evaluateDisplayValue("quantity", "mittel (30 - 120 l/min)");
    evaluateDisplayValue("conditions", "frei/ungespannt");
    evaluateDisplayValue("casingName", "test wateringress - casing-1");

    // delete wateringress
    deleteItem();
    handlePrompt("Wollen Sie diesen Eintrag wirklich löschen?", "Löschen");
    cy.wait("@wateringress_DELETE");
    cy.get("body").should("not.contain", "mittel (30 - 120 l/min)");
  });

  it("sorts wateringress", () => {
    createBorehole({ "extended.original_name": "INTEADAL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      createWateringress(id, "2012-11-14T12:06Z", 15203157, 15203161, null, 0, 10);
      createWateringress(id, "2012-11-14T12:07Z", 15203157, 15203162, null, 0, 12);
      goToRouteAndAcceptTerms(`/${id}/hydrogeology/wateringress`);
    });
    startBoreholeEditing();

    cy.get('[data-cy="waterIngress-card.0"] [data-cy="todepth-formDisplay"]').contains("10");
    cy.get('[data-cy="waterIngress-card.1"] [data-cy="todepth-formDisplay"]').contains("12");

    cy.get('[data-cy="waterIngress-card.1"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("toDepthM", "8");
    saveForm();
    cy.wait("@wateringress_GET");
    cy.get('[data-cy="waterIngress-card.0"] [data-cy="todepth-formDisplay"]').contains("8");
    cy.get('[data-cy="waterIngress-card.1"] [data-cy="todepth-formDisplay"]').contains("10");

    cy.get('[data-cy="waterIngress-card.0"] [data-cy="edit-button"]').click({
      force: true,
    });
    setInput("fromDepthM", "5");
    saveForm();
    cy.wait("@wateringress_GET");
    cy.get('[data-cy="waterIngress-card.0"] [data-cy="fromdepth-formDisplay"]').contains("0");
    cy.get('[data-cy="waterIngress-card.1"] [data-cy="fromdepth-formDisplay"]').contains("5");
  });
});
