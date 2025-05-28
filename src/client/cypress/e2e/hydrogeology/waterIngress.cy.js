import { addItem, deleteItem, saveForm, startEditing } from "../helpers/buttonHelpers";
import { evaluateDisplayValue, setInput, setSelect } from "../helpers/formHelpers";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers.js";
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

    navigateInSidebar(SidebarMenuItem.hydrogeology);
    navigateInSidebar(SidebarMenuItem.waterIngress);

    selectLanguage("de");

    // create wateringress
    addItem("addWaterIngress");
    cy.wait("@casing_by_borehole_GET");

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
    handlePrompt("Wollen Sie diesen Eintrag wirklich löschen?", "delete");
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

  it("calculates and sets depth automatically", () => {
    createBorehole({
      "extended.original_name": "INTEADAL",
      reference_elevation: 4000,
    }).as("borehole_id");

    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}/hydrogeology/wateringress`);
      startBoreholeEditing();

      // Create water ingress and check states of depth inputs
      addItem("addWaterIngress");
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="fromDepthMasl-formInput"] input').should("be.disabled");
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="toDepthMasl-formInput"] input').should("be.disabled");
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="fromDepthM-formInput"] input').should("not.be.disabled");
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="toDepthM-formInput"] input').should("not.be.disabled");
      cy.get(
        '[data-cy="waterIngress-card.0.edit"] [data-cy="originalVerticalReferenceSystem-formSelect"] input',
      ).should("have.value", "1");

      // Save with minimal info
      setSelect("quantityId", 2);
      saveForm();
      cy.wait("@wateringress_GET");

      // Ensure depths have no values
      cy.get('[data-cy="waterIngress-card.0"] [data-cy="fromdepth-formDisplay"]').as("fromDepthDisplay").contains("-");
      cy.get('[data-cy="waterIngress-card.0"] [data-cy="todepth-formDisplay"]').as("toDepthDisplay").contains("-");
      cy.get('[data-cy="waterIngress-card.0"] [data-cy="fromDepthMasl-formDisplay"]')
        .as("fromDepthMaslDisplay")
        .contains("-");
      cy.get('[data-cy="waterIngress-card.0"] [data-cy="toDepthMasl-formDisplay"]')
        .as("toDepthMaslDisplay")
        .contains("-");

      startEditing();
      // Ensure depth input dropdown is set to "Measured Depth" and switch to "Meters above sea level"
      cy.get(
        '[data-cy="waterIngress-card.0.edit"] [data-cy="originalVerticalReferenceSystem-formSelect"] input',
      ).should("have.value", "1");
      setSelect("originalVerticalReferenceSystem", 1);

      // Check states of depth inputs
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="fromDepthMasl-formInput"] input').should(
        "not.be.disabled",
      );
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="toDepthMasl-formInput"] input').should("not.be.disabled");
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="fromDepthM-formInput"] input').should("be.disabled");
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="toDepthM-formInput"] input').should("be.disabled");

      // Enter Masl and ensure MD is automatically set
      setInput("fromDepthMasl", 3976);
      cy.wait([
        "@get-boreholegeometry-depth-md",
        "@get-boreholegeometry-depth-md",
        "@get-boreholegeometry-depth-md",
        "@get-boreholegeometry-depth-md",
      ]);
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="fromDepthM-formInput"] input').should("have.value", "24");

      setInput("toDepthMasl", 3945);
      cy.wait([
        "@get-boreholegeometry-depth-md",
        "@get-boreholegeometry-depth-md",
        "@get-boreholegeometry-depth-md",
        "@get-boreholegeometry-depth-md",
      ]);
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="toDepthM-formInput"] input').should("have.value", "55");

      saveForm();
      cy.wait("@wateringress_GET");

      // Ensure depths have correct values in display
      cy.get("@fromDepthDisplay").contains("24");
      cy.get("@toDepthDisplay").contains("55");
      cy.get("@fromDepthMaslDisplay").contains("3'976");
      cy.get("@toDepthMaslDisplay").contains("3'945");

      startEditing();
      // Ensure depth input dropdown is set to "Meters above sea level" and switch to "Measured Depth"
      cy.get(
        '[data-cy="waterIngress-card.0.edit"] [data-cy="originalVerticalReferenceSystem-formSelect"] input',
      ).should("have.value", "2");
      setSelect("originalVerticalReferenceSystem", 0);
      handlePrompt(
        "Changing the vertical reference system will reset the depth values. Do you want to continue?",
        "cancel",
      );

      // Check that the state of the depth inputs did not change
      cy.get(
        '[data-cy="waterIngress-card.0.edit"] [data-cy="originalVerticalReferenceSystem-formSelect"] input',
      ).should("have.value", "2");
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="fromDepthMasl-formInput"] input').should("be.enabled");
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="toDepthMasl-formInput"] input').should("be.enabled");
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="fromDepthM-formInput"] input').should("be.disabled");
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="toDepthM-formInput"] input').should("be.disabled");

      setSelect("originalVerticalReferenceSystem", 0);
      handlePrompt(
        "Changing the vertical reference system will reset the depth values. Do you want to continue?",
        "confirm",
      );
      cy.get(
        '[data-cy="waterIngress-card.0.edit"] [data-cy="originalVerticalReferenceSystem-formSelect"] input',
      ).should("have.value", "1");
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="fromDepthMasl-formInput"] input').should("be.disabled");
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="toDepthMasl-formInput"] input').should("be.disabled");
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="fromDepthM-formInput"] input').should("be.enabled");
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="toDepthM-formInput"] input').should("be.enabled");

      saveForm();
      cy.wait("@wateringress_GET");

      // Ensure depths have no values in display
      cy.get("@fromDepthDisplay").contains("-");
      cy.get("@toDepthDisplay").contains("-");
      cy.get("@fromDepthMaslDisplay").contains("-");
      cy.get("@toDepthMaslDisplay").contains("-");

      // Enter MD and ensure Masl is automatically set
      startEditing();
      setInput("fromDepthM", 1);
      cy.wait("@get-boreholegeometry-depth-masl");
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="fromDepthMasl-formInput"] input').should(
        "have.value",
        "3'999",
      );

      setInput("toDepthM", 2);
      cy.wait("@get-boreholegeometry-depth-masl");
      cy.get('[data-cy="waterIngress-card.0.edit"] [data-cy="toDepthMasl-formInput"] input').should(
        "have.value",
        "3'998",
      );

      saveForm();
      cy.wait("@wateringress_GET");

      // Double check values in display form
      cy.get("@fromDepthDisplay").contains("1");
      cy.get("@toDepthDisplay").contains("2");
      cy.get("@fromDepthMaslDisplay").contains("3'999");
      cy.get("@toDepthMaslDisplay").contains("3'998");
    });
  });
});
