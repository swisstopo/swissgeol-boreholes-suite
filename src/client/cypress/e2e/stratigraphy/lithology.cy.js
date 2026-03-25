import { saveForm, saveWithSaveBar, verifyUnsavedChanges } from "../helpers/buttonHelpers.js";
import { evaluateInput, evaluateSelect, setInput, setSelect } from "../helpers/formHelpers.js";
import { stopBoreholeEditing } from "../helpers/testHelpers.js";
import {
  evaluateConsolidatedLithologyForm,
  evaluateFaciesDescriptionForm,
  evaluateLithologicalDescriptionForm,
  evaluateUnconsolidatedLithologyForm,
  fillConsolidatedLithologyForm,
  fillFaciesDescriptionForm,
  fillLithologicalDescriptionForm,
  fillUnconsolidatedLithologyForm,
  isUnconsolidatedForm,
  RockType,
  switchRockType,
} from "./lithologyHelpers.js";
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

const openStratigraphyWith3Lithologies = () => {
  openNewStratigraphy();
  addLithology();
  fillUnconsolidatedLithologyForm({
    fromDepth: 0,
    toDepth: 355,
  });
  closeLayerModal();
  addLithology();
  fillUnconsolidatedLithologyForm({
    fromDepth: 355,
    toDepth: 798,
  });
  closeLayerModal();
  addLithology();
  fillUnconsolidatedLithologyForm({
    fromDepth: 798,
    toDepth: 1123,
  });
  closeLayerModal();

  checkDepthColumn([
    [0, 355],
    [355, 798],
    [798, 1123],
  ]);
  hasLayer(LayerType.lithology, 0, 355);
  hasLayer(LayerType.lithology, 355, 798);
  hasLayer(LayerType.lithology, 798, 1123);
  hasLayer(LayerType.lithologicalDescription, 0, null, true);
  hasLayer(LayerType.lithologicalDescription, 355, null, true, false);
  hasLayer(LayerType.lithologicalDescription, 798, null, true, false);
  hasLayer(LayerType.faciesDescription, 0, null, true);
  hasLayer(LayerType.faciesDescription, 355, null, true, false);
  hasLayer(LayerType.faciesDescription, 798, null, true, false);
};

