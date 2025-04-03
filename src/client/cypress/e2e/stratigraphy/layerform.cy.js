import { addItem, cancelEditing, saveForm } from "../helpers/buttonHelpers";
import {
  clickOnNextPage,
  clickOnRowWithText,
  showTableAndWaitForData,
  waitForTableData,
} from "../helpers/dataGridHelpers.js";
import {
  evaluateInput,
  evaluateMultiSelect,
  evaluateSelectText,
  evaluateTextarea,
  evaluateYesNoSelect,
  setInput,
  setSelect,
  setYesNoSelect,
  toggleMultiSelect,
} from "../helpers/formHelpers.js";
import {
  getElementByDataCy,
  goToRouteAndAcceptTerms,
  handlePrompt,
  newEditableBorehole,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

const layerAttributes = [
  {
    value: "fromDepth",
    type: "Input",
    initial: "80",
    updated: "100",
  },
  {
    value: "toDepth",
    type: "Input",
    initial: "90",
    updated: "110",
  },
  {
    value: "descriptionQualityId",
    type: "Select",
    initial: "average",
    updated: "very bad",
  },
  {
    value: "lithologyId",
    type: "Select",
    initial: "marble",
  },
  {
    value: "originalLithology",
    type: "Input",
    initial: "Generic Ridge Lock Pennsylvania programming",
  },
  {
    value: "originalUscs",
    type: "Input",
    initial: "generating",
  },
  {
    value: "uscsDeterminationId",
    type: "Select",
    initial: "not specified",
  },
  {
    value: "uscs1Id",
    type: "Select",
    initial: "gravel",
  },
  {
    value: "grainSize1Id",
    type: "Select",
    initial: "fine-medium-coarse",
  },
  {
    value: "uscs2Id",
    type: "Select",
    initial: "clayey gravel",
  },
  {
    value: "grainSize2Id",
    type: "Select",
    initial: null,
  },
  {
    value: "uscs_3",
    type: "MultiSelect",
    initial: [],
    updated: ["23101001", "23101003"],
  },
  {
    value: "grain_shape",
    type: "MultiSelect",
    initial: [],
  },
  {
    value: "grain_granularity",
    type: "MultiSelect",
    initial: [],
  },
  {
    value: "organic_component",
    type: "MultiSelect",
    initial: [],
  },
  {
    value: "debris",
    type: "MultiSelect",
    initial: [],
  },
  {
    value: "lithologyTopBedrockId",
    type: "Select",
    initial: "claystone, tuffitic",
  },
  {
    value: "isStriae",
    type: "Boolean",
    initial: "Yes",
    updated: "No",
  },
  {
    value: "color",
    type: "MultiSelect",
    initial: [],
  },
  {
    value: "consistanceId",
    type: "Select",
    initial: "soft",
  },
  {
    value: "plasticityId",
    type: "Select",
    initial: "high plasticity",
  },
  {
    value: "compactnessId",
    type: "Select",
    initial: "very dense",
  },
  {
    value: "cohesionId",
    type: "Select",
    initial: "slightly cohesive",
  },
  {
    value: "gradationId",
    type: "Select",
    initial: "very well-sorted",
  },
  {
    value: "humidityId",
    type: "Select",
    initial: null,
  },
  {
    value: "alterationId",
    type: "Select",
    initial: "moderately weathered",
  },
  {
    value: "notes",
    type: "Input",
    initial: "info-mediaries Berkshire Personal Loan Account Money Market Account",
    updated: "This makes no sense",
  },
];

function updateInputsForEachType() {
  setInput("fromDepth", "100");
  setInput("toDepth", "110");
  setSelect("descriptionQualityId", 1);
  setInput("notes", "This makes no sense");
  setYesNoSelect("isStriae", "No");
  toggleMultiSelect("uscs_3", [1, 3]);
}

function resetUpdatedValues() {
  setInput("fromDepth", "80");
  setInput("toDepth", "90");
  setSelect("descriptionQualityId", 3);
  setInput("notes", "info-mediaries Berkshire Personal Loan Account Money Market Account");
  setYesNoSelect("isStriae", "Yes");
  toggleMultiSelect("uscs_3", [0]);
}

describe("Tests for the layer form.", () => {
  it("updates the layer form and saves", () => {
    function evaluateInitialFormState(editable) {
      layerAttributes.forEach(attribute => {
        if (attribute.type === "MultiSelect") {
          evaluateMultiSelect(attribute.value, attribute.initial);
        }
        if (attribute.type === "Select") {
          evaluateSelectText(attribute.value, attribute.initial, editable);
        }
        if (attribute.type === "Input") {
          evaluateInput(attribute.value, attribute.initial);
        }
        if (attribute.type === "Boolean") {
          evaluateYesNoSelect(attribute.value, attribute.initial);
        }
        if (attribute.type === "TextArea") {
          evaluateTextarea(attribute.value, attribute.initial);
        }
      });
    }

    function evaluateUpdatedFormState(editable) {
      layerAttributes.forEach(attribute => {
        if (attribute.updated) {
          if (attribute.type === "MultiSelect") {
            evaluateMultiSelect(attribute.value, attribute.updated);
          }
          if (attribute.type === "Select") {
            evaluateSelectText(attribute.value, attribute.updated, editable);
          }
          if (attribute.type === "Input") {
            evaluateInput(attribute.value, attribute.updated);
          }
          if (attribute.type === "Boolean") {
            evaluateYesNoSelect(attribute.value, attribute.updated);
          }
          if (attribute.type === "TextArea") {
            evaluateTextarea(attribute.value, attribute.updated);
          }
        }
      });
    }

    goToRouteAndAcceptTerms(`/`);
    showTableAndWaitForData();
    clickOnNextPage();
    waitForTableData();
    clickOnRowWithText("Andres Miller");
    startBoreholeEditing();
    getElementByDataCy("stratigraphy-menu-item").click();
    getElementByDataCy("lithology-menu-item").click();
    getElementByDataCy("styled-layer-8").should("contain", "marble, gravel, fine-medium-coarse");
    getElementByDataCy("styled-layer-8").click();
    cy.get(".loading-indicator").should("not.exist");
    cy.get(".MuiCircularProgress-root").should("not.exist");
    getElementByDataCy("show-all-fields-switch").click();
    resetUpdatedValues(); // remove later
    saveForm(); // remove later
    cy.wait("@update-layer"); // remove later
    getElementByDataCy("styled-layer-8").should("contain", "marble, gravel, fine-medium-coarse");
    getElementByDataCy("styled-layer-8").click();
    cy.get(".loading-indicator").should("not.exist");
    cy.get(".MuiCircularProgress-root").should("not.exist");
    getElementByDataCy("show-all-fields-switch").click();
    evaluateInitialFormState(true);

    // change some inputs then discard changes
    updateInputsForEachType();
    evaluateUpdatedFormState(true);
    cancelEditing();
    handlePrompt("There are unsaved changes. Do you want to discard all changes?", "Cancel");
    cancelEditing();
    evaluateUpdatedFormState(true);
    handlePrompt("There are unsaved changes. Do you want to discard all changes?", "Discard changes");
    getElementByDataCy("styled-layer-8").should("contain", "marble, gravel, fine-medium-coarse");
    getElementByDataCy("styled-layer-8").click();
    cy.get(".loading-indicator").should("not.exist");
    cy.get(".MuiCircularProgress-root").should("not.exist");
    getElementByDataCy("show-all-fields-switch").click();
    evaluateInitialFormState(true);

    // change some inputs then save
    updateInputsForEachType();
    saveForm();
    cy.wait("@update-layer");
    getElementByDataCy("styled-layer-9").should("contain", "marble, gravel, fine-medium-coarse");
    getElementByDataCy("styled-layer-9").click();
    cy.get(".loading-indicator").should("not.exist");
    cy.get(".MuiCircularProgress-root").should("not.exist");
    getElementByDataCy("show-all-fields-switch").click();
    evaluateUpdatedFormState(true);

    // assert updated formvalues presist after saving
    stopBoreholeEditing();
    getElementByDataCy("styled-layer-9").click();
    cy.get(".loading-indicator").should("not.exist");
    cy.get(".MuiCircularProgress-root").should("not.exist");
    getElementByDataCy("show-all-fields-switch").click();
    evaluateUpdatedFormState(false);

    // reset form values
    startBoreholeEditing();
    getElementByDataCy("styled-layer-9").click();
    cy.get(".loading-indicator").should("not.exist");
    cy.get(".MuiCircularProgress-root").should("not.exist");
    getElementByDataCy("show-all-fields-switch").click();
    resetUpdatedValues();
    evaluateInitialFormState(true);
    saveForm();

    // assert updated formvalues presist after saving
    stopBoreholeEditing();
    getElementByDataCy("styled-layer-8").click();
    cy.get(".loading-indicator").should("not.exist");
    cy.get(".MuiCircularProgress-root").should("not.exist");
    getElementByDataCy("show-all-fields-switch").click();
    evaluateInitialFormState(false);
  });

  it("creates a layer and fills all dropdowns with multiple selection.", () => {
    goToRouteAndAcceptTerms(`/`);
    newEditableBorehole().as("borehole_id");
    getElementByDataCy("stratigraphy-menu-item").click();
    getElementByDataCy("lithology-menu-item").click();
    addItem("addStratigraphy");
    cy.wait("@stratigraphy_POST");
    getElementByDataCy("add-layer-icon").click();
    cy.wait("@layer");

    cy.get('[data-cy="styled-layer-0"] [data-testid="ModeEditIcon"]').click();
    getElementByDataCy("show-all-fields-switch").click();
    cy.wait("@get-layer-by-id");

    const multiSelectAttributes = [
      {
        value: "uscs_3",
        type: "MultiSelect",
        dropdownPosition: [1, 3],
        codeValues: ["23101001", "23101003"],
        updatedCodeValues: ["23101001", "23101003"],
      },
      {
        value: "grain_shape",
        type: "MultiSelect",
        dropdownPosition: [1, 3],
        codeValues: ["21110002", "21110004"],
        updatedCodeValues: ["21110004"],
      },
      {
        value: "grain_granularity",
        type: "MultiSelect",
        dropdownPosition: [1, 3],
        codeValues: ["21115001", "21115004"],
        updatedCodeValues: ["21115004"],
      },
      {
        value: "organic_component",
        type: "MultiSelect",
        dropdownPosition: [1, 3],
        codeValues: ["21108001", "21108003"],
        updatedCodeValues: ["21108001", "21108003"],
      },
      {
        value: "debris",
        type: "MultiSelect",
        dropdownPosition: [1, 3],
        codeValues: ["9100", "9102"],
        updatedCodeValues: ["9100", "9102"],
      },
      {
        value: "color",
        type: "MultiSelect",
        dropdownPosition: [1, 3],
        codeValues: ["21112001", "21112003"],
        updatedCodeValues: ["21112003"],
      },
    ];

    // set values to multiselects
    multiSelectAttributes.forEach(attribute => {
      toggleMultiSelect(attribute.value, attribute.dropdownPosition);
    });

    // verify values
    multiSelectAttributes.forEach(attribute => {
      evaluateMultiSelect(attribute.value, attribute.codeValues);
    });

    cancelEditing();
    handlePrompt("There are unsaved changes. Do you want to discard all changes?", "Cancel");
    cancelEditing();
    multiSelectAttributes.forEach(attribute => {
      evaluateMultiSelect(attribute.value, attribute.codeValues);
    });
    handlePrompt("There are unsaved changes. Do you want to discard all changes?", "Discard changes");

    // verify all inputs have been reset
    cy.get('[data-cy="styled-layer-0"] [data-testid="ModeEditIcon"]').click();
    multiSelectAttributes.forEach(attribute => {
      evaluateMultiSelect(attribute.value, []);
    });

    // set values to multiselects again
    multiSelectAttributes.forEach(attribute => {
      toggleMultiSelect(attribute.value, attribute.dropdownPosition);
    });

    saveForm();
    getElementByDataCy("styled-layer-0").should("contain", "beige, dark brown");
    cy.get('[data-cy="styled-layer-0"] [data-testid="ModeEditIcon"]').click();

    // remove some chips
    getElementByDataCy("remove-beige-chip").click();
    getElementByDataCy("remove-cubic-chip").click();
    getElementByDataCy("remove-sharp-chip").click();

    // verify updated code values
    multiSelectAttributes.forEach(attribute => {
      evaluateMultiSelect(attribute.value, attribute.updatedCodeValues);
    });
    saveForm();
    getElementByDataCy("styled-layer-0").should("contain", "dark brown");
    stopBoreholeEditing();
    getElementByDataCy("styled-layer-0").should("contain", "dark brown");
    cy.get('[data-cy="styled-layer-0"]').click();
    // verify chips are still visible when not editing
    multiSelectAttributes.forEach(attribute => {
      evaluateMultiSelect(attribute.value, attribute.updatedCodeValues);
    });
  });

  it("updates layer form values when changing layer", () => {
    goToRouteAndAcceptTerms(`/`);
    showTableAndWaitForData();
    clickOnNextPage();
    waitForTableData();
    clickOnRowWithText("Anibal Conroy");
    getElementByDataCy("stratigraphy-menu-item").click();
    getElementByDataCy("lithology-menu-item").click();

    // click on layer and verify form values
    getElementByDataCy("styled-layer-8").should("contain", "gneiss, sedimentary, clayey gravel, medium, brown, beige");
    getElementByDataCy("styled-layer-8").click();
    evaluateInput("fromDepth", "80");
    evaluateInput("toDepth", "90");
    evaluateSelectText("descriptionQualityId", "good", false);
    evaluateMultiSelect("grain_shape", ["21110003"]);
    evaluateYesNoSelect("striae", "No");
    evaluateInput("notes", "hacking Analyst Investment Account index");

    // click on different layer and verify values are updated
    getElementByDataCy("styled-layer-7").should(
      "contain",
      "rock, gabbroic, artificial landfill, coarse, dark green, light green",
    );
    getElementByDataCy("styled-layer-7").click();
    evaluateInput("fromDepth", "70");
    evaluateInput("toDepth", "80");
    evaluateSelectText("descriptionQualityId", "very good", false);
    evaluateMultiSelect("grain_shape", ["21110002"]);
    evaluateYesNoSelect("striae", "Yes");
    evaluateInput("notes", "full-range circuit Cambridgeshire Senior");
  });
});
