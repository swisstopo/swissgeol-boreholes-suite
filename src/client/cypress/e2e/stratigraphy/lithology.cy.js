import { saveWithSaveBar } from "../helpers/buttonHelpers.js";
import {
  evaluateCheckbox,
  evaluateInput,
  evaluateMultiSelect,
  evaluateSelect,
  evaluateTextarea,
  isDisabled,
  setInput,
  setSelect,
  toggleCheckbox,
  toggleMultiSelect,
} from "../helpers/formHelpers.js";
import { navigateInStratigraphy, StratigraphyTab } from "../helpers/navigationHelpers.js";
import { handlePrompt, stopBoreholeEditing } from "../helpers/testHelpers.js";
import {
  addLithology,
  checkDepthColumn,
  checkLayerCardContent,
  closeLayerModal,
  hasLayer,
  LayerType,
  openLayer,
  openNewStratigraphy,
} from "./stratigraphyHelpers.js";

const checkHasBedding = (hasBedding, share) => {
  if (hasBedding) {
    evaluateCheckbox("hasBedding", true);
    cy.dataCy("lithologyDescriptions.1").should("exist");
    isDisabled("shareInverse");

    if (share) {
      evaluateInput("share", share);
      evaluateInput("shareInverse", 100 - share);
    }
  } else {
    evaluateCheckbox("hasBedding", false);
    evaluateInput("share", "");
    isDisabled("share");
    cy.dataCy("lithologyDescriptions.1").should("not.exist");
  }
};

export const RockType = {
  unconsolidated: "Unconsolidated rock",
  consolidated: "Consolidated rock",
};

const isUnconsolidatedForm = isUnconsolidated => {
  if (isUnconsolidated) {
    cy.contains("button", RockType.unconsolidated).should("have.class", "Mui-selected");
    cy.contains("button", RockType.consolidated).should("not.have.class", "Mui-selected");
    cy.dataCy("lithologyDescriptions.0.lithologyUnconMainId-formSelect").should("exist");
    cy.dataCy("lithologyDescriptions.0.lithologyConId-formSelect").should("not.exist");
  } else {
    cy.contains("button", RockType.unconsolidated).should("not.have.class", "Mui-selected");
    cy.contains("button", RockType.consolidated).should("have.class", "Mui-selected");
    cy.dataCy("lithologyDescriptions.0.lithologyUnconMainId-formSelect").should("not.exist");
    cy.dataCy("lithologyDescriptions.0.lithologyConId-formSelect").should("exist");
  }
};

const switchRockType = (newRockType, action) => {
  const isUnconsolidated = newRockType === RockType.unconsolidated;
  const otherRockType = isUnconsolidated ? RockType.consolidated : RockType.unconsolidated;
  cy.contains("button", newRockType).click();
  handlePrompt(
    `When switching from ${otherRockType.toLowerCase()} to ${newRockType.toLowerCase()} existing values in the form will be lost. Would you like to continue?`,
    action,
  );
  isUnconsolidatedForm((action === "Continue" && isUnconsolidated) || (action !== "Continue" && !isUnconsolidated));
};

