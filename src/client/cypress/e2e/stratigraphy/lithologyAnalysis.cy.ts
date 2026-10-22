import { ClassifyResponse } from "../../../src/api/dataextractionInterfaces.ts";
import { evaluateSelect } from "../helpers/formHelpers";
import { createStratigraphyWith3Lithologies, handlePrompt } from "../helpers/testHelpers";
import { isUnconsolidatedForm } from "./lithologyHelpers";
import { LayerType, openLayer } from "./stratigraphyHelpers";

// The classification response is stubbed, because the model's answer for a description can change
// with every release of the data extraction service while the assertions below test the dialog.

/**
 * Written for the unconsolidated description the design uses, and chosen so that it exercises every
 * awkward part of the mapping: the lowercase `mgr` against the code `MGr`, the escaping underscore
 * of `or_` against `Or`, the compound `GP_GC` against `GP-GC`, `light_grey` against the text
 * `light grey`, and `fragments_splitters` against the text `fragments, splitters`. The four
 * secondaries reproduce the litho code `MGr-fsa-si-co-or` shown in the design.
 */
const unconsolidatedResponse: ClassifyResponse = {
  consolidation: "unconsolidated",
  en_main: "mgr",
  en_secondary: ["fsa", "si", "co", "or_"],
  uscs: "GP_GC",
  color: "light_grey",
  organic_components: ["remains_of_wood"],
  grain_angularity: ["well_rounded"],
  grain_shape: ["platy"],
  debris: ["rubble", "fragments_splitters"],
};

/** Written for the consolidated description the design uses. */
const consolidatedResponse: ClassifyResponse = {
  consolidation: "consolidated",
  lithology: "sandstone",
  color: "light_grey",
  cementation: "well_cemented",
  alteration_degree_consolidated: "moderately_weathered",
  mineral_components: ["biotite"],
  accessory_components: ["biodetritus"],
};

const stubClassification = (response: ClassifyResponse) => {
  cy.intercept("POST", "dataextraction/api/V1/classify", { statusCode: 200, body: response }).as("classify");
};

const descriptionField = () => cy.dataCy("lithology-lithological-description").find("textarea").first();

const analyze = (description: string) => {
  descriptionField().clear();
  descriptionField().type(description, { delay: 0 });
  cy.dataCy("analyze-button").click();
  cy.dataCy("analysis-result-card").should("be.visible");
};

describe("Lithology automatic classification", () => {
  beforeEach(() => {
    stubClassification(unconsolidatedResponse);
    createStratigraphyWith3Lithologies();
    openLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
  });

  it("fills the fields, highlights them and documents the changes", () => {
    analyze("Mittelkies, gut gerundet, feinsandig, schwach siltig, hellgrau");

    evaluateSelect("lithologyDescriptions.0.lithologyUnconMainId", "medium gravel (MGr)");
    cy.dataCy("lithologyDescriptions.0.lithologyUnconMainId-formSelect").should("have.class", "analysis-highlight");
    cy.dataCy("lithologyDescriptions.0.lithologyUnconMainId-analysis-reset").scrollIntoView();
    cy.dataCy("lithologyDescriptions.0.lithologyUnconMainId-analysis-reset").should("be.visible");
    cy.dataCy("analysis-result-card").contains("Major component");
    cy.dataCy("analysis-result-card").contains("[empty]");
  });

  it("resets a single field without touching the others", () => {
    analyze("Mittelkies, feinsandig, hellgrau");

    cy.dataCy("lithologyDescriptions.0.colorPrimaryId-analysis-reset").click();

    evaluateSelect("lithologyDescriptions.0.colorPrimaryId", "");
    cy.dataCy("lithologyDescriptions.0.colorPrimaryId-formSelect").should("not.have.class", "analysis-highlight");
    cy.dataCy("lithologyDescriptions.0.lithologyUnconMainId-formSelect").should("have.class", "analysis-highlight");
  });

  it("switches the mode, marks the tab and takes the switch back", () => {
    stubClassification(consolidatedResponse);
    analyze("Sandstein, siltig, mit Biotit, hellgrau, gut zementiert");

    isUnconsolidatedForm(false);
    cy.dataCy("analysis-mode-change").contains("Mode changed");
    cy.dataCy("analysis-mode-badge").should("be.visible");

    cy.dataCy("analysis-reset-all").click();

    isUnconsolidatedForm(true);
    cy.dataCy("analysis-result-card").should("not.exist");
  });

  it("asks before applying everything", () => {
    analyze("Mittelkies, feinsandig, hellgrau");

    cy.dataCy("analysis-accept-all").click();
    handlePrompt("Do you really want to apply all automatically extracted values?", "acceptValues");

    cy.dataCy("analysis-result-card").should("not.exist");
    cy.dataCy("lithologyDescriptions.0.lithologyUnconMainId-formSelect").should("not.have.class", "analysis-highlight");
  });

  it("asks before closing the modal with unaccepted values", () => {
    analyze("Mittelkies, feinsandig, hellgrau");

    cy.dataCy("apply-button").click();
    handlePrompt("Some automatically extracted values have not been accepted yet.", "cancel");

    cy.dataCy("analysis-result-card").should("be.visible");

    cy.dataCy("apply-button").click();
    handlePrompt(null, "acceptValues");
    cy.dataCy("analysis-result-card").should("not.exist");
  });

  it("reports a description it cannot classify", () => {
    stubClassification({});
    descriptionField().clear();
    descriptionField().type("keine Angabe", { delay: 0 });
    cy.dataCy("analyze-button").click();

    cy.dataCy("analysis-empty-result").contains("No classification possible.");
    isUnconsolidatedForm(true);
    cy.dataCy("analysis-result-card").should("not.exist");

    cy.dataCy("analysis-empty-result-close").click();
    cy.dataCy("analysis-empty-result").should("not.exist");
  });

  it("keeps the button disabled without a description", () => {
    descriptionField().clear();
    cy.dataCy("analyze-button").should("be.disabled");
  });
});
