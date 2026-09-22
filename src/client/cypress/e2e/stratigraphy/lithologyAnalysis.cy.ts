import { evaluateSelect } from "../helpers/formHelpers";
import { createStratigraphyWith3Lithologies, handlePrompt } from "../helpers/testHelpers";
import { isUnconsolidatedForm } from "./lithologyHelpers";
import { LayerType, openLayer } from "./stratigraphyHelpers";

// The classification is served from a client side mock until the data extraction service releases
// POST /api/V1/classify, and the mock picks its fixture from the description text. Once the
// endpoint ships, add cy.intercept("POST", "dataextraction/api/V1/classify", ...) in beforeEach and
// keep every assertion below.
const descriptionField = () => cy.dataCy("lithology-lithological-description").find("textarea").first();

const analyze = (description: string) => {
  descriptionField().clear();
  descriptionField().type(description);
  cy.dataCy("analyze-description-button").click();
  cy.dataCy("analysis-result-card").should("be.visible");
};

describe("Lithology automatic classification", () => {
  beforeEach(() => {
    createStratigraphyWith3Lithologies();
    openLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
  });

  it("fills the fields, highlights them and documents the changes", () => {
    analyze("Mittelkies, gut gerundet, feinsandig, schwach siltig, hellgrau");

    evaluateSelect("lithologyDescriptions.0.lithologyUnconMainId", "medium gravel (MGr)");
    cy.dataCy("lithologyDescriptions.0.lithologyUnconMainId-formSelect").should("have.class", "analysis-highlight");
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
    descriptionField().clear();
    descriptionField().type("keine Angabe");
    cy.dataCy("analyze-description-button").click();

    isUnconsolidatedForm(null);
    cy.dataCy("analysis-mode-change").should("be.visible");
  });

  it("keeps the button disabled without a description", () => {
    descriptionField().clear();
    cy.dataCy("analyze-description-button").should("be.disabled");
  });
});
