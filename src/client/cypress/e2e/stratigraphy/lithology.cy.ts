import { discardChanges, saveForm, saveWithSaveBar, verifyUnsavedChanges } from "../helpers/buttonHelpers";
import { evaluateInput, evaluateSelect, hasError, setInput, setSelect } from "../helpers/formHelpers";
import { stopBoreholeEditing } from "../helpers/testHelpers";
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
} from "./lithologyHelpers";
import {
  addLithology,
  checkDepthColumn,
  checkLayerCardContent,
  closeLayerModal,
  deleteLayer,
  hasDepthError,
  hasLayer,
  LayerType,
  openLayer,
  openNewStratigraphy,
} from "./stratigraphyHelpers";

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
  hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
  hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
  hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
  hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
  hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true, exists: false });
  hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true, exists: false });
  hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
  hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true, exists: false });
  hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true, exists: false });
};

const createCompleteLayerGrid = () => {
  openStratigraphyWith3Lithologies();
  openLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
  fillLithologicalDescriptionForm({ fromDepth: 0, toDepth: 0 });
  closeLayerModal();
  openLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true });
  fillLithologicalDescriptionForm({ fromDepth: 0, toDepth: 0 });
  closeLayerModal();
  openLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true });
  fillLithologicalDescriptionForm({ fromDepth: 0, toDepth: 0 });
  closeLayerModal();
  openLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
  fillFaciesDescriptionForm({ fromDepth: 0, toDepth: 0 });
  closeLayerModal();
  openLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true });
  fillFaciesDescriptionForm({ fromDepth: 0, toDepth: 0 });
  closeLayerModal();
  openLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true });
  fillFaciesDescriptionForm({ fromDepth: 0, toDepth: 0 });
  closeLayerModal();

  hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
  hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
  hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
  hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
  hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, toDepth: 798 });
  hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, toDepth: 1123 });
  hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, toDepth: 355 });
  hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 798 });
  hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, toDepth: 1123 });
};

const fillCompleteUnconsolidatedLithologyForm = () => {
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
};

const evaluateCompleteUnconsolidatedLithologyForm = () => {
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
};

