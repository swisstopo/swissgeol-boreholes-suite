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
  evaluateSelect,
  evaluateTextarea,
  evaluateYesNoSelect,
  setInput,
  setSelect,
  setYesNoSelect,
  toggleMultiSelect,
} from "../helpers/formHelpers.js";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers.js";
import {
  getElementByDataCy,
  goToDetailRouteAndAcceptTerms,
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
    initial: "",
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
    initial: "",
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

function clickOnLayerAndWaitForForm(number) {
  getElementByDataCy(`styled-layer-${number}`).click();
  cy.wait("@get-layer-by-id");
  cy.get(".loading-indicator").should("not.exist");
  cy.get(".MuiCircularProgress-root").should("not.exist");
  getElementByDataCy("show-all-fields-switch").click();
}

function saveLayerForm() {
  saveForm();
  cy.wait(["@update-layer", "@get-layers-by-profileId", "@layer"]);
}

describe("Tests for the layer form.", () => {
  it("updates the layer form and saves", () => {
    function evaluateInitialFormState(editable) {
      layerAttributes.forEach(attribute => {
        if (attribute.type === "MultiSelect") {
          evaluateMultiSelect(attribute.value, attribute.initial);
        }
        if (attribute.type === "Select") {
          evaluateSelect(attribute.value, attribute.initial, null, editable);
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
            evaluateSelect(attribute.value, attribute.updated, null, editable);
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
    cy.wait(["@borehole_by_id", "@borehole_by_id"]);
    startBoreholeEditing();
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    getElementByDataCy("styled-layer-8").should("contain", "marble, gravel, fine-medium-coarse");
    clickOnLayerAndWaitForForm("8");
    resetUpdatedValues();
    saveLayerForm();
    getElementByDataCy("styled-layer-8").should("contain", "marble, gravel, fine-medium-coarse");
    clickOnLayerAndWaitForForm("8");
    evaluateInitialFormState(true);

    // change some inputs then discard changes
    updateInputsForEachType();
    evaluateUpdatedFormState(true);
    cancelEditing();
    handlePrompt("There are unsaved changes. Do you want to discard all changes?", "cancel");
    cancelEditing();
    evaluateUpdatedFormState(true);
    handlePrompt("There are unsaved changes. Do you want to discard all changes?", "discardchanges");
    getElementByDataCy("styled-layer-8").should("contain", "marble, gravel, fine-medium-coarse");
    clickOnLayerAndWaitForForm("8");
    evaluateInitialFormState(true);

    // change some inputs then save
    updateInputsForEachType();
    saveLayerForm();
    getElementByDataCy("styled-layer-9").should("contain", "marble, gravel, fine-medium-coarse");
    clickOnLayerAndWaitForForm("9");
    evaluateUpdatedFormState(true);

    // assert updated form values persist after saving
    stopBoreholeEditing(); // layer 9 stays open when editing is stopped
    evaluateUpdatedFormState(false);

    // reset form values
    startBoreholeEditing();
    resetUpdatedValues();
    evaluateInitialFormState(true);
    saveLayerForm();
    getElementByDataCy("show-all-fields-switch").should("not.exist");

    // assert updated form values persist after saving
    stopBoreholeEditing();
    getElementByDataCy("styled-layer-8").should("contain", "marble, gravel, fine-medium-coarse");
    clickOnLayerAndWaitForForm("8");
    evaluateInitialFormState(false);
  });

  it("creates a layer and fills all dropdowns with multiple selection.", () => {
    goToRouteAndAcceptTerms(`/`);
    newEditableBorehole().as("borehole_id");
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    addItem("addEmptyStratigraphy");
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
    handlePrompt("There are unsaved changes. Do you want to discard all changes?", "cancel");
    cancelEditing();
    multiSelectAttributes.forEach(attribute => {
      evaluateMultiSelect(attribute.value, attribute.codeValues);
    });
    handlePrompt("There are unsaved changes. Do you want to discard all changes?", "discardchanges");

    // verify all inputs have been reset
    cy.get('[data-cy="styled-layer-0"] [data-testid="ModeEditIcon"]').click();
    cy.wait("@get-layer-by-id");
    multiSelectAttributes.forEach(attribute => {
      evaluateMultiSelect(attribute.value, []);
    });

    // set values to multiselects again
    multiSelectAttributes.forEach(attribute => {
      toggleMultiSelect(attribute.value, attribute.dropdownPosition);
    });

    saveLayerForm();
    getElementByDataCy("styled-layer-0").should("contain", "beige, dark brown");
    cy.get('[data-cy="styled-layer-0"] [data-testid="ModeEditIcon"]').click();
    cy.wait("@get-layer-by-id");

    // remove some chips
    getElementByDataCy("remove-beige-chip").click();
    getElementByDataCy("remove-cubic-chip").click();
    getElementByDataCy("remove-sharp-chip").click();

    // verify updated code values
    multiSelectAttributes.forEach(attribute => {
      evaluateMultiSelect(attribute.value, attribute.updatedCodeValues);
    });
    saveLayerForm();
    getElementByDataCy("styled-layer-0").should("contain", "dark brown");
    stopBoreholeEditing();
    getElementByDataCy("styled-layer-0").should("contain", "dark brown");
    getElementByDataCy("styled-layer-0").click();
    cy.wait("@get-layer-by-id");
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
    clickOnNextPage();
    waitForTableData();
    clickOnRowWithText("Anibal Conroy");
    navigateInSidebar(SidebarMenuItem.stratigraphy);

    // click on layer and verify form values
    getElementByDataCy("styled-layer-8").should("contain", "gneiss, sedimentary, clayey gravel, medium, brown, beige");
    clickOnLayerAndWaitForForm("8");
    evaluateInput("fromDepth", "80");
    evaluateInput("toDepth", "90");
    evaluateSelect("descriptionQualityId", "good", null, false);
    evaluateMultiSelect("grain_shape", ["21110003"]);
    evaluateYesNoSelect("isStriae", "No");
    evaluateInput("notes", "hacking Analyst Investment Account index");

    // click on different layer and verify values are updated
    getElementByDataCy("styled-layer-7").should(
      "contain",
      "rock, gabbroic, artificial landfill, coarse, dark green, light green",
    );
    clickOnLayerAndWaitForForm("7");
    evaluateInput("fromDepth", "70");
    evaluateInput("toDepth", "80");
    evaluateSelect("descriptionQualityId", "very good", null, false);
    evaluateMultiSelect("grain_shape", ["21110002"]);
    evaluateYesNoSelect("isStriae", "Yes", false);
    evaluateInput("notes", "full-range circuit Cambridgeshire Senior");
  });

  it("saves zero values in number inputs", () => {
    goToDetailRouteAndAcceptTerms(`/1001947`);
    startBoreholeEditing();
    navigateInSidebar(SidebarMenuItem.stratigraphy);

    const evaluateInitialDepthValues = () => {
      evaluateInput("fromDepth", "0");
      evaluateInput("toDepth", "10");
    };
    // click on layer and verify form values
    clickOnLayerAndWaitForForm("0");
    evaluateInitialDepthValues();
    // change anything then save
    setSelect("grainSize1Id", 4);
    evaluateInitialDepthValues();
    saveLayerForm();
    clickOnLayerAndWaitForForm("0");

    evaluateInitialDepthValues();
    setInput("fromDepth", "1");
    saveLayerForm();
    clickOnLayerAndWaitForForm("0");

    evaluateInput("fromDepth", "1");
    evaluateInput("toDepth", "10");
    setInput("fromDepth", "0");
    saveLayerForm();
    clickOnLayerAndWaitForForm("0");

    evaluateInitialDepthValues();
    stopBoreholeEditing();
  });
});