describe("Lithology, Lithology descriptions, Facies descriptions tests", () => {
  it("adds, updates and displays lithologies", () => {
    openNewStratigraphy();

    // Add unconsolidated lithology with one lithology description
    addLithology();
    isUnconsolidatedForm(true);
    fillUnconsolidatedLithologyForm({
      fromDepth: 0,
      toDepth: 355,
      lithologyDescriptions: [{ lithologyUnconMainId: 9, lithologyUncon2Id: 3 }],
    });
    evaluateUnconsolidatedLithologyForm({
      lithologyDescriptions: [
        { lithologyUnconMainId: "fine gravel (FGr)", lithologyUncon2Id: "stony / with stones (co)" },
      ],
    });
    closeLayerModal();
    verifyUnsavedChanges();

    checkDepthColumn([[0, 355]]);
    checkLayerCardContent(LayerType.lithology, 0, 355, ["[FGr-co]: fine gravel, stony / with stones"]);
    hasLayer(LayerType.lithologicalDescription, 0, null, true);
    hasLayer(LayerType.faciesDescription, 0, null, true);

    // Edit unconsolidated lithology and check that changes are applied
    openLayer(LayerType.lithology, 0, 355);
    setSelect("lithologyDescriptions.0.lithologyUnconMainId", 7);
    evaluateSelect("lithologyDescriptions.0.lithologyUnconMainId", "medium gravel (MGr)");
    closeLayerModal();
    checkLayerCardContent(LayerType.lithology, 0, 355, ["[MGr-co]: medium gravel, stony / with stones"]);

    // Add consolidated lithology
    addLithology();
    isUnconsolidatedForm(true);
    switchRockType(RockType.consolidated, "Continue");
    evaluateInput("fromDepth", 798);
    fillConsolidatedLithologyForm({
      toDepth: 1123,
      lithologyDescriptions: [{ lithologyConId: 4, gradationId: 2 }],
    });
    evaluateConsolidatedLithologyForm({
      fromDepth: 798,
      toDepth: 1123,
      lithologyDescriptions: [{ lithologyConId: "psephite", gradationId: "well sorted" }],
    });
    closeLayerModal();

    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    checkLayerCardContent(LayerType.lithology, 0, 355, ["[MGr-co]: medium gravel, stony / with stones"]);
    hasLayer(LayerType.lithology, 355, null, true);
    checkLayerCardContent(LayerType.lithology, 798, 1123, ["psephite, well sorted"]);
    hasLayer(LayerType.lithologicalDescription, 0, null, true);
    hasLayer(LayerType.lithologicalDescription, 355, null, true, false);
    hasLayer(LayerType.lithologicalDescription, 798, null, true, false);
    hasLayer(LayerType.faciesDescription, 0, null, true);
    hasLayer(LayerType.faciesDescription, 355, null, true, false);
    hasLayer(LayerType.faciesDescription, 798, null, true, false);

    // Edit consolidated lithology and check that changes are applied
    openLayer(LayerType.lithology, 798, 1123);
    setSelect("lithologyDescriptions.0.lithologyConId", 5);
    evaluateSelect("lithologyDescriptions.0.lithologyConId", "breccia");
    closeLayerModal();

    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    checkLayerCardContent(LayerType.lithology, 0, 355, ["[MGr-co]: medium gravel, stony / with stones"]);
    hasLayer(LayerType.lithology, 355, null, true);
    checkLayerCardContent(LayerType.lithology, 798, 1123, ["breccia, well sorted"]);
    hasLayer(LayerType.lithologicalDescription, 0, null, true);
    hasLayer(LayerType.lithologicalDescription, 355, null, true, false);
    hasLayer(LayerType.lithologicalDescription, 798, null, true, false);
    hasLayer(LayerType.faciesDescription, 0, null, true);
    hasLayer(LayerType.faciesDescription, 355, null, true, false);
    hasLayer(LayerType.faciesDescription, 798, null, true, false);

    // Cannot save if there's a gap in the lithology column
    saveForm();
    cy.get(".MuiAlert-message").should(
      "contain",
      "There are gaps or overlaps in the lithology. Please resolve the issues before saving.",
    );

    verifyUnsavedChanges();

    openLayer(LayerType.lithology, 355, null, true);
    // Inherits rock type from previous layer, so form should be unconsolidated
    isUnconsolidatedForm(true);
    evaluateInput("fromDepth", 355);
    evaluateInput("toDepth", 798);
    fillUnconsolidatedLithologyForm({
      lithologyDescriptions: [{ lithologyUnconMainId: 3 }],
    });
    evaluateUnconsolidatedLithologyForm({
      lithologyDescriptions: [{ lithologyUnconMainId: "cobbles (Co)" }],
    });
    closeLayerModal();

    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    checkLayerCardContent(LayerType.lithology, 0, 355, ["[MGr-co]: medium gravel, stony / with stones"]);
    checkLayerCardContent(LayerType.lithology, 355, 798, ["[Co]: cobbles"]);
    checkLayerCardContent(LayerType.lithology, 798, 1123, ["breccia, well sorted"]);
    hasLayer(LayerType.lithologicalDescription, 0, null, true);
    hasLayer(LayerType.lithologicalDescription, 355, null, true, false);
    hasLayer(LayerType.lithologicalDescription, 798, null, true, false);
    hasLayer(LayerType.faciesDescription, 0, null, true);
    hasLayer(LayerType.faciesDescription, 355, null, true, false);
    hasLayer(LayerType.faciesDescription, 798, null, true, false);

    // Can save after filling gap, even if lithological descriptions and facies descriptions are missing
    saveWithSaveBar();

    stopBoreholeEditing();
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    checkLayerCardContent(LayerType.lithology, 0, 355, ["[MGr-co]: medium gravel, stony / with stones"]);
    checkLayerCardContent(LayerType.lithology, 355, 798, ["[Co]: cobbles"]);
    checkLayerCardContent(LayerType.lithology, 798, 1123, ["breccia, well sorted"]);
    hasLayer(LayerType.lithologicalDescription, 0, null, true);
    hasLayer(LayerType.lithologicalDescription, 355, null, true, false);
    hasLayer(LayerType.lithologicalDescription, 798, null, true, false);
    hasLayer(LayerType.faciesDescription, 0, null, true);
    hasLayer(LayerType.faciesDescription, 355, null, true, false);
    hasLayer(LayerType.faciesDescription, 798, null, true, false);
  });

  it("adds, updates and displays lithological descriptions", () => {
    openStratigraphyWith3Lithologies();

    // Add lithological description from gap and check that it has the correct depth range
    openLayer(LayerType.lithologicalDescription, 0, null, true);
    evaluateLithologicalDescriptionForm({ fromDepth: 0, toDepth: 1123 });
    fillLithologicalDescriptionForm({ fromDepth: 0, fromDepthExpected: 3, toDepth: 0, toDepthExpected: 3 });
    evaluateLithologicalDescriptionForm({ fromDepth: 0, toDepth: 355 });
    closeLayerModal();

    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer(LayerType.lithology, 0, 355);
    hasLayer(LayerType.lithology, 355, 798);
    hasLayer(LayerType.lithology, 798, 1123);
    hasLayer(LayerType.lithologicalDescription, 0, 355);
    hasLayer(LayerType.lithologicalDescription, 355, null, true);
    hasLayer(LayerType.faciesDescription, 0, null, true);
    hasLayer(LayerType.faciesDescription, 355, null, true, false);
    hasLayer(LayerType.faciesDescription, 798, null, true, false);

    // Edit lithological description and check that changes are applied
    openLayer(LayerType.lithologicalDescription, 0, 355);
    evaluateLithologicalDescriptionForm({ fromDepth: 0, toDepth: 355 });
    fillLithologicalDescriptionForm({ description: "lithological description 0 - 355" });
    evaluateLithologicalDescriptionForm({
      fromDepth: 0,
      toDepth: 355,
      description: "lithological description 0 - 355",
    });
    closeLayerModal();

    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer(LayerType.lithology, 0, 355);
    hasLayer(LayerType.lithology, 355, 798);
    hasLayer(LayerType.lithology, 798, 1123);
    checkLayerCardContent(LayerType.lithologicalDescription, 0, 355, ["lithological description 0 - 355"]);
    hasLayer(LayerType.lithologicalDescription, 355, null, true);
    hasLayer(LayerType.faciesDescription, 0, null, true);
    hasLayer(LayerType.faciesDescription, 355, null, true, false);
    hasLayer(LayerType.faciesDescription, 798, null, true, false);

    // Add lithological description from remaining gap and check that it has the correct depth range
    openLayer(LayerType.lithologicalDescription, 355, null, true);
    evaluateLithologicalDescriptionForm({ fromDepth: 355, toDepth: 1123 });
    fillLithologicalDescriptionForm({
      fromDepth: 0,
      fromDepthExpected: 2,
      toDepth: 1,
      toDepthExpected: 2,
      description: "lithological description 355 - 1123",
    });
    evaluateLithologicalDescriptionForm({ fromDepth: 355, toDepth: 1123 });
    closeLayerModal();

    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer(LayerType.lithology, 0, 355);
    hasLayer(LayerType.lithology, 355, 798);
    hasLayer(LayerType.lithology, 798, 1123);
    checkLayerCardContent(LayerType.lithologicalDescription, 0, 355, ["lithological description 0 - 355"]);
    checkLayerCardContent(LayerType.lithologicalDescription, 355, 1123, ["lithological description 355 - 1123"]);
    hasLayer(LayerType.faciesDescription, 0, null, true);
    hasLayer(LayerType.faciesDescription, 355, null, true, false);
    hasLayer(LayerType.faciesDescription, 798, null, true, false);

    saveWithSaveBar();
    stopBoreholeEditing();
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer(LayerType.lithology, 0, 355);
    hasLayer(LayerType.lithology, 355, 798);
    hasLayer(LayerType.lithology, 798, 1123);
    checkLayerCardContent(LayerType.lithologicalDescription, 0, 355, ["lithological description 0 - 355"]);
    checkLayerCardContent(LayerType.lithologicalDescription, 355, 1123, ["lithological description 355 - 1123"]);
    checkLayerCardContent(LayerType.faciesDescription, 0, 355, ["alluvial"]);
    checkLayerCardContent(LayerType.faciesDescription, 355, 1123, ["alluvial fan", "facies description 355 - 1123"]);
  });

  it("adds, updates and displays facies descriptions", () => {
    openStratigraphyWith3Lithologies();

    // Add facies description from gap and check that it has the correct depth range
    openLayer(LayerType.faciesDescription, 0, null, true);
    evaluateFaciesDescriptionForm({ fromDepth: 0, toDepth: 1123 });
    fillFaciesDescriptionForm({
      fromDepth: 1,
      fromDepthExpected: 3,
      toDepth: 2,
      toDepthExpected: 3,
      faciesId: 1,
      description: "facies description 355 - 1123",
    });
    evaluateFaciesDescriptionForm({ fromDepth: 355, toDepth: 1123, faciesId: "terrestrial" });
    closeLayerModal();

    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer(LayerType.lithology, 0, 355);
    hasLayer(LayerType.lithology, 355, 798);
    hasLayer(LayerType.lithology, 798, 1123);
    hasLayer(LayerType.lithologicalDescription, 0, null, true);
    hasLayer(LayerType.lithologicalDescription, 355, null, true, false);
    hasLayer(LayerType.lithologicalDescription, 798, null, true, false);
    hasLayer(LayerType.faciesDescription, 0, null, true);
    checkLayerCardContent(LayerType.faciesDescription, 355, 1123, ["terrestrial", "facies description 355 - 1123"]);

    // Edit facies description and check that changes are applied
    openLayer(LayerType.faciesDescription, 355, 1123);
    evaluateFaciesDescriptionForm({
      fromDepth: 355,
      toDepth: 1123,
      faciesId: "terrestrial",
      description: "facies description 355 - 1123",
    });
    fillFaciesDescriptionForm({ faciesId: 3 });
    evaluateFaciesDescriptionForm({
      fromDepth: 355,
      toDepth: 1123,
      faciesId: "alluvial fan",
      description: "facies description 355 - 1123",
    });
    closeLayerModal();

    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer(LayerType.lithology, 0, 355);
    hasLayer(LayerType.lithology, 355, 798);
    hasLayer(LayerType.lithology, 798, 1123);
    hasLayer(LayerType.lithologicalDescription, 0, null, true);
    hasLayer(LayerType.lithologicalDescription, 355, null, true, false);
    hasLayer(LayerType.lithologicalDescription, 798, null, true, false);
    hasLayer(LayerType.faciesDescription, 0, null, true);
    checkLayerCardContent(LayerType.faciesDescription, 355, 1123, ["alluvial fan", "facies description 355 - 1123"]);

    // Add facies description from remaining gap and check that it has the correct depth range
    openLayer(LayerType.faciesDescription, 0, null, true);
    evaluateFaciesDescriptionForm({ fromDepth: 0, toDepth: 355 });
    fillFaciesDescriptionForm({ fromDepth: 0, fromDepthExpected: 1, toDepth: 0, toDepthExpected: 1, faciesId: 2 });
    evaluateFaciesDescriptionForm({ fromDepth: 0, toDepth: 355, faciesId: "alluvial" });
    closeLayerModal();

    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer(LayerType.lithology, 0, 355);
    hasLayer(LayerType.lithology, 355, 798);
    hasLayer(LayerType.lithology, 798, 1123);
    hasLayer(LayerType.lithologicalDescription, 0, null, true);
    hasLayer(LayerType.lithologicalDescription, 355, null, true, false);
    hasLayer(LayerType.lithologicalDescription, 798, null, true, false);
    checkLayerCardContent(LayerType.faciesDescription, 0, 355, ["alluvial"]);
    checkLayerCardContent(LayerType.faciesDescription, 355, 1123, ["alluvial fan", "facies description 355 - 1123"]);

    saveWithSaveBar();
    stopBoreholeEditing();
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer(LayerType.lithology, 0, 355);
    hasLayer(LayerType.lithology, 355, 798);
    hasLayer(LayerType.lithology, 798, 1123);
    hasLayer(LayerType.lithologicalDescription, 0, null, true);
    hasLayer(LayerType.lithologicalDescription, 355, null, true, false);
    hasLayer(LayerType.lithologicalDescription, 798, null, true, false);
    checkLayerCardContent(LayerType.faciesDescription, 0, 355, ["alluvial"]);
    checkLayerCardContent(LayerType.faciesDescription, 355, 1123, ["alluvial fan", "facies description 355 - 1123"]);
  });

  it("resets form when switching between unconsolidated and consolidated rock", () => {
    openNewStratigraphy();
    addLithology();

    fillUnconsolidatedLithologyForm({
      fromDepth: 0,
      toDepth: 56,
      hasBedding: true,
      share: 80,
      lithologyDescriptions: [
        {
          lithologyUnconMainId: 2,
          lithologyUncon2Id: 2,
          lithologyUncon3Id: 2,
          lithologyUncon4Id: 2,
          lithologyUncon5Id: 2,
          lithologyUncon6Id: 2,
          componentUnconOrganicCodelistIds: [2, 3],
          componentUnconDebrisCodelistIds: [2, 3],
          colorPrimaryId: 2,
          colorSecondaryId: 2,
          grainShapeCodelistIds: [2, 3],
          grainAngularityCodelistIds: [2, 3],
          lithologyUnconDebrisCodelistIds: [2, 3],
          hasStriae: true,
        },
        {
          lithologyUnconMainId: 3,
          lithologyUncon2Id: 3,
          lithologyUncon3Id: 3,
          lithologyUncon4Id: 3,
          lithologyUncon5Id: 3,
          lithologyUncon6Id: 3,
          componentUnconOrganicCodelistIds: [3, 4],
          componentUnconDebrisCodelistIds: [3, 4],
          colorPrimaryId: 3,
          colorSecondaryId: 3,
          grainShapeCodelistIds: [3, 4],
          grainAngularityCodelistIds: [3, 4],
          lithologyUnconDebrisCodelistIds: [3, 4],
        },
      ],
      compactnessId: 2,
      cohesionId: 2,
      humidityId: 2,
      consistencyId: 2,
      plasticityId: 2,
      uscsTypeCodelistIds: [2, 3],
      uscsDeterminationId: 2,
      rockConditionCodelistIds: [2, 3],
      alterationDegreeId: 2,
      notes: "A unconsolidated rock note.",
    });
    evaluateUnconsolidatedLithologyForm({
      fromDepth: 0,
      toDepth: 56,
      hasBedding: true,
      share: 80,
      lithologyDescriptions: [
        {
          lithologyUnconMainId: "boulder (Bo)",
          lithologyUncon2Id: "blocky / with blocks (bo)",
          lithologyUncon3Id: "blocky / with blocks (bo)",
          lithologyUncon4Id: "blocky / with blocks (bo)",
          lithologyUncon5Id: "blocky / with blocks (bo)",
          lithologyUncon6Id: "blocky / with blocks (bo)",
          componentUnconOrganicCodelistIds: ["humus", "undifferenciated organic material"],
          componentUnconDebrisCodelistIds: ["rubble", "bed load"],
          colorPrimaryId: "blackish grey",
          colorSecondaryId: "blackish grey",
          grainShapeCodelistIds: ["platy", "elongated"],
          grainAngularityCodelistIds: ["angular", "sub-angular"],
          lithologyUnconDebrisCodelistIds: ["rock: sedimentary", "rock: clastic"],
          hasStriae: true,
        },
        {
          lithologyUnconMainId: "cobbles (Co)",
          lithologyUncon2Id: "stony / with stones (co)",
          lithologyUncon3Id: "stony / with stones (co)",
          lithologyUncon4Id: "stony / with stones (co)",
          lithologyUncon5Id: "stony / with stones (co)",
          lithologyUncon6Id: "stony / with stones (co)",
          componentUnconOrganicCodelistIds: ["undifferenciated organic material", "roots"],
          componentUnconDebrisCodelistIds: ["bed load", "fragments, splitters"],
          colorPrimaryId: "dark grey",
          colorSecondaryId: "dark grey",
          grainShapeCodelistIds: ["elongated", "other"],
          grainAngularityCodelistIds: ["sub-angular", "sub-rounded"],
          lithologyUnconDebrisCodelistIds: ["rock: clastic", "psephite"],
        },
      ],
      compactnessId: "loose",
      cohesionId: "slightly cohesive",
      humidityId: "earth-moist",
      consistencyId: "soft",
      plasticityId: "slight plasticity",
      uscsTypeCodelistIds: ["lean clay", "silty clay"],
      uscsDeterminationId: "laboratory",
      rockConditionCodelistIds: ["decomposed", "subsided"],
      alterationDegreeId: "weathered",
      notes: "A unconsolidated rock note.",
    });

    // Should not change form when canceling switch
    switchRockType(RockType.consolidated, "Cancel");
    evaluateUnconsolidatedLithologyForm({
      fromDepth: 0,
      toDepth: 56,
      hasBedding: true,
      share: 80,
      lithologyDescriptions: [
        {
          lithologyUnconMainId: "boulder (Bo)",
          lithologyUncon2Id: "blocky / with blocks (bo)",
          lithologyUncon3Id: "blocky / with blocks (bo)",
          lithologyUncon4Id: "blocky / with blocks (bo)",
          lithologyUncon5Id: "blocky / with blocks (bo)",
          lithologyUncon6Id: "blocky / with blocks (bo)",
          componentUnconOrganicCodelistIds: ["humus", "undifferenciated organic material"],
          componentUnconDebrisCodelistIds: ["rubble", "bed load"],
          colorPrimaryId: "blackish grey",
          colorSecondaryId: "blackish grey",
          grainShapeCodelistIds: ["platy", "elongated"],
          grainAngularityCodelistIds: ["angular", "sub-angular"],
          lithologyUnconDebrisCodelistIds: ["rock: sedimentary", "rock: clastic"],
          hasStriae: true,
        },
        {
          lithologyUnconMainId: "cobbles (Co)",
          lithologyUncon2Id: "stony / with stones (co)",
          lithologyUncon3Id: "stony / with stones (co)",
          lithologyUncon4Id: "stony / with stones (co)",
          lithologyUncon5Id: "stony / with stones (co)",
          lithologyUncon6Id: "stony / with stones (co)",
          componentUnconOrganicCodelistIds: ["undifferenciated organic material", "roots"],
          componentUnconDebrisCodelistIds: ["bed load", "fragments, splitters"],
          colorPrimaryId: "dark grey",
          colorSecondaryId: "dark grey",
          grainShapeCodelistIds: ["elongated", "other"],
          grainAngularityCodelistIds: ["sub-angular", "sub-rounded"],
          lithologyUnconDebrisCodelistIds: ["rock: clastic", "psephite"],
        },
      ],
      compactnessId: "loose",
      cohesionId: "slightly cohesive",
      humidityId: "earth-moist",
      consistencyId: "soft",
      plasticityId: "slight plasticity",
      uscsTypeCodelistIds: ["lean clay", "silty clay"],
      uscsDeterminationId: "laboratory",
      rockConditionCodelistIds: ["decomposed", "subsided"],
      alterationDegreeId: "weathered",
      notes: "A unconsolidated rock note.",
    });

    // Should reset form when continuing with switch
    switchRockType(RockType.consolidated, "Continue");
    evaluateConsolidatedLithologyForm({ fromDepth: 0, toDepth: 56, hasBedding: false });

    switchRockType(RockType.unconsolidated, "Continue");
    evaluateUnconsolidatedLithologyForm({
      fromDepth: 0,
      toDepth: 56,
      hasBedding: false,
      lithologyDescriptions: [
        {
          lithologyUnconMainId: "",
          lithologyUncon2Id: "",
          lithologyUncon3Id: "",
          lithologyUncon4Id: "",
          lithologyUncon5Id: "",
          lithologyUncon6Id: "",
          componentUnconOrganicCodelistIds: [],
          componentUnconDebrisCodelistIds: [],
          colorPrimaryId: "",
          colorSecondaryId: "",
          grainShapeCodelistIds: [],
          grainAngularityCodelistIds: [],
          lithologyUnconDebrisCodelistIds: [],
          hasStriae: false,
        },
      ],
      compactnessId: "",
      cohesionId: "",
      humidityId: "",
      consistencyId: "",
      plasticityId: "",
      uscsTypeCodelistIds: [],
      uscsDeterminationId: "",
      rockConditionCodelistIds: [],
      alterationDegreeId: "",
      notes: "",
    });

    switchRockType(RockType.consolidated, "Continue");
    evaluateConsolidatedLithologyForm({ fromDepth: 0, toDepth: 56, hasBedding: false });

    fillConsolidatedLithologyForm({
      fromDepth: 0,
      toDepth: 56,
      hasBedding: true,
      share: 65,
      lithologyDescriptions: [
        {
          lithologyConId: 1,
          colorPrimaryId: 1,
          colorSecondaryId: 1,
          componentConParticleCodelistIds: [1, 2],
          componentConMineralCodelistIds: [1, 2],
          grainSizeId: 1,
          grainAngularityId: 1,
          gradationId: 1,
          cementationId: 1,
          structureSynGenCodelistIds: [1, 2],
          structurePostGenCodelistIds: [1, 2],
        },
        {
          lithologyConId: 1,
          colorPrimaryId: 1,
          colorSecondaryId: 1,
          componentConParticleCodelistIds: [2, 3],
          componentConMineralCodelistIds: [2, 3],
          grainSizeId: 1,
          grainAngularityId: 1,
          gradationId: 1,
          cementationId: 1,
          structureSynGenCodelistIds: [2, 3],
          structurePostGenCodelistIds: [2, 3],
        },
      ],
      textureMetaCodelistIds: [1, 2],
      alterationDegreeId: 1,
      notes: "A consolidated rock note.",
    });
    evaluateConsolidatedLithologyForm({
      fromDepth: 0,
      toDepth: 56,
      hasBedding: true,
      share: 65,
      lithologyDescriptions: [
        {
          lithologyConId: "rock",
          colorPrimaryId: "black",
          colorSecondaryId: "black",
          componentConParticleCodelistIds: ["algae", "algal mats"],
          componentConMineralCodelistIds: ["actinolite", "adularia"],
          grainSizeId: "very fine",
          grainAngularityId: "very angular",
          gradationId: "very well-sorted",
          cementationId: "uncemented",
          structureSynGenCodelistIds: ["structureless", "nodular"],
          structurePostGenCodelistIds: ["birdseye structure", "fenestral structure"],
        },
        {
          lithologyConId: "rock",
          colorPrimaryId: "black",
          colorSecondaryId: "black",
          componentConParticleCodelistIds: ["algal mats", "ammonites"],
          componentConMineralCodelistIds: ["adularia", "albite"],
          grainSizeId: "very fine",
          grainAngularityId: "very angular",
          gradationId: "very well-sorted",
          cementationId: "uncemented",
          structureSynGenCodelistIds: ["nodular", "varves"],
          structurePostGenCodelistIds: ["fenestral structure", "keystone vugs"],
        },
      ],
      textureMetaCodelistIds: ["massive", "layered"],
      alterationDegreeId: "fresh",
      notes: "A consolidated rock note.",
    });

    // Should not change form when canceling switch
    switchRockType(RockType.unconsolidated, "Cancel");
    evaluateConsolidatedLithologyForm({
      fromDepth: 0,
      toDepth: 56,
      hasBedding: true,
      share: 65,
      lithologyDescriptions: [
        {
          lithologyConId: "rock",
          colorPrimaryId: "black",
          colorSecondaryId: "black",
          componentConParticleCodelistIds: ["algae", "algal mats"],
          componentConMineralCodelistIds: ["actinolite", "adularia"],
          grainSizeId: "very fine",
          grainAngularityId: "very angular",
          gradationId: "very well-sorted",
          cementationId: "uncemented",
          structureSynGenCodelistIds: ["structureless", "nodular"],
          structurePostGenCodelistIds: ["birdseye structure", "fenestral structure"],
        },
        {
          lithologyConId: "rock",
          colorPrimaryId: "black",
          colorSecondaryId: "black",
          componentConParticleCodelistIds: ["algal mats", "ammonites"],
          componentConMineralCodelistIds: ["adularia", "albite"],
          grainSizeId: "very fine",
          grainAngularityId: "very angular",
          gradationId: "very well-sorted",
          cementationId: "uncemented",
          structureSynGenCodelistIds: ["nodular", "varves"],
          structurePostGenCodelistIds: ["fenestral structure", "keystone vugs"],
        },
      ],
      textureMetaCodelistIds: ["massive", "layered"],
      alterationDegreeId: "fresh",
      notes: "A consolidated rock note.",
    });

    switchRockType(RockType.unconsolidated, "Continue");
    evaluateUnconsolidatedLithologyForm({ fromDepth: 0, toDepth: 56, hasBedding: false });

    switchRockType(RockType.consolidated, "Continue");
    evaluateConsolidatedLithologyForm({
      fromDepth: 0,
      toDepth: 56,
      hasBedding: false,
      lithologyDescriptions: [
        {
          lithologyConId: "",
          colorPrimaryId: "",
          colorSecondaryId: "",
          componentConParticleCodelistIds: [],
          componentConMineralCodelistIds: [],
          grainSizeId: "",
          grainAngularityId: "",
          gradationId: "",
          cementationId: "",
          structureSynGenCodelistIds: [],
          structurePostGenCodelistIds: [],
        },
      ],
      textureMetaCodelistIds: [],
      alterationDegreeId: "",
      notes: "",
    });
  });

  it("should inherit previous rock type", () => {
    openNewStratigraphy();
    addLithology();

    // By default, initial rock type is unconsolidated but can be switched
    isUnconsolidatedForm(true);
    switchRockType(RockType.consolidated, "Continue");
    switchRockType(RockType.unconsolidated, "Continue");
    setInput("fromDepth", 0);
    setInput("toDepth", 10);
    closeLayerModal();
    addLithology();

    // If previous layer was unconsolidated, new layer is also unconsolidated
    isUnconsolidatedForm(true);
    switchRockType(RockType.consolidated, "Continue");
    setInput("toDepth", 20);
    closeLayerModal();
    addLithology();

    // If previous layer was consolidated, new layer is also consolidated
    isUnconsolidatedForm(false);
  });
});