const evaluateUnconsolidatedLithologyFormHasOnlyDepths = (fromDepth: number, toDepth: number) => {
  evaluateUnconsolidatedLithologyForm({
    fromDepth: fromDepth,
    toDepth: toDepth,
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
};

const fillCompleteConsolidatedLithologyForm = () => {
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
};

const evaluateCompleteConsolidatedLithologyForm = () => {
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
};

const evaluateConsolidatedLithologyFormHasOnlyDepths = (fromDepth: number, toDepth: number) => {
  evaluateConsolidatedLithologyForm({
    fromDepth: fromDepth,
    toDepth: toDepth,
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
    checkLayerCardContent({
      layerType: LayerType.lithology,
      fromDepth: 0,
      toDepth: 355,
      content: ["[FGr-co]: fine gravel, stony / with stones"],
    });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });

    // Edit unconsolidated lithology and check that changes are applied
    openLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    setSelect("lithologyDescriptions.0.lithologyUnconMainId", 7);
    evaluateSelect("lithologyDescriptions.0.lithologyUnconMainId", "medium gravel (MGr)");
    closeLayerModal();
    checkLayerCardContent({
      layerType: LayerType.lithology,
      fromDepth: 0,
      toDepth: 355,
      content: ["[MGr-co]: medium gravel, stony / with stones"],
    });

    // Add consolidated lithology
    addLithology();
    isUnconsolidatedForm(true);
    switchRockType(RockType.consolidated, "Continue");
    evaluateInput("fromDepth", 355);
    fillConsolidatedLithologyForm({
      fromDepth: 798,
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
    checkLayerCardContent({
      layerType: LayerType.lithology,
      fromDepth: 0,
      toDepth: 355,
      content: ["[MGr-co]: medium gravel, stony / with stones"],
    });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, isGap: true });
    checkLayerCardContent({
      layerType: LayerType.lithology,
      fromDepth: 798,
      toDepth: 1123,
      content: ["psephite, well sorted"],
    });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true, exists: false });

    // Edit consolidated lithology and check that changes are applied
    openLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    setSelect("lithologyDescriptions.0.lithologyConId", 5);
    evaluateSelect("lithologyDescriptions.0.lithologyConId", "breccia");
    closeLayerModal();

    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    checkLayerCardContent({
      layerType: LayerType.lithology,
      fromDepth: 0,
      toDepth: 355,
      content: ["[MGr-co]: medium gravel, stony / with stones"],
    });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, isGap: true });
    checkLayerCardContent({
      layerType: LayerType.lithology,
      fromDepth: 798,
      toDepth: 1123,
      content: ["breccia, well sorted"],
    });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true, exists: false });

    // Cannot save if there's a gap in the lithology column
    saveForm();
    cy.get(".MuiAlert-message").should(
      "contain",
      "There are gaps or overlaps in the lithology. Please resolve the issues before saving.",
    );

    verifyUnsavedChanges();

    openLayer({ layerType: LayerType.lithology, fromDepth: 355, isGap: true });
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
    checkLayerCardContent({
      layerType: LayerType.lithology,
      fromDepth: 0,
      toDepth: 355,
      content: ["[MGr-co]: medium gravel, stony / with stones"],
    });
    checkLayerCardContent({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798, content: ["[Co]: cobbles"] });
    checkLayerCardContent({
      layerType: LayerType.lithology,
      fromDepth: 798,
      toDepth: 1123,
      content: ["breccia, well sorted"],
    });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true, exists: false });

    // Can save after filling gap, even if lithological descriptions and facies descriptions are missing
    saveWithSaveBar();

    stopBoreholeEditing();
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    checkLayerCardContent({
      layerType: LayerType.lithology,
      fromDepth: 0,
      toDepth: 355,
      content: ["[MGr-co]: medium gravel, stony / with stones"],
    });
    checkLayerCardContent({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798, content: ["[Co]: cobbles"] });
    checkLayerCardContent({
      layerType: LayerType.lithology,
      fromDepth: 798,
      toDepth: 1123,
      content: ["breccia, well sorted"],
    });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true, exists: false });
  });

  it("adds, updates and displays lithological descriptions", () => {
    openStratigraphyWith3Lithologies();

    // Add lithological description from gap and check that it has the correct depth range
    openLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
    evaluateLithologicalDescriptionForm({ fromDepth: 0, toDepth: 1123 });
    fillLithologicalDescriptionForm({ fromDepth: 0, fromDepthOptionsLength: 3, toDepth: 0, toDepthOptionsLength: 3 });
    evaluateLithologicalDescriptionForm({ fromDepth: 0, toDepth: 355 });
    closeLayerModal();

    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true, exists: false });

    // Edit lithological description and check that changes are applied
    openLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
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
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    checkLayerCardContent({
      layerType: LayerType.lithologicalDescription,
      fromDepth: 0,
      toDepth: 355,
      content: ["lithological description 0 - 355"],
    });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true, exists: false });

    // Add lithological description from remaining gap and check that it has the correct depth range
    openLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true });
    evaluateLithologicalDescriptionForm({ fromDepth: 355, toDepth: 1123 });
    fillLithologicalDescriptionForm({
      fromDepth: 0,
      fromDepthOptionsLength: 2,
      toDepth: 1,
      toDepthOptionsLength: 2,
      description: "lithological description 355 - 1123",
    });
    evaluateLithologicalDescriptionForm({
      fromDepth: 355,
      toDepth: 1123,
      description: "lithological description 355 - 1123",
    });
    closeLayerModal();

    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    checkLayerCardContent({
      layerType: LayerType.lithologicalDescription,
      fromDepth: 0,
      toDepth: 355,
      content: ["lithological description 0 - 355"],
    });
    checkLayerCardContent({
      layerType: LayerType.lithologicalDescription,
      fromDepth: 355,
      toDepth: 1123,
      content: ["lithological description 355 - 1123"],
    });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true, exists: false });

    saveWithSaveBar();
    stopBoreholeEditing();
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    checkLayerCardContent({
      layerType: LayerType.lithologicalDescription,
      fromDepth: 0,
      toDepth: 355,
      content: ["lithological description 0 - 355"],
    });
    checkLayerCardContent({
      layerType: LayerType.lithologicalDescription,
      fromDepth: 355,
      toDepth: 1123,
      content: ["lithological description 355 - 1123"],
    });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true, exists: false });
  });

  it("adds, updates and displays facies descriptions", () => {
    openStratigraphyWith3Lithologies();

    // Add facies description from gap and check that it has the correct depth range
    openLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    evaluateFaciesDescriptionForm({ fromDepth: 0, toDepth: 1123 });
    fillFaciesDescriptionForm({
      fromDepth: 1,
      fromDepthOptionsLength: 3,
      toDepth: 2,
      toDepthOptionsLength: 3,
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
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    checkLayerCardContent({
      layerType: LayerType.faciesDescription,
      fromDepth: 355,
      toDepth: 1123,
      content: ["terrestrial", "facies description 355 - 1123"],
    });

    // Edit facies description and check that changes are applied
    openLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 1123 });
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
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    checkLayerCardContent({
      layerType: LayerType.faciesDescription,
      fromDepth: 355,
      toDepth: 1123,
      content: ["alluvial fan", "facies description 355 - 1123"],
    });

    // Add facies description from remaining gap and check that it has the correct depth range
    openLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    evaluateFaciesDescriptionForm({ fromDepth: 0, toDepth: 355 });
    fillFaciesDescriptionForm({
      fromDepth: 0,
      fromDepthOptionsLength: 1,
      toDepth: 0,
      toDepthOptionsLength: 1,
      faciesId: 2,
    });
    evaluateFaciesDescriptionForm({ fromDepth: 0, toDepth: 355, faciesId: "alluvial" });
    closeLayerModal();

    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true, exists: false });
    checkLayerCardContent({
      layerType: LayerType.faciesDescription,
      fromDepth: 0,
      toDepth: 355,
      content: ["alluvial"],
    });
    checkLayerCardContent({
      layerType: LayerType.faciesDescription,
      fromDepth: 355,
      toDepth: 1123,
      content: ["alluvial fan", "facies description 355 - 1123"],
    });

    saveWithSaveBar();
    stopBoreholeEditing();
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true, exists: false });
    checkLayerCardContent({
      layerType: LayerType.faciesDescription,
      fromDepth: 0,
      toDepth: 355,
      content: ["alluvial"],
    });
    checkLayerCardContent({
      layerType: LayerType.faciesDescription,
      fromDepth: 355,
      toDepth: 1123,
      content: ["alluvial fan", "facies description 355 - 1123"],
    });
  });

  it("resets form when switching between unconsolidated and consolidated rock", () => {
    openNewStratigraphy();
    addLithology();

    fillCompleteUnconsolidatedLithologyForm();
    closeLayerModal();
    saveWithSaveBar();

    openLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 56 });
    evaluateCompleteUnconsolidatedLithologyForm();

    // Should not change form when canceling switch
    switchRockType(RockType.consolidated, "Cancel");
    evaluateCompleteUnconsolidatedLithologyForm();

    // Should reset form when continuing with switch
    switchRockType(RockType.consolidated, "Continue");
    evaluateConsolidatedLithologyFormHasOnlyDepths(0, 56);

    switchRockType(RockType.unconsolidated, "Continue");
    evaluateUnconsolidatedLithologyFormHasOnlyDepths(0, 56);

    switchRockType(RockType.consolidated, "Continue");
    evaluateConsolidatedLithologyFormHasOnlyDepths(0, 56);

    fillCompleteConsolidatedLithologyForm();
    closeLayerModal();
    saveWithSaveBar();

    openLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 56 });
    evaluateCompleteConsolidatedLithologyForm();

    // Should not change form when canceling switch
    switchRockType(RockType.unconsolidated, "Cancel");
    evaluateCompleteConsolidatedLithologyForm();

    switchRockType(RockType.unconsolidated, "Continue");
    evaluateUnconsolidatedLithologyFormHasOnlyDepths(0, 56);

    switchRockType(RockType.consolidated, "Continue");
    evaluateConsolidatedLithologyFormHasOnlyDepths(0, 56);
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

  it("creates correct layer card label based on lithology form values", () => {
    openNewStratigraphy();

    addLithology();
    isUnconsolidatedForm(true);
    fillUnconsolidatedLithologyForm({
      fromDepth: 0,
      toDepth: 35,
      lithologyDescriptions: [
        {
          lithologyUnconMainId: 4,
          lithologyUncon2Id: 2,
          lithologyUncon3Id: 10,
          lithologyUncon4Id: 4,
          lithologyUncon5Id: 5,
          lithologyUncon6Id: 9,
          componentUnconOrganicCodelistIds: [2, 4],
          componentUnconDebrisCodelistIds: [2],
          colorPrimaryId: 4,
          colorSecondaryId: 1,
          grainShapeCodelistIds: [1],
          grainAngularityCodelistIds: [2, 5],
          lithologyUnconDebrisCodelistIds: [1, 4],
          hasStriae: true,
        },
      ],
      compactnessId: 2,
      cohesionId: 3,
      humidityId: 4,
      consistencyId: 2,
      plasticityId: 3,
      uscsTypeCodelistIds: [2, 3],
      uscsDeterminationId: 1,
      rockConditionCodelistIds: [3, 5],
      alterationDegreeId: 1,
      notes: "Test label",
    });
    evaluateUnconsolidatedLithologyForm({
      lithologyDescriptions: [
        {
          lithologyUnconMainId: "gravel (Gr)",
          lithologyUncon2Id: "blocky / with blocks (bo)",
          lithologyUncon3Id: "sandy (sa)",
          lithologyUncon4Id: "gravelly (gr)",
          lithologyUncon5Id: "fine gravelly (fgr)",
          lithologyUncon6Id: "coarse gravelly (cgr)",
          componentUnconOrganicCodelistIds: ["humus", "roots"],
          componentUnconDebrisCodelistIds: ["rubble"],
          colorPrimaryId: "grey",
          colorSecondaryId: "black",
          grainShapeCodelistIds: ["cubic"],
          grainAngularityCodelistIds: ["angular", "rounded"],
          lithologyUnconDebrisCodelistIds: ["rock", "psephite"],
          hasStriae: true,
        },
      ],
      compactnessId: "loose",
      cohesionId: "cohesive",
      humidityId: "wet",
      consistencyId: "soft",
      plasticityId: "low plasticity",
      uscsTypeCodelistIds: ["lean clay", "silty clay"],
      uscsDeterminationId: "field",
      rockConditionCodelistIds: ["subsided", "glided"],
      alterationDegreeId: "fresh",
      notes: "Test label",
    });
    closeLayerModal();

    checkLayerCardContent({
      layerType: LayerType.lithology,
      fromDepth: 0,
      toDepth: 35,
      content: [
        "[Gr-bo-sa-gr-fgr-cgr]: gravel, blocky / with blocks, sandy, gravelly, fine gravelly, coarse gravelly, humus, roots, rubble, grey, black, Coarse components: rock, psephite, cubic, angular, rounded, Striations",
        "loose, soft, cohesive, low plasticity, wet, USCS classes: lean clay, silty clay (field)",
        "subsided, glided, fresh",
        "Test label",
      ],
    });

    addLithology();
    isUnconsolidatedForm(true);
    fillUnconsolidatedLithologyForm({
      fromDepth: 35,
      toDepth: 46,
      hasBedding: true,
      share: 70,
      lithologyDescriptions: [
        {
          lithologyUnconMainId: 2,
          lithologyUncon2Id: 4,
          lithologyUncon3Id: 5,
          componentUnconOrganicCodelistIds: [1, 2],
          componentUnconDebrisCodelistIds: [1],
          hasStriae: true,
        },
        {
          lithologyUnconMainId: 1,
          lithologyUncon2Id: 3,
          colorPrimaryId: 2,
          grainAngularityCodelistIds: [3],
          lithologyUnconDebrisCodelistIds: [2],
        },
      ],
    });
    evaluateUnconsolidatedLithologyForm({
      lithologyDescriptions: [
        {
          lithologyUnconMainId: "boulder (Bo)",
          lithologyUncon2Id: "gravelly (gr)",
          lithologyUncon3Id: "fine gravelly (fgr)",
          componentUnconOrganicCodelistIds: ["earth", "humus"],
          componentUnconDebrisCodelistIds: ["erratic block"],
          hasStriae: true,
        },
        {
          lithologyUnconMainId: "large boulder (LBo)",
          lithologyUncon2Id: "stony / with stones (co)",
          colorPrimaryId: "blackish grey",
          grainAngularityCodelistIds: ["sub-angular"],
          lithologyUnconDebrisCodelistIds: ["rock: sedimentary"],
          hasStriae: false,
        },
      ],
    });
    closeLayerModal();

    checkLayerCardContent({
      layerType: LayerType.lithology,
      fromDepth: 35,
      toDepth: 46,
      content: [
        "70% [Bo-gr-fgr]: boulder, gravelly, fine gravelly, earth, humus, erratic block, Coarse component: Striations",
        "30% [LBo-co]: large boulder, stony / with stones, blackish grey, Coarse components: rock: sedimentary, sub-angular",
      ],
    });

    addLithology();
    isUnconsolidatedForm(true);
    switchRockType(RockType.consolidated, "Continue");
    fillConsolidatedLithologyForm({
      fromDepth: 46,
      toDepth: 78,
      lithologyDescriptions: [
        {
          lithologyConId: 5,
          colorPrimaryId: 1,
          colorSecondaryId: 5,
          componentConParticleCodelistIds: [1, 4],
          componentConMineralCodelistIds: [2],
          grainSizeId: 3,
          grainAngularityId: 1,
          gradationId: 4,
          cementationId: 7,
          structureSynGenCodelistIds: [2],
          structurePostGenCodelistIds: [4, 8],
        },
      ],
      textureMetaCodelistIds: [4, 5],
      alterationDegreeId: 1,
      notes: "Test label",
    });
    evaluateConsolidatedLithologyForm({
      lithologyDescriptions: [
        {
          lithologyConId: "breccia",
          colorPrimaryId: "black",
          colorSecondaryId: "light grey",
          componentConParticleCodelistIds: ["algae", "aptychi"],
          componentConMineralCodelistIds: ["adularia"],
          grainSizeId: "medium",
          grainAngularityId: "very angular",
          gradationId: "poorly sorted",
          cementationId: "not specified",
          structureSynGenCodelistIds: ["nodular"],
          structurePostGenCodelistIds: ["vugs", "caliche"],
        },
      ],
      textureMetaCodelistIds: ["phyllitic", "schistose"],
      alterationDegreeId: "fresh",
      notes: "Test label",
    });
    closeLayerModal();

    // Should not display "uncemented" if cementation is not specified
    checkLayerCardContent({
      layerType: LayerType.lithology,
      fromDepth: 46,
      toDepth: 78,
      content: [
        "breccia, algae, aptychi, adularia, black, light grey, medium, very angular, poorly sorted, nodular, vugs, caliche",
        "phyllitic, schistose, fresh",
        "Test label",
      ],
    });

    addLithology();
    isUnconsolidatedForm(false);
    fillConsolidatedLithologyForm({
      fromDepth: 78,
      toDepth: 96,
      hasBedding: true,
      share: 65,
      lithologyDescriptions: [
        {
          lithologyConId: 3,
          colorPrimaryId: 3,
          grainSizeId: 6,
          grainAngularityId: 8,
        },
        {
          lithologyConId: 2,
          componentConParticleCodelistIds: [6],
          componentConMineralCodelistIds: [4],
        },
      ],
    });
    evaluateConsolidatedLithologyForm({
      lithologyDescriptions: [
        {
          lithologyConId: "rock: clastic",
          colorPrimaryId: "dark grey",
          grainSizeId: "other",
          grainAngularityId: "not specified",
        },
        {
          lithologyConId: "rock: sedimentary",
          componentConParticleCodelistIds: ["bioclasts"],
          componentConMineralCodelistIds: ["almandine"],
        },
      ],
    });
    closeLayerModal();

    // Should not display "not specified" if angularity is not specified
    checkLayerCardContent({
      layerType: LayerType.lithology,
      fromDepth: 78,
      toDepth: 96,
      content: ["65%: rock: clastic, dark grey, other", "35%: rock: sedimentary, bioclasts, almandine"],
    });
  });

  it("shows error for gaps and overlapping lithologies in depth column", () => {
    openNewStratigraphy();
    addLithology();
    setInput("fromDepth", 46);
    setInput("toDepth", 78);
    closeLayerModal();
    checkDepthColumn([[46, 78]]);

    addLithology();
    evaluateInput("fromDepth", 78);
    setInput("toDepth", 60);
    hasError("toDepth", true);
    setInput("toDepth", 96);
    hasError("toDepth", false);
    setInput("fromDepth", 60);
    hasError("fromDepth", false); // Form does not check whether lithologies overlap
    closeLayerModal();

    // Overlaps show errors for the overlapping values but don't add a row
    checkDepthColumn([
      [46, 78],
      [60, 96],
    ]);
    hasDepthError(46, 78, false, true);
    hasDepthError(60, 96, true, false);

    openLayer({ layerType: LayerType.lithology, fromDepth: 60, toDepth: 96 });
    setInput("fromDepth", 85);
    closeLayerModal();

    // Gaps show start and end error and add new row
    checkDepthColumn([
      [46, 78],
      [78, 85],
      [85, 96],
    ]);
    hasDepthError(46, 78, false, false);
    hasDepthError(78, 85, true, true);
    hasDepthError(85, 96, false, false);
  });

  it("keeps rows with deleted lithologies if either matching lithological or facies descriptions exist", () => {
    createCompleteLayerGrid();

    deleteLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasDepthError(0, 355, false, false);
    hasDepthError(355, 798, true, true);
    hasDepthError(798, 1123, false, false);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, isGap: true });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, toDepth: 1123 });

    deleteLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasDepthError(0, 355, false, false);
    hasDepthError(355, 798, true, true);
    hasDepthError(798, 1123, true, true);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, isGap: true });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, toDepth: 1123 });

    // Doesn't merge lithology gap layers
    deleteLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, toDepth: 1123 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasDepthError(0, 355, false, false);
    hasDepthError(355, 798, true, true);
    hasDepthError(798, 1123, true, true);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, isGap: true });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, toDepth: 1123 });

    deleteLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, toDepth: 1123 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
    ]);
    hasDepthError(0, 355, false, false);
    hasDepthError(355, 798, true, true);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, isGap: true });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true, exists: false });
  });

  it("merges gap layers in lithological and facies descriptions", () => {
    createCompleteLayerGrid();
    saveWithSaveBar();

    deleteLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, toDepth: 1123 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasDepthError(0, 355, false, false);
    hasDepthError(355, 798, false, false);
    hasDepthError(798, 1123, false, false);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, toDepth: 1123 });

    deleteLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, toDepth: 798 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasDepthError(0, 355, false, false);
    hasDepthError(355, 798, false, false);
    hasDepthError(798, 1123, false, false);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, toDepth: 1123 });

    deleteLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, toDepth: 1123 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasDepthError(0, 355, false, false);
    hasDepthError(355, 798, false, false);
    hasDepthError(798, 1123, false, false);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true });

    deleteLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
    ]);
    hasDepthError(0, 355, false, false);
    hasDepthError(355, 798, false, false);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123, isGap: false, exists: false });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true, exists: false });

    discardChanges();

    deleteLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, toDepth: 355 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasDepthError(0, 355, false, false);
    hasDepthError(355, 798, false, false);
    hasDepthError(798, 1123, false, false);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, toDepth: 1123 });

    deleteLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 798 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasDepthError(0, 355, false, false);
    hasDepthError(355, 798, false, false);
    hasDepthError(798, 1123, false, false);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, toDepth: 1123 });

    deleteLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasDepthError(0, 355, false, false);
    hasDepthError(355, 798, false, false);
    hasDepthError(798, 1123, false, false);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, toDepth: 1123 });

    deleteLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    checkDepthColumn([
      [355, 798],
      [798, 1123],
    ]);
    hasDepthError(355, 798, false, false);
    hasDepthError(798, 1123, false, false);
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355, isGap: false, exists: false });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true, exists: false });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, toDepth: 1123 });
  });
});
