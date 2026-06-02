import { discardChanges, saveWithSaveBar, verifyUnsavedChanges } from "../helpers/buttonHelpers";
import { evaluateInput, evaluateSelect, setInput, setSelect } from "../helpers/formHelpers";
import { handlePrompt, stopBoreholeEditing } from "../helpers/testHelpers";
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
  dragResizeDescription,
  hasDepthError,
  hasGapsAt,
  hasLayer,
  hasLayersAt,
  hasNoDepthError,
  insertDepthRow,
  LayerType,
  openLayer,
  openNewStratigraphy,
  setDepth,
} from "./stratigraphyHelpers";

const addLithologyAtDepth = (fromDepth: number, toDepth: number) => {
  addLithology();
  // First-row case (empty stratigraphy): the new row is (null, null) — set fromDepth first.
  // Subsequent-row case: the new row is appended as (prevToDepth, null), so fromDepth is
  // already set when prevToDepth matches the requested fromDepth.
  cy.get("body").then($body => {
    if ($body.find('[data-cy="depth-from-null-null-input"]').length > 0) {
      setDepth(null, null, "from", fromDepth);
    }
  });
  setDepth(fromDepth, null, "to", toDepth);
  openLayer({ layerType: LayerType.lithology, fromDepth, toDepth });
};

const openStratigraphyWith3Lithologies = () => {
  openNewStratigraphy();
  addLithologyAtDepth(0, 355);
  fillUnconsolidatedLithologyForm({});
  closeLayerModal();
  addLithologyAtDepth(355, 798);
  fillUnconsolidatedLithologyForm({});
  closeLayerModal();
  addLithologyAtDepth(798, 1123);
  fillUnconsolidatedLithologyForm({});
  closeLayerModal();

  checkDepthColumn([
    [0, 355],
    [355, 798],
    [798, 1123],
  ]);
  hasLayersAt(LayerType.lithology, [
    [0, 355],
    [355, 798],
    [798, 1123],
  ]);
  hasGapsAt(LayerType.lithologicalDescription, [0, 355, 798]);
  hasGapsAt(LayerType.faciesDescription, [0, 355, 798]);
};

const createCompleteLayerGrid = () => {
  openStratigraphyWith3Lithologies();
  // Click each gap to create a description spanning exactly that gap's depth range.
  openLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
  fillLithologicalDescriptionForm({});
  closeLayerModal();
  openLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true });
  fillLithologicalDescriptionForm({});
  closeLayerModal();
  openLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true });
  fillLithologicalDescriptionForm({});
  closeLayerModal();
  openLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
  fillFaciesDescriptionForm({});
  closeLayerModal();
  openLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true });
  fillFaciesDescriptionForm({});
  closeLayerModal();
  openLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true });
  fillFaciesDescriptionForm({});
  closeLayerModal();

  hasLayersAt(LayerType.lithology, [
    [0, 355],
    [355, 798],
    [798, 1123],
  ]);
  hasLayersAt(LayerType.lithologicalDescription, [
    [0, 355],
    [355, 798],
    [798, 1123],
  ]);
  hasLayersAt(LayerType.faciesDescription, [
    [0, 355],
    [355, 798],
    [798, 1123],
  ]);
};