describe("Lithology, Lithology descriptions, Facies descriptions tests", () => {
  it("adds and displays lithologies", () => {
    openNewStratigraphy();
    addLithology();

    isUnconsolidatedForm(true);
    setInput("fromDepth", 0);
    setInput("toDepth", 35);
    setSelect("lithologyDescriptions.0.lithologyUnconMainId", 9);
    setSelect("lithologyDescriptions.0.lithologyUncon2Id", 3);
    evaluateSelect("lithologyDescriptions.0.lithologyUnconMainId", "fine gravel (FGr)");
    evaluateSelect("lithologyDescriptions.0.lithologyUncon2Id", "stony / with stones (co)");
    closeLayerModal();

    checkDepthColumn([[0, 35]]);
    checkLayerCardContent(LayerType.lithology, 0, 35, ["[FGr-co]: fine gravel, stony / with stones"]);
    hasLayer(LayerType.lithologicalDescription, 0, null, true);
    hasLayer(LayerType.faciesDescription, 0, null, true);

    openLayer(LayerType.lithology, 0, 35);
    setSelect("lithologyDescriptions.0.lithologyUnconMainId", 7);
    evaluateSelect("lithologyDescriptions.0.lithologyUnconMainId", "medium gravel (MGr)");
    closeLayerModal();
    checkLayerCardContent(LayerType.lithology, 0, 35, ["[MGr-co]: medium gravel, stony / with stones"]);

    addLithology();
    isUnconsolidatedForm(true);
    evaluateInput("fromDepth", 35);
    setInput("toDepth", 79);

    checkHasBedding(false);
    toggleCheckbox("hasBedding");
    setInput("share", 70);
    checkHasBedding(true, 70);

    setSelect("lithologyDescriptions.0.lithologyUnconMainId", 2);
    setSelect("lithologyDescriptions.0.lithologyUncon2Id", 2);
    evaluateSelect("lithologyDescriptions.0.lithologyUnconMainId", "boulder (Bo)");
    evaluateSelect("lithologyDescriptions.0.lithologyUncon2Id", "blocky / with blocks (bo)");
    setSelect("lithologyDescriptions.1.lithologyUnconMainId", 3);
    setSelect("lithologyDescriptions.1.lithologyUncon2Id", 4);
    evaluateSelect("lithologyDescriptions.1.lithologyUnconMainId", "cobbles (Co)");
    evaluateSelect("lithologyDescriptions.1.lithologyUncon2Id", "gravelly (gr)");
    closeLayerModal();

    checkDepthColumn([
      [0, 35],
      [35, 79],
    ]);
    checkLayerCardContent(LayerType.lithology, 0, 35, ["[MGr-co]: medium gravel, stony / with stones"]);
    checkLayerCardContent(LayerType.lithology, 35, 79, [
      "70% [Bo-bo]: boulder, blocky / with blocks",
      "30% [Co-gr]: cobbles, gravelly",
    ]);
    hasLayer(LayerType.lithologicalDescription, 0, null, true);
    hasLayer(LayerType.lithologicalDescription, 35, null, true, false);
    hasLayer(LayerType.faciesDescription, 0, null, true);
    hasLayer(LayerType.faciesDescription, 35, null, true, false);

    addLithology();
    switchRockType(RockType.consolidated, "Continue");
    evaluateInput("fromDepth", 79);
    setInput("toDepth", 86);

    setSelect("lithologyDescriptions.0.lithologyConId", 4);
    setSelect("lithologyDescriptions.0.gradationId", 2);
    evaluateSelect("lithologyDescriptions.0.lithologyConId", "psephite");
    evaluateSelect("lithologyDescriptions.0.gradationId", "well sorted");
    closeLayerModal();

    checkDepthColumn([
      [0, 35],
      [35, 79],
      [79, 86],
    ]);
    checkLayerCardContent(LayerType.lithology, 0, 35, ["[MGr-co]: medium gravel, stony / with stones"]);
    checkLayerCardContent(LayerType.lithology, 35, 79, [
      "70% [Bo-bo]: boulder, blocky / with blocks",
      "30% [Co-gr]: cobbles, gravelly",
    ]);
    checkLayerCardContent(LayerType.lithology, 79, 86, ["psephite, well sorted"]);
    hasLayer(LayerType.lithologicalDescription, 0, null, true);
    hasLayer(LayerType.lithologicalDescription, 35, null, true, false);
    hasLayer(LayerType.lithologicalDescription, 79, null, true, false);
    hasLayer(LayerType.faciesDescription, 0, null, true);
    hasLayer(LayerType.faciesDescription, 35, null, true, false);
    hasLayer(LayerType.faciesDescription, 79, null, true, false);

    openLayer(LayerType.lithology, 79, 86);
    setSelect("lithologyDescriptions.0.lithologyConId", 5);
    evaluateSelect("lithologyDescriptions.0.lithologyConId", "breccia");
    closeLayerModal();

    checkDepthColumn([
      [0, 35],
      [35, 79],
      [79, 86],
    ]);
    checkLayerCardContent(LayerType.lithology, 0, 35, ["[MGr-co]: medium gravel, stony / with stones"]);
    checkLayerCardContent(LayerType.lithology, 35, 79, [
      "70% [Bo-bo]: boulder, blocky / with blocks",
      "30% [Co-gr]: cobbles, gravelly",
    ]);
    checkLayerCardContent(LayerType.lithology, 79, 86, ["breccia, well sorted"]);
    hasLayer(LayerType.lithologicalDescription, 0, null, true);
    hasLayer(LayerType.lithologicalDescription, 35, null, true, false);
    hasLayer(LayerType.lithologicalDescription, 79, null, true, false);
    hasLayer(LayerType.faciesDescription, 0, null, true);
    hasLayer(LayerType.faciesDescription, 35, null, true, false);
    hasLayer(LayerType.faciesDescription, 79, null, true, false);

    openLayer(LayerType.lithologicalDescription, 0, null, true);
    evaluateSelect("fromDepth", 0);
    evaluateSelect("toDepth", 86);
    setSelect("fromDepth", 0, 3);
    setSelect("toDepth", 0, 3);
    evaluateSelect("fromDepth", 0);
    evaluateSelect("toDepth", 35);
    setInput("description", "lithological description 0 - 35");
    closeLayerModal();

    checkDepthColumn([
      [0, 35],
      [35, 79],
      [79, 86],
    ]);
    checkLayerCardContent(LayerType.lithology, 0, 35, ["[MGr-co]: medium gravel, stony / with stones"]);
    checkLayerCardContent(LayerType.lithology, 35, 79, [
      "70% [Bo-bo]: boulder, blocky / with blocks",
      "30% [Co-gr]: cobbles, gravelly",
    ]);
    checkLayerCardContent(LayerType.lithology, 79, 86, ["breccia, well sorted"]);
    checkLayerCardContent(LayerType.lithologicalDescription, 0, 35, ["lithological description 0 - 35"]);
    hasLayer(LayerType.lithologicalDescription, 35, null, true);
    hasLayer(LayerType.faciesDescription, 0, null, true);
    hasLayer(LayerType.faciesDescription, 35, null, true, false);
    hasLayer(LayerType.faciesDescription, 79, null, true, false);

    openLayer(LayerType.lithologicalDescription, 35, null, true);
    evaluateSelect("fromDepth", 35);
    evaluateSelect("toDepth", 86);
    setSelect("fromDepth", 0, 2);
    setSelect("toDepth", 1, 2);
    evaluateSelect("fromDepth", 35);
    evaluateSelect("toDepth", 86);
    setInput("description", "lithological description 35 - 86");
    closeLayerModal();

    checkDepthColumn([
      [0, 35],
      [35, 79],
      [79, 86],
    ]);
    checkLayerCardContent(LayerType.lithology, 0, 35, ["[MGr-co]: medium gravel, stony / with stones"]);
    checkLayerCardContent(LayerType.lithology, 35, 79, [
      "70% [Bo-bo]: boulder, blocky / with blocks",
      "30% [Co-gr]: cobbles, gravelly",
    ]);
    checkLayerCardContent(LayerType.lithology, 79, 86, ["breccia, well sorted"]);
    checkLayerCardContent(LayerType.lithologicalDescription, 0, 35, ["lithological description 0 - 35"]);
    checkLayerCardContent(LayerType.lithologicalDescription, 35, 86, ["lithological description 35 - 86"]);
    hasLayer(LayerType.faciesDescription, 0, null, true);
    hasLayer(LayerType.faciesDescription, 35, null, true, false);
    hasLayer(LayerType.faciesDescription, 79, null, true, false);

    openLayer(LayerType.faciesDescription, 0, null, true);
    evaluateSelect("fromDepth", 0);
    evaluateSelect("toDepth", 86);
    setSelect("fromDepth", 1, 3);
    setSelect("toDepth", 2, 3);
    evaluateSelect("fromDepth", 35);
    evaluateSelect("toDepth", 86);
    setSelect("faciesId", 1);
    evaluateSelect("faciesId", "terrestrial");
    setInput("description", "facies description 35 - 86");
    closeLayerModal();

    checkDepthColumn([
      [0, 35],
      [35, 79],
      [79, 86],
    ]);
    checkLayerCardContent(LayerType.lithology, 0, 35, ["[MGr-co]: medium gravel, stony / with stones"]);
    checkLayerCardContent(LayerType.lithology, 35, 79, [
      "70% [Bo-bo]: boulder, blocky / with blocks",
      "30% [Co-gr]: cobbles, gravelly",
    ]);
    checkLayerCardContent(LayerType.lithology, 79, 86, ["breccia, well sorted"]);
    checkLayerCardContent(LayerType.lithologicalDescription, 0, 35, ["lithological description 0 - 35"]);
    checkLayerCardContent(LayerType.lithologicalDescription, 35, 86, ["lithological description 35 - 86"]);
    hasLayer(LayerType.faciesDescription, 0, null, true);
    checkLayerCardContent(LayerType.faciesDescription, 35, 86, ["terrestrial", "facies description 35 - 86"]);

    openLayer(LayerType.faciesDescription, 0, null, true);
    evaluateSelect("fromDepth", 0);
    evaluateSelect("toDepth", 35);
    setSelect("fromDepth", 0, 1);
    setSelect("toDepth", 0, 1);
    evaluateSelect("fromDepth", 0);
    evaluateSelect("toDepth", 35);
    setSelect("faciesId", 2);
    evaluateSelect("faciesId", "alluvial");
    closeLayerModal();

    checkDepthColumn([
      [0, 35],
      [35, 79],
      [79, 86],
    ]);
    checkLayerCardContent(LayerType.lithology, 0, 35, ["[MGr-co]: medium gravel, stony / with stones"]);
    checkLayerCardContent(LayerType.lithology, 35, 79, [
      "70% [Bo-bo]: boulder, blocky / with blocks",
      "30% [Co-gr]: cobbles, gravelly",
    ]);
    checkLayerCardContent(LayerType.lithology, 79, 86, ["breccia, well sorted"]);
    checkLayerCardContent(LayerType.lithologicalDescription, 0, 35, ["lithological description 0 - 35"]);
    checkLayerCardContent(LayerType.lithologicalDescription, 35, 86, ["lithological description 35 - 86"]);
    checkLayerCardContent(LayerType.faciesDescription, 0, 35, ["alluvial"]);
    checkLayerCardContent(LayerType.faciesDescription, 35, 86, ["terrestrial", "facies description 35 - 86"]);

    saveWithSaveBar();
    navigateInStratigraphy(StratigraphyTab.chronostratigraphy);
    navigateInStratigraphy(StratigraphyTab.lithology);
    checkDepthColumn([
      [0, 35],
      [35, 79],
      [79, 86],
    ]);
    checkLayerCardContent(LayerType.lithology, 0, 35, ["[MGr-co]: medium gravel, stony / with stones"]);
    checkLayerCardContent(LayerType.lithology, 35, 79, [
      "70% [Bo-bo]: boulder, blocky / with blocks",
      "30% [Co-gr]: cobbles, gravelly",
    ]);
    checkLayerCardContent(LayerType.lithology, 79, 86, ["breccia, well sorted"]);
    checkLayerCardContent(LayerType.lithologicalDescription, 0, 35, ["lithological description 0 - 35"]);
    checkLayerCardContent(LayerType.lithologicalDescription, 35, 86, ["lithological description 35 - 86"]);
    checkLayerCardContent(LayerType.faciesDescription, 0, 35, ["alluvial"]);
    checkLayerCardContent(LayerType.faciesDescription, 35, 86, ["terrestrial", "facies description 35 - 86"]);

    stopBoreholeEditing();
    checkDepthColumn([
      [0, 35],
      [35, 79],
      [79, 86],
    ]);
    checkLayerCardContent(LayerType.lithology, 0, 35, ["[MGr-co]: medium gravel, stony / with stones"]);
    checkLayerCardContent(LayerType.lithology, 35, 79, [
      "70% [Bo-bo]: boulder, blocky / with blocks",
      "30% [Co-gr]: cobbles, gravelly",
    ]);
    checkLayerCardContent(LayerType.lithology, 79, 86, ["breccia, well sorted"]);
    checkLayerCardContent(LayerType.lithologicalDescription, 0, 35, ["lithological description 0 - 35"]);
    checkLayerCardContent(LayerType.lithologicalDescription, 35, 86, ["lithological description 35 - 86"]);
    checkLayerCardContent(LayerType.faciesDescription, 0, 35, ["alluvial"]);
    checkLayerCardContent(LayerType.lithologicalDescription, 35, 86, ["terrestrial", "facies description 35 - 86"]);
  });

  it("resets form when switching between unconsolidated and consolidated rock", () => {
    openNewStratigraphy();
    addLithology();

    setInput("fromDepth", 0);
    evaluateInput("fromDepth", 0);
    setInput("toDepth", 56);
    evaluateInput("toDepth", 56);
    checkHasBedding(false);
    toggleCheckbox("hasBedding");
    setInput("share", 80);
    checkHasBedding(true, 80);

    setSelect("lithologyDescriptions.0.lithologyUnconMainId", 2);
    evaluateSelect("lithologyDescriptions.0.lithologyUnconMainId", "boulder (Bo)");
    setSelect("lithologyDescriptions.0.lithologyUncon2Id", 2);
    evaluateSelect("lithologyDescriptions.0.lithologyUncon2Id", "blocky / with blocks (bo)");
    setSelect("lithologyDescriptions.0.lithologyUncon3Id", 2);
    evaluateSelect("lithologyDescriptions.0.lithologyUncon3Id", "blocky / with blocks (bo)");
    setSelect("lithologyDescriptions.0.lithologyUncon4Id", 2);
    evaluateSelect("lithologyDescriptions.0.lithologyUncon4Id", "blocky / with blocks (bo)");
    setSelect("lithologyDescriptions.0.lithologyUncon5Id", 2);
    evaluateSelect("lithologyDescriptions.0.lithologyUncon5Id", "blocky / with blocks (bo)");
    setSelect("lithologyDescriptions.0.lithologyUncon6Id", 2);
    evaluateSelect("lithologyDescriptions.0.lithologyUncon6Id", "blocky / with blocks (bo)");
    toggleMultiSelect("lithologyDescriptions.0.componentUnconOrganicCodelistIds", [2, 3]);
    evaluateMultiSelect("lithologyDescriptions.0.componentUnconOrganicCodelistIds", [
      "humus",
      "undifferenciated organic material",
    ]);
    toggleMultiSelect("lithologyDescriptions.0.componentUnconDebrisCodelistIds", [2, 3]);
    evaluateMultiSelect("lithologyDescriptions.0.componentUnconDebrisCodelistIds", ["rubble", "bed load"]);
    setSelect("lithologyDescriptions.0.colorPrimaryId", 2);
    evaluateSelect("lithologyDescriptions.0.colorPrimaryId", "blackish grey");
    setSelect("lithologyDescriptions.0.colorSecondaryId", 2);
    evaluateSelect("lithologyDescriptions.0.colorSecondaryId", "blackish grey");
    toggleMultiSelect("lithologyDescriptions.0.grainShapeCodelistIds", [2, 3]);
    evaluateMultiSelect("lithologyDescriptions.0.grainShapeCodelistIds", ["platy", "elongated"]);
    toggleMultiSelect("lithologyDescriptions.0.grainAngularityCodelistIds", [2, 3]);
    evaluateMultiSelect("lithologyDescriptions.0.grainAngularityCodelistIds", ["angular", "sub-angular"]);
    toggleMultiSelect("lithologyDescriptions.0.lithologyUnconDebrisCodelistIds", [2, 3]);
    evaluateMultiSelect("lithologyDescriptions.0.lithologyUnconDebrisCodelistIds", [
      "rock: sedimentary",
      "rock: clastic",
    ]);
    toggleCheckbox("lithologyDescriptions.0.hasStriae");
    evaluateCheckbox("lithologyDescriptions.0.hasStriae", true);

    setSelect("lithologyDescriptions.1.lithologyUnconMainId", 3);
    evaluateSelect("lithologyDescriptions.1.lithologyUnconMainId", "cobbles (Co)");
    setSelect("lithologyDescriptions.1.lithologyUncon2Id", 3);
    evaluateSelect("lithologyDescriptions.1.lithologyUncon2Id", "stony / with stones (co)");
    setSelect("lithologyDescriptions.1.lithologyUncon3Id", 3);
    evaluateSelect("lithologyDescriptions.1.lithologyUncon3Id", "stony / with stones (co)");
    setSelect("lithologyDescriptions.1.lithologyUncon4Id", 3);
    evaluateSelect("lithologyDescriptions.1.lithologyUncon4Id", "stony / with stones (co)");
    setSelect("lithologyDescriptions.1.lithologyUncon5Id", 3);
    evaluateSelect("lithologyDescriptions.1.lithologyUncon5Id", "stony / with stones (co)");
    setSelect("lithologyDescriptions.1.lithologyUncon6Id", 3);
    evaluateSelect("lithologyDescriptions.1.lithologyUncon6Id", "stony / with stones (co)");
    toggleMultiSelect("lithologyDescriptions.1.componentUnconOrganicCodelistIds", [3, 4]);
    evaluateMultiSelect("lithologyDescriptions.1.componentUnconOrganicCodelistIds", [
      "undifferenciated organic material",
      "roots",
    ]);
    toggleMultiSelect("lithologyDescriptions.1.componentUnconDebrisCodelistIds", [3, 4]);
    evaluateMultiSelect("lithologyDescriptions.1.componentUnconDebrisCodelistIds", [
      "bed load",
      "fragments, splitters",
    ]);
    setSelect("lithologyDescriptions.1.colorPrimaryId", 3);
    evaluateSelect("lithologyDescriptions.1.colorPrimaryId", "dark grey");
    setSelect("lithologyDescriptions.1.colorSecondaryId", 3);
    evaluateSelect("lithologyDescriptions.1.colorSecondaryId", "dark grey");
    toggleMultiSelect("lithologyDescriptions.1.grainShapeCodelistIds", [3, 4]);
    evaluateMultiSelect("lithologyDescriptions.1.grainShapeCodelistIds", ["elongated", "other"]);
    toggleMultiSelect("lithologyDescriptions.1.grainAngularityCodelistIds", [3, 4]);
    evaluateMultiSelect("lithologyDescriptions.1.grainAngularityCodelistIds", ["sub-angular", "sub-rounded"]);
    toggleMultiSelect("lithologyDescriptions.1.lithologyUnconDebrisCodelistIds", [3, 4]);
    evaluateMultiSelect("lithologyDescriptions.1.lithologyUnconDebrisCodelistIds", ["rock: clastic", "psephite"]);

    setSelect("compactnessId", 2);
    evaluateSelect("compactnessId", "loose");
    setSelect("cohesionId", 2);
    evaluateSelect("cohesionId", "slightly cohesive");
    setSelect("humidityId", 2);
    evaluateSelect("humidityId", "earth-moist");
    setSelect("consistencyId", 2);
    evaluateSelect("consistencyId", "soft");
    setSelect("plasticityId", 2);
    evaluateSelect("plasticityId", "slight plasticity");
    toggleMultiSelect("uscsTypeCodelistIds", [2, 3]);
    evaluateMultiSelect("uscsTypeCodelistIds", ["lean clay", "silty clay"]);
    setSelect("uscsDeterminationId", 2);
    evaluateSelect("uscsDeterminationId", "laboratory");
    toggleMultiSelect("rockConditionCodelistIds", [2, 3]);
    evaluateMultiSelect("rockConditionCodelistIds", ["decomposed", "subsided"]);
    setSelect("alterationDegreeId", 2);
    evaluateSelect("alterationDegreeId", "weathered");
    setInput("notes", "A unconsolidated rock note.");
    evaluateTextarea("notes", "A unconsolidated rock note.");

    // Should not change form when canceling switch
    switchRockType(RockType.consolidated, "Cancel");
    evaluateInput("fromDepth", 0);
    evaluateInput("toDepth", 56);
    checkHasBedding(true, 80);
    evaluateSelect("lithologyDescriptions.0.lithologyUnconMainId", "boulder (Bo)");
    evaluateSelect("lithologyDescriptions.0.lithologyUncon2Id", "blocky / with blocks (bo)");
    evaluateSelect("lithologyDescriptions.0.lithologyUncon3Id", "blocky / with blocks (bo)");
    evaluateSelect("lithologyDescriptions.0.lithologyUncon4Id", "blocky / with blocks (bo)");
    evaluateSelect("lithologyDescriptions.0.lithologyUncon5Id", "blocky / with blocks (bo)");
    evaluateSelect("lithologyDescriptions.0.lithologyUncon6Id", "blocky / with blocks (bo)");
    evaluateMultiSelect("lithologyDescriptions.0.componentUnconOrganicCodelistIds", [
      "humus",
      "undifferenciated organic material",
    ]);
    evaluateMultiSelect("lithologyDescriptions.0.componentUnconDebrisCodelistIds", ["rubble", "bed load"]);
    evaluateSelect("lithologyDescriptions.0.colorPrimaryId", "blackish grey");
    evaluateSelect("lithologyDescriptions.0.colorSecondaryId", "blackish grey");
    evaluateMultiSelect("lithologyDescriptions.0.grainShapeCodelistIds", ["platy", "elongated"]);
    evaluateMultiSelect("lithologyDescriptions.0.grainAngularityCodelistIds", ["angular", "sub-angular"]);
    evaluateMultiSelect("lithologyDescriptions.0.lithologyUnconDebrisCodelistIds", [
      "rock: sedimentary",
      "rock: clastic",
    ]);
    evaluateCheckbox("lithologyDescriptions.0.hasStriae", true);

    evaluateSelect("lithologyDescriptions.1.lithologyUnconMainId", "cobbles (Co)");
    evaluateSelect("lithologyDescriptions.1.lithologyUncon2Id", "stony / with stones (co)");
    evaluateSelect("lithologyDescriptions.1.lithologyUncon3Id", "stony / with stones (co)");
    evaluateSelect("lithologyDescriptions.1.lithologyUncon4Id", "stony / with stones (co)");
    evaluateSelect("lithologyDescriptions.1.lithologyUncon5Id", "stony / with stones (co)");
    evaluateSelect("lithologyDescriptions.1.lithologyUncon6Id", "stony / with stones (co)");
    evaluateMultiSelect("lithologyDescriptions.1.componentUnconOrganicCodelistIds", [
      "undifferenciated organic material",
      "roots",
    ]);
    evaluateMultiSelect("lithologyDescriptions.1.componentUnconDebrisCodelistIds", [
      "bed load",
      "fragments, splitters",
    ]);
    evaluateSelect("lithologyDescriptions.1.colorPrimaryId", "dark grey");
    evaluateSelect("lithologyDescriptions.1.colorSecondaryId", "dark grey");
    evaluateMultiSelect("lithologyDescriptions.1.grainShapeCodelistIds", ["elongated", "other"]);
    evaluateMultiSelect("lithologyDescriptions.1.grainAngularityCodelistIds", ["sub-angular", "sub-rounded"]);
    evaluateMultiSelect("lithologyDescriptions.1.lithologyUnconDebrisCodelistIds", ["rock: clastic", "psephite"]);

    evaluateSelect("compactnessId", "loose");
    evaluateSelect("cohesionId", "slightly cohesive");
    evaluateSelect("humidityId", "earth-moist");
    evaluateSelect("consistencyId", "soft");
    evaluateSelect("plasticityId", "slight plasticity");
    evaluateMultiSelect("uscsTypeCodelistIds", ["lean clay", "silty clay"]);
    evaluateSelect("uscsDeterminationId", "laboratory");
    evaluateMultiSelect("rockConditionCodelistIds", ["decomposed", "subsided"]);
    evaluateSelect("alterationDegreeId", "weathered");
    evaluateTextarea("notes", "A unconsolidated rock note.");

    // Should reset form when continuing with switch
    switchRockType(RockType.consolidated, "Continue");
    evaluateInput("fromDepth", 0);
    evaluateInput("toDepth", 56);
    checkHasBedding(false);

    switchRockType(RockType.unconsolidated, "Continue");
    evaluateInput("fromDepth", 0);
    evaluateInput("toDepth", 56);
    checkHasBedding(false);
    evaluateSelect("lithologyDescriptions.0.lithologyUnconMainId", "");
    evaluateSelect("lithologyDescriptions.0.lithologyUncon2Id", "");
    evaluateSelect("lithologyDescriptions.0.lithologyUncon3Id", "");
    evaluateSelect("lithologyDescriptions.0.lithologyUncon4Id", "");
    evaluateSelect("lithologyDescriptions.0.lithologyUncon5Id", "");
    evaluateSelect("lithologyDescriptions.0.lithologyUncon6Id", "");
    evaluateMultiSelect("lithologyDescriptions.0.componentUnconOrganicCodelistIds", []);
    evaluateMultiSelect("lithologyDescriptions.0.componentUnconDebrisCodelistIds", []);
    evaluateSelect("lithologyDescriptions.0.colorPrimaryId", "");
    evaluateSelect("lithologyDescriptions.0.colorSecondaryId", "");
    evaluateMultiSelect("lithologyDescriptions.0.grainShapeCodelistIds", []);
    evaluateMultiSelect("lithologyDescriptions.0.grainAngularityCodelistIds", []);
    evaluateMultiSelect("lithologyDescriptions.0.lithologyUnconDebrisCodelistIds", []);
    evaluateCheckbox("lithologyDescriptions.0.hasStriae", false);

    evaluateSelect("compactnessId", "");
    evaluateSelect("cohesionId", "");
    evaluateSelect("humidityId", "");
    evaluateSelect("consistencyId", "");
    evaluateSelect("plasticityId", "");
    evaluateMultiSelect("uscsTypeCodelistIds", []);
    evaluateSelect("uscsDeterminationId", "");
    evaluateMultiSelect("rockConditionCodelistIds", []);
    evaluateSelect("alterationDegreeId", "");
    evaluateTextarea("notes", "");

    switchRockType(RockType.consolidated, "Continue");
    evaluateInput("fromDepth", 0);
    evaluateInput("toDepth", 56);
    checkHasBedding(false);

    toggleCheckbox("hasBedding");
    setInput("share", 65);
    checkHasBedding(true, 65);

    setSelect("lithologyDescriptions.0.lithologyConId", 1);
    evaluateSelect("lithologyDescriptions.0.lithologyConId", "rock");
    setSelect("lithologyDescriptions.0.colorPrimaryId", 1);
    evaluateSelect("lithologyDescriptions.0.colorPrimaryId", "black");
    setSelect("lithologyDescriptions.0.colorSecondaryId", 1);
    evaluateSelect("lithologyDescriptions.0.colorSecondaryId", "black");
    toggleMultiSelect("lithologyDescriptions.0.componentConParticleCodelistIds", [1, 2]);
    evaluateMultiSelect("lithologyDescriptions.0.componentConParticleCodelistIds", ["algae", "algal mats"]);
    toggleMultiSelect("lithologyDescriptions.0.componentConMineralCodelistIds", [1, 2]);
    evaluateMultiSelect("lithologyDescriptions.0.componentConMineralCodelistIds", ["actinolite", "adularia"]);
    setSelect("lithologyDescriptions.0.grainSizeId", 1);
    evaluateSelect("lithologyDescriptions.0.grainSizeId", "very fine");
    setSelect("lithologyDescriptions.0.grainAngularityId", 1);
    evaluateSelect("lithologyDescriptions.0.grainAngularityId", "very angular");
    setSelect("lithologyDescriptions.0.gradationId", 1);
    evaluateSelect("lithologyDescriptions.0.gradationId", "very well-sorted");
    setSelect("lithologyDescriptions.0.cementationId", 1);
    evaluateSelect("lithologyDescriptions.0.cementationId", "uncemented");
    toggleMultiSelect("lithologyDescriptions.0.structureSynGenCodelistIds", [1, 2]);
    evaluateMultiSelect("lithologyDescriptions.0.structureSynGenCodelistIds", ["structureless", "nodular"]);
    toggleMultiSelect("lithologyDescriptions.0.structurePostGenCodelistIds", [1, 2]);
    evaluateMultiSelect("lithologyDescriptions.0.structurePostGenCodelistIds", [
      "birdseye structure",
      "fenestral structure",
    ]);
    setSelect("lithologyDescriptions.1.lithologyConId", 1);
    evaluateSelect("lithologyDescriptions.1.lithologyConId", "rock");
    setSelect("lithologyDescriptions.1.colorPrimaryId", 1);
    evaluateSelect("lithologyDescriptions.1.colorPrimaryId", "black");
    setSelect("lithologyDescriptions.1.colorSecondaryId", 1);
    evaluateSelect("lithologyDescriptions.1.colorSecondaryId", "black");
    toggleMultiSelect("lithologyDescriptions.1.componentConParticleCodelistIds", [2, 3]);
    evaluateMultiSelect("lithologyDescriptions.1.componentConParticleCodelistIds", ["algal mats", "ammonites"]);
    toggleMultiSelect("lithologyDescriptions.1.componentConMineralCodelistIds", [2, 3]);
    evaluateMultiSelect("lithologyDescriptions.1.componentConMineralCodelistIds", ["adularia", "albite"]);
    setSelect("lithologyDescriptions.1.grainSizeId", 1);
    evaluateSelect("lithologyDescriptions.1.grainSizeId", "very fine");
    setSelect("lithologyDescriptions.1.grainAngularityId", 1);
    evaluateSelect("lithologyDescriptions.1.grainAngularityId", "very angular");
    setSelect("lithologyDescriptions.1.gradationId", 1);
    evaluateSelect("lithologyDescriptions.1.gradationId", "very well-sorted");
    setSelect("lithologyDescriptions.1.cementationId", 1);
    evaluateSelect("lithologyDescriptions.1.cementationId", "uncemented");
    toggleMultiSelect("lithologyDescriptions.1.structureSynGenCodelistIds", [2, 3]);
    evaluateMultiSelect("lithologyDescriptions.1.structureSynGenCodelistIds", ["nodular", "varves"]);
    toggleMultiSelect("lithologyDescriptions.1.structurePostGenCodelistIds", [2, 3]);
    evaluateMultiSelect("lithologyDescriptions.1.structurePostGenCodelistIds", [
      "fenestral structure",
      "keystone vugs",
    ]);

    toggleMultiSelect("textureMetaCodelistIds", [1, 2]);
    evaluateMultiSelect("textureMetaCodelistIds", ["massive", "layered"]);
    setSelect("alterationDegreeId", 1);
    evaluateSelect("alterationDegreeId", "fresh");

    setInput("notes", "A consolidated rock note.");
    evaluateTextarea("notes", "A consolidated rock note.");

    switchRockType(RockType.unconsolidated, "Cancel");
    evaluateInput("fromDepth", 0);
    evaluateInput("toDepth", 56);
    checkHasBedding(true, 65);
    evaluateSelect("lithologyDescriptions.0.lithologyConId", "rock");
    evaluateSelect("lithologyDescriptions.0.colorPrimaryId", "black");
    evaluateSelect("lithologyDescriptions.0.colorSecondaryId", "black");
    evaluateMultiSelect("lithologyDescriptions.0.componentConParticleCodelistIds", ["algae", "algal mats"]);
    evaluateMultiSelect("lithologyDescriptions.0.componentConMineralCodelistIds", ["actinolite", "adularia"]);
    evaluateSelect("lithologyDescriptions.0.grainSizeId", "very fine");
    evaluateSelect("lithologyDescriptions.0.grainAngularityId", "very angular");
    evaluateSelect("lithologyDescriptions.0.gradationId", "very well-sorted");
    evaluateSelect("lithologyDescriptions.0.cementationId", "uncemented");
    evaluateMultiSelect("lithologyDescriptions.0.structureSynGenCodelistIds", ["structureless", "nodular"]);
    evaluateMultiSelect("lithologyDescriptions.0.structurePostGenCodelistIds", [
      "birdseye structure",
      "fenestral structure",
    ]);
    evaluateSelect("lithologyDescriptions.1.lithologyConId", "rock");
    evaluateSelect("lithologyDescriptions.1.colorPrimaryId", "black");
    evaluateSelect("lithologyDescriptions.1.colorSecondaryId", "black");
    evaluateMultiSelect("lithologyDescriptions.1.componentConParticleCodelistIds", ["algal mats", "ammonites"]);
    evaluateMultiSelect("lithologyDescriptions.1.componentConMineralCodelistIds", ["adularia", "albite"]);
    evaluateSelect("lithologyDescriptions.1.grainSizeId", "very fine");
    evaluateSelect("lithologyDescriptions.1.grainAngularityId", "very angular");
    evaluateSelect("lithologyDescriptions.1.gradationId", "very well-sorted");
    evaluateSelect("lithologyDescriptions.1.cementationId", "uncemented");
    evaluateMultiSelect("lithologyDescriptions.1.structureSynGenCodelistIds", ["nodular", "varves"]);
    evaluateMultiSelect("lithologyDescriptions.1.structurePostGenCodelistIds", [
      "fenestral structure",
      "keystone vugs",
    ]);

    evaluateMultiSelect("textureMetaCodelistIds", ["massive", "layered"]);
    evaluateSelect("alterationDegreeId", "fresh");
    evaluateTextarea("notes", "A consolidated rock note.");

    switchRockType(RockType.unconsolidated, "Continue");
    evaluateInput("fromDepth", 0);
    evaluateInput("toDepth", 56);
    checkHasBedding(false);

    switchRockType(RockType.consolidated, "Continue");
    evaluateInput("fromDepth", 0);
    evaluateInput("toDepth", 56);
    checkHasBedding(false);
    evaluateSelect("lithologyDescriptions.0.lithologyConId", "");
    evaluateSelect("lithologyDescriptions.0.colorPrimaryId", "");
    evaluateSelect("lithologyDescriptions.0.colorSecondaryId", "");
    evaluateMultiSelect("lithologyDescriptions.0.componentConParticleCodelistIds", []);
    evaluateMultiSelect("lithologyDescriptions.0.componentConMineralCodelistIds", []);
    evaluateSelect("lithologyDescriptions.0.grainSizeId", "");
    evaluateSelect("lithologyDescriptions.0.grainAngularityId", "");
    evaluateSelect("lithologyDescriptions.0.gradationId", "");
    evaluateSelect("lithologyDescriptions.0.cementationId", "");
    evaluateMultiSelect("lithologyDescriptions.0.structureSynGenCodelistIds", []);
    evaluateMultiSelect("lithologyDescriptions.0.structurePostGenCodelistIds", []);

    evaluateMultiSelect("textureMetaCodelistIds", []);
    evaluateSelect("alterationDegreeId", "");
    evaluateTextarea("notes", "");
  });

  it("adds and displays facies description", () => {
    openNewStratigraphy();
    addLithology();
    setInput("fromDepth", 1);
    setInput("toDepth", 134);
    setSelect("lithologyDescriptions.0.lithologyUnconMainId", 2);
    setSelect("lithologyDescriptions.0.lithologyUncon2Id", 5);
    evaluateSelect("lithologyDescriptions.0.lithologyUnconMainId", "boulder (Bo)");
    evaluateSelect("lithologyDescriptions.0.lithologyUncon2Id", "fine gravelly (fgr)");
    closeLayerModal();
    openLayer(LayerType.faciesDescription, 1, null, true);
    setSelect("faciesId", 1);
    evaluateSelect("faciesId", "terrestrial");
    closeLayerModal();
    saveWithSaveBar();
    stopBoreholeEditing();
    checkLayerCardContent(LayerType.faciesDescription, 1, 134, ["terrestrial"]);
  });
});
