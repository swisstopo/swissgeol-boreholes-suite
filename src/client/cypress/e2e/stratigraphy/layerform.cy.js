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
  newEditableBorehole,
  returnToOverview,
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
    type: "TextArea",
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
  it.only("updates the layer form and saves", () => {
    function evaluateInitialFormState() {
      layerAttributes.forEach(attribute => {
        // if (attribute.type === "MultiSelect") {
        //   evaluateMultiSelect(attribute.value, attribute.initial);
        // }
        if (attribute.type === "Select") {
          evaluateSelectText(attribute.value, attribute.initial);
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

    function evaluateUpdatedFormState() {
      layerAttributes.forEach(attribute => {
        if (attribute.updated) {
          // if (attribute.type === "MultiSelect") {
          //   evaluateMultiSelect(attribute.value, attribute.updated);
          // }
          if (attribute.type === "Select") {
            evaluateSelectText(attribute.value, attribute.updated);
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
    getElementByDataCy("styled-layer-8").click();
    cy.get(".loading-indicator").should("not.exist");
    cy.get(".MuiCircularProgress-root").should("not.exist");
    getElementByDataCy("show-all-fields-switch").click();
    resetUpdatedValues(); // remove later
    saveForm(); // remove later
    cy.wait("@update-layer"); // remove later
    evaluateInitialFormState();

    // change some inputs then cancel
    updateInputsForEachType();
    evaluateUpdatedFormState();
    cancelEditing();
    evaluateInitialFormState();

    // change some inputs then save
    updateInputsForEachType();
    saveForm();
    cy.wait("@update-layer");
    evaluateUpdatedFormState();

    // assert updated formvalues presist after saving
    stopBoreholeEditing();
    getElementByDataCy("styled-layer-8").click();
    cy.get(".loading-indicator").should("not.exist");
    cy.get(".MuiCircularProgress-root").should("not.exist");
    evaluateUpdatedFormState();

    // reset form values
    startBoreholeEditing();
    getElementByDataCy("styled-layer-8").click();
    cy.get(".loading-indicator").should("not.exist");
    cy.get(".MuiCircularProgress-root").should("not.exist");
    getElementByDataCy("show-all-fields-switch").click();
    resetUpdatedValues();
    evaluateInitialFormState();
    saveForm();

    // assert updated formvalues presist after saving
    stopBoreholeEditing();
    getElementByDataCy("styled-layer-8").click();
    cy.get(".loading-indicator").should("not.exist");
    cy.get(".MuiCircularProgress-root").should("not.exist");
    evaluateInitialFormState();
  });

  it("creates a layer and fills all dropdowns with multiple selection.", () => {
    goToRouteAndAcceptTerms(`/`);
    // create boreholes
    newEditableBorehole().as("borehole_id");

    // navigate to stratigraphy
    getElementByDataCy("stratigraphy-menu-item").click();
    getElementByDataCy("lithology-menu-item").click();
    addItem("addStratigraphy");
    cy.wait("@stratigraphy_POST");
    getElementByDataCy("add-layer-icon").click();
    cy.wait("@layer");

    cy.get('[data-cy="styled-layer-0"] [data-testid="ModeEditIcon"]').click();
    cy.wait("@get-layer-by-id");

    const multiSelectAttributes = [
      {
        value: "uscs_3",
        type: "MultiSelect",
        dropdownPosition: [1, 3],
        codeValues: ["23101001", "23101003"],
      },
      {
        value: "grain_shape",
        type: "MultiSelect",
        dropdownPosition: [1, 3],
        codeValues: ["21110002", "21110004"],
      },
      {
        value: "grain_granularity",
        type: "MultiSelect",
        dropdownPosition: [1, 3],
        codeValues: ["21115001", "21115004"],
      },
      {
        value: "organic_component",
        type: "MultiSelect",
        dropdownPosition: [1, 3],
        codeValues: ["21108001", "21108003"],
      },
      {
        value: "debris",
        type: "MultiSelect",
        dropdownPosition: [1, 3],
        codeValues: ["9100", "9102"],
      },
      {
        value: "color",
        type: "MultiSelect",
        dropdownPosition: [1, 3],
        codeValues: ["21112001", "21112003"],
      },
    ];

    multiSelectAttributes.forEach(attribute => {
      toggleMultiSelect(attribute.value, attribute.dropdownPosition);
    });

    multiSelectAttributes.forEach(attribute => {
      evaluateMultiSelect(attribute.value, attribute.codeValues);
    });

    // click reset on all multiselect dropdowns
    multiSelectAttributes.forEach(attribute => {
      toggleMultiSelect(attribute.value, [0]);
    });

    // verify that the dropdowns are reset
    multiSelectAttributes.forEach(attribute => {
      evaluateMultiSelect(attribute.value, []);
    });

    cy.get('[data-cy="styled-layer-0"] [data-testid="ClearIcon"]').click();

    // stop editing
    stopBoreholeEditing();
    returnToOverview();
  });

  it("updates form values when changing layer", () => {});
});