const fillCompleteUnconsolidatedLithologyForm = () => {
  fillUnconsolidatedLithologyForm({
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
    addLithologyAtDepth(0, 355);
    isUnconsolidatedForm(true);
    fillUnconsolidatedLithologyForm({
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

    // Add the middle row as an empty lithology, then add the bottom consolidated lithology.
    addLithology();
    setDepth(355, null, "to", 798);
    addLithologyAtDepth(798, 1123);
    isUnconsolidatedForm(true);
    switchRockType(RockType.unconsolidated, RockType.consolidated, "Continue");
    evaluateInput("fromDepth", 798);
    fillConsolidatedLithologyForm({
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
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    checkLayerCardContent({
      layerType: LayerType.lithology,
      fromDepth: 798,
      toDepth: 1123,
      content: ["psephite, well sorted"],
    });
    hasGapsAt(LayerType.lithologicalDescription, [0, 355, 798]);
    hasGapsAt(LayerType.faciesDescription, [0, 355, 798]);

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
    hasLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
    checkLayerCardContent({
      layerType: LayerType.lithology,
      fromDepth: 798,
      toDepth: 1123,
      content: ["breccia, well sorted"],
    });
    hasGapsAt(LayerType.lithologicalDescription, [0, 355, 798]);
    hasGapsAt(LayerType.faciesDescription, [0, 355, 798]);

    // Fill the empty middle lithology with real details.
    openLayer({ layerType: LayerType.lithology, fromDepth: 355, toDepth: 798 });
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
    hasGapsAt(LayerType.lithologicalDescription, [0, 355, 798]);
    hasGapsAt(LayerType.faciesDescription, [0, 355, 798]);

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
    hasGapsAt(LayerType.lithologicalDescription, [0, 355, 798]);
    hasGapsAt(LayerType.faciesDescription, [0, 355, 798]);
  });

  it("resets form when switching between unconsolidated and consolidated rock", () => {
    openNewStratigraphy();
    addLithologyAtDepth(0, 56);

    fillCompleteUnconsolidatedLithologyForm();
    closeLayerModal();
    saveWithSaveBar();

    openLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 56 });
    evaluateCompleteUnconsolidatedLithologyForm();

    // Should not change form when canceling switch
    switchRockType(RockType.unconsolidated, RockType.consolidated, "Cancel");
    evaluateCompleteUnconsolidatedLithologyForm();

    // Should reset form when continuing with switch
    switchRockType(RockType.unconsolidated, RockType.consolidated, "Continue");
    evaluateConsolidatedLithologyFormHasOnlyDepths(0, 56);

    switchRockType(RockType.consolidated, RockType.unconsolidated, "Continue");
    evaluateUnconsolidatedLithologyFormHasOnlyDepths(0, 56);

    switchRockType(RockType.unconsolidated, RockType.consolidated, "Continue");
    evaluateConsolidatedLithologyFormHasOnlyDepths(0, 56);

    fillCompleteConsolidatedLithologyForm();
    closeLayerModal();
    saveWithSaveBar();

    openLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 56 });
    evaluateCompleteConsolidatedLithologyForm();

    // Should not change form when canceling switch
    switchRockType(RockType.consolidated, RockType.unconsolidated, "Cancel");
    evaluateCompleteConsolidatedLithologyForm();

    switchRockType(RockType.consolidated, RockType.unconsolidated, "Continue");
    evaluateUnconsolidatedLithologyFormHasOnlyDepths(0, 56);

    switchRockType(RockType.unconsolidated, RockType.consolidated, "Continue");
    evaluateConsolidatedLithologyFormHasOnlyDepths(0, 56);
  });

  it("supports the unspecified rock type", () => {
    openNewStratigraphy();
    addLithologyAtDepth(0, 25);
    isUnconsolidatedForm(true);

    // Switch to unspecified hides both unconsolidated and consolidated form blocks
    switchRockType(RockType.unconsolidated, RockType.unspecified, "Continue");
    isUnconsolidatedForm(null);

    closeLayerModal();
    saveWithSaveBar();

    // Reopen and confirm unspecified state persisted
    openLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 25 });
    isUnconsolidatedForm(null);

    // Switch from unspecified to a concrete type
    switchRockType(RockType.unspecified, RockType.consolidated, "Continue");
    isUnconsolidatedForm(false);
  });

  it("should inherit previous rock type", () => {
    openNewStratigraphy();
    addLithologyAtDepth(0, 10);

    // By default, initial rock type is unconsolidated but can be switched
    isUnconsolidatedForm(true);
    switchRockType(RockType.unconsolidated, RockType.consolidated, "Continue");
    switchRockType(RockType.consolidated, RockType.unconsolidated, "Continue");
    closeLayerModal();
    addLithologyAtDepth(10, 20);

    // If previous layer was unconsolidated, new layer is also unconsolidated
    isUnconsolidatedForm(true);
    switchRockType(RockType.unconsolidated, RockType.consolidated, "Continue");
    closeLayerModal();
    addLithology();
    openLayer({ layerType: LayerType.lithology, fromDepth: 20, toDepth: null });

    // If previous layer was consolidated, new layer is also consolidated
    isUnconsolidatedForm(false);
  });

  it("creates correct layer card label based on lithology form values", () => {
    openNewStratigraphy();

    addLithologyAtDepth(0, 35);
    isUnconsolidatedForm(true);
    fillUnconsolidatedLithologyForm({
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

    addLithologyAtDepth(35, 46);
    isUnconsolidatedForm(true);
    fillUnconsolidatedLithologyForm({
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

    addLithologyAtDepth(46, 78);
    isUnconsolidatedForm(true);
    switchRockType(RockType.unconsolidated, RockType.consolidated, "Continue");
    fillConsolidatedLithologyForm({
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

    addLithologyAtDepth(78, 96);
    isUnconsolidatedForm(false);
    fillConsolidatedLithologyForm({
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

  it("flags newly-added depth rows with unset toDepth as errors", () => {
    openNewStratigraphy();
    addLithology();
    hasDepthError(null, null);
    setDepth(null, null, "from", 0);
    setDepth(0, null, "to", 50);
    hasNoDepthError(0, 50);
  });

  it("inserts zero-thickness depth rows via the depth-cell + buttons", () => {
    openNewStratigraphy();
    addLithologyAtDepth(0, 30);
    fillUnconsolidatedLithologyForm({});
    closeLayerModal();
    addLithologyAtDepth(30, 70);
    fillUnconsolidatedLithologyForm({});
    closeLayerModal();
    addLithologyAtDepth(70, 100);
    fillUnconsolidatedLithologyForm({});
    closeLayerModal();
    checkDepthColumn([
      [0, 30],
      [30, 70],
      [70, 100],
    ]);

    // New row at the very top via "+" on the upper edge of the first cell.
    insertDepthRow(0, 30, "before");
    hasDepthError(0, 0);

    // New row in between via "+" on the lower edge of the upper neighbor.
    insertDepthRow(0, 30, "after");
    hasDepthError(30, 30);

    // New row in between via "+" on the upper edge of the lower neighbor.
    insertDepthRow(70, 100, "before");
    hasDepthError(70, 70);

    // New row at the very bottom via "+" on the lower edge of the last cell — appended at
    // the end, so toDepth stays unset (null) and only the toDepth side is flagged.
    insertDepthRow(70, 100, "after");
    hasDepthError(100, null);

    // The original lithologies are still in place, plus four new autocorrected empty lithologies (one per inserted zt depth row).
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 0 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 30 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 30, toDepth: 30 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 30, toDepth: 70 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 70, toDepth: 70 });
    hasLayer({ layerType: LayerType.lithology, fromDepth: 70, toDepth: 100 });
    // The appended-at-end lithology mirrors the depth row's (100, null) — toDepth stays
    // unset until the user enters a value.
    hasLayer({ layerType: LayerType.lithology, fromDepth: 100, toDepth: null });
  });

  it("adds, edits and resizes lithological descriptions across gap rows", () => {
    openStratigraphyWith3Lithologies();

    // Create a description from the first gap; it spans only that gap's row.
    openLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
    fillLithologicalDescriptionForm({ description: "lithological description 0 - 355" });
    closeLayerModal();
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true });

    // Top row has no row above → the top handle should not render.
    cy.dataCy("resize-description-lithological-top-0-355").should("not.exist");

    // Reopen the description and update its text.
    openLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    evaluateLithologicalDescriptionForm({ description: "lithological description 0 - 355" });
    fillLithologicalDescriptionForm({ description: "lithological description 0 - 355 (updated)" });
    closeLayerModal();
    checkLayerCardContent({
      layerType: LayerType.lithologicalDescription,
      fromDepth: 0,
      toDepth: 355,
      content: ["lithological description 0 - 355 (updated)"],
    });

    // Create a second description from the middle gap, then drag-resize its bottom handle
    // one row down → it absorbs the bottom row and spans (355, 1123).
    openLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true });
    fillLithologicalDescriptionForm({ description: "lithological description 355 - 1123" });
    closeLayerModal();
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true });

    dragResizeDescription({
      kind: "lithological",
      fromDepth: 355,
      toDepth: 798,
      side: "bottom",
      deltaRows: 1,
    });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, toDepth: 1123 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true, exists: false });

    // Save, reload and verify everything persisted.
    saveWithSaveBar();
    stopBoreholeEditing();
    hasLayersAt(LayerType.lithology, [
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    checkLayerCardContent({
      layerType: LayerType.lithologicalDescription,
      fromDepth: 0,
      toDepth: 355,
      content: ["lithological description 0 - 355 (updated)"],
    });
    checkLayerCardContent({
      layerType: LayerType.lithologicalDescription,
      fromDepth: 355,
      toDepth: 1123,
      content: ["lithological description 355 - 1123"],
    });
    hasGapsAt(LayerType.faciesDescription, [0, 355, 798]);
  });

  it("adds, edits and resizes facies descriptions across gap rows", () => {
    openStratigraphyWith3Lithologies();

    // Create a facies description from the first gap.
    openLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    fillFaciesDescriptionForm({ faciesId: 1, description: "facies description 0 - 355" });
    closeLayerModal();
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true });
    checkLayerCardContent({
      layerType: LayerType.faciesDescription,
      fromDepth: 0,
      toDepth: 355,
      content: ["terrestrial", "facies description 0 - 355"],
    });

    // Top row has no row above → the top handle should not render.
    cy.dataCy("resize-description-facies-top-0-355").should("not.exist");

    // Reopen and switch the faciesId.
    openLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, toDepth: 355 });
    evaluateFaciesDescriptionForm({ faciesId: "terrestrial", description: "facies description 0 - 355" });
    fillFaciesDescriptionForm({ faciesId: 3 });
    closeLayerModal();
    checkLayerCardContent({
      layerType: LayerType.faciesDescription,
      fromDepth: 0,
      toDepth: 355,
      content: ["alluvial fan", "facies description 0 - 355"],
    });

    // Create a second description from the middle gap, then drag-resize its bottom handle
    // one row down → it absorbs the bottom row and spans (355, 1123).
    openLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true });
    fillFaciesDescriptionForm({ faciesId: 2, description: "facies description 355 - 1123" });
    closeLayerModal();
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true });

    dragResizeDescription({
      kind: "facies",
      fromDepth: 355,
      toDepth: 798,
      side: "bottom",
      deltaRows: 1,
    });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 1123 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true, exists: false });

    // Save, reload and verify everything persisted.
    saveWithSaveBar();
    stopBoreholeEditing();
    hasLayersAt(LayerType.lithology, [
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasGapsAt(LayerType.lithologicalDescription, [0, 355, 798]);
    checkLayerCardContent({
      layerType: LayerType.faciesDescription,
      fromDepth: 0,
      toDepth: 355,
      content: ["alluvial fan", "facies description 0 - 355"],
    });
    checkLayerCardContent({
      layerType: LayerType.faciesDescription,
      fromDepth: 355,
      toDepth: 1123,
      content: ["alluvial", "facies description 355 - 1123"],
    });
  });

  it("creates one gap per row in lithological and facies descriptions", () => {
    createCompleteLayerGrid();
    saveWithSaveBar();

    deleteLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, toDepth: 1123 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasNoDepthError(0, 355);
    hasNoDepthError(355, 798);
    hasNoDepthError(798, 1123);
    hasLayersAt(LayerType.lithology, [
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true });
    hasLayersAt(LayerType.faciesDescription, [
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);

    deleteLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, toDepth: 798 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasNoDepthError(0, 355);
    hasNoDepthError(355, 798);
    hasNoDepthError(798, 1123);
    hasLayersAt(LayerType.lithology, [
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true });
    hasLayersAt(LayerType.faciesDescription, [
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);

    deleteLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, toDepth: 1123 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasNoDepthError(0, 355);
    hasNoDepthError(355, 798);
    hasNoDepthError(798, 1123);
    hasLayersAt(LayerType.lithology, [
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, toDepth: 355 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, isGap: true });

    discardChanges();

    deleteLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, toDepth: 355 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasNoDepthError(0, 355);
    hasNoDepthError(355, 798);
    hasNoDepthError(798, 1123);
    hasLayersAt(LayerType.lithology, [
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayersAt(LayerType.lithologicalDescription, [
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, toDepth: 1123 });

    deleteLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, toDepth: 798 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasNoDepthError(0, 355);
    hasNoDepthError(355, 798);
    hasNoDepthError(798, 1123);
    hasLayersAt(LayerType.lithology, [
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayersAt(LayerType.lithologicalDescription, [
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, toDepth: 1123 });

    deleteLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 355 });
    checkDepthColumn([
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasNoDepthError(0, 355);
    hasNoDepthError(355, 798);
    hasNoDepthError(798, 1123);
    hasLayersAt(LayerType.lithology, [
      [0, 355],
      [355, 798],
      [798, 1123],
    ]);
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 355, toDepth: 798 });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 798, toDepth: 1123 });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 0, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 355, isGap: true });
    hasLayer({ layerType: LayerType.faciesDescription, fromDepth: 798, toDepth: 1123 });
  });

  it("edits the lithological description from the lithology modal", () => {
    openStratigraphyWith3Lithologies();

    // Open the first lithology layer — the new description card should be visible and empty.
    openLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    cy.dataCy("lithology-lithological-description").should("be.visible");
    cy.dataCy("shared-lithological-description-notice").should("not.exist");

    // Type a description and apply via the modal's apply button.
    setInput("lithologicalDescription.description", "Mittelkies aus dem Lithology-Modal");
    closeLayerModal();

    // The LD column now shows a layer with the typed text for that depth range.
    checkLayerCardContent({
      layerType: LayerType.lithologicalDescription,
      fromDepth: 0,
      toDepth: 355,
      content: ["Mittelkies aus dem Lithology-Modal"],
    });

    // Reopen the lithology modal and confirm the text persists in the form.
    openLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    cy.dataCy("lithologicalDescription.description-formInput")
      .find("textarea")
      .first()
      .should("have.value", "Mittelkies aus dem Lithology-Modal");
    closeLayerModal();

    // Persist via the global save handler and check the lithological description survives a reload.
    saveWithSaveBar();
    stopBoreholeEditing();
    checkLayerCardContent({
      layerType: LayerType.lithologicalDescription,
      fromDepth: 0,
      toDepth: 355,
      content: ["Mittelkies aus dem Lithology-Modal"],
    });
  });

  it("warns when editing a description shared by multiple lithology layers", () => {
    openStratigraphyWith3Lithologies();

    // Add an LD that spans the first two lithology layers by creating it in the first gap and
    // dragging its bottom handle down by one row.
    openLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, isGap: true });
    fillLithologicalDescriptionForm({ description: "Originalbeschreibung" });
    closeLayerModal();
    dragResizeDescription({
      kind: "lithological",
      fromDepth: 0,
      toDepth: 355,
      side: "bottom",
      deltaRows: 1,
    });
    hasLayer({ layerType: LayerType.lithologicalDescription, fromDepth: 0, toDepth: 1123 });

    // Opening the first lithology shows the shared-layers notice.
    openLayer({ layerType: LayerType.lithology, fromDepth: 0, toDepth: 355 });
    cy.dataCy("shared-lithological-description-notice").should("be.visible");

    // Change the description and apply — the prompt should appear.
    setInput("lithologicalDescription.description", "Aktualisierte Beschreibung");
    cy.dataCy("apply-button").click();
    handlePrompt(null, "continue");

    // Both lithology layers in the spanning LD should now show the updated text.
    checkLayerCardContent({
      layerType: LayerType.lithologicalDescription,
      fromDepth: 0,
      toDepth: 1123,
      content: ["Aktualisierte Beschreibung"],
    });
  });
});
