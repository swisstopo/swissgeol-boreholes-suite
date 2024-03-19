import {
  createBorehole,
  createCompletion,
  startBoreholeEditing,
  loginAsAdmin,
  createCasing,
  handlePrompt,
} from "../helpers/testHelpers";
import { evaluateDisplayValue, setInput, setSelect } from "../helpers/formHelpers";
import { addItem, startEditing, saveForm, deleteItem } from "../helpers/buttonHelpers";

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
      )
      .then(response => {
        expect(response).to.have.property("status", 200);
      });

    // open completion editor
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/completion`);
    });

    cy.wait("@get-completions-by-boreholeId");

    // start editing session
    startBoreholeEditing();

    cy.get('[data-cy="hydrogeology-menu-item"]').click({ force: true });
    cy.get('[data-cy="wateringress-menu-item"]').click({ force: true });

    cy.wait("@wateringress_GET");

    // switch to german
    cy.get('[data-cy="menu"]').click({ force: true });
    cy.contains("span", "DE").click({ force: true });

    cy.wait(1000);
    // create wateringress
    addItem("addWaterIngress");
    cy.wait("@casing_GET");

    setSelect("quantityId", 2);
    setSelect("reliabilityId", 1);
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
      loginAsAdmin();
      cy.visit(`/editor/${id}/hydrogeology/wateringress`);
    });
    startBoreholeEditing();

    addItem("addWaterIngress");
    cy.wait("@casing_GET");
    setInput("fromDepthM", 0);
    setInput("toDepthM", 10);
    setSelect("quantityId", 2);
    setSelect("reliabilityId", 1);
    setInput("startTime", "2012-11-14T12:06");
    saveForm();
    cy.wait("@wateringress_GET");

    cy.wait(1000);
    addItem("addWaterIngress");
    cy.wait("@casing_GET");
    setInput("fromDepthM", 0);
    setInput("toDepthM", 12);
    setSelect("quantityId", 2);
    setSelect("reliabilityId", 1);
    setInput("startTime", "2012-11-14T12:06");
    saveForm();
    cy.wait("@wateringress_GET");

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
