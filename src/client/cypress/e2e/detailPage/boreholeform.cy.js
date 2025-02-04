import { discardChanges, saveWithSaveBar } from "../helpers/buttonHelpers";
import { clickOnRowWithText, showTableAndWaitForData, sortBy } from "../helpers/dataGridHelpers";
import {
  evaluateBooleanSelect,
  evaluateInput,
  evaluateSelect,
  evaluateTextarea,
  isDisabled,
  setBooleanSelect,
  setInput,
  setSelect,
} from "../helpers/formHelpers";
import {
  createBorehole,
  getElementByDataCy,
  goToRouteAndAcceptTerms,
  handlePrompt,
  newEditableBorehole,
  returnToOverview,
  startBoreholeEditing,
} from "../helpers/testHelpers";

function ensureEditingDisabled() {
  cy.get('[data-cy="edit-button"]').should("exist");
  cy.get('[data-cy="editingstop-button"]').should("not.exist");
}

function ensureEditingEnabled() {
  cy.get('[data-cy="edit-button"]').should("not.exist");
  cy.get('[data-cy="editingstop-button"]').should("exist");
}

describe("Test for the borehole form.", () => {
  it("Creates a borehole and fills dropdowns.", () => {
    goToRouteAndAcceptTerms(`/`);
    // create boreholes
    newEditableBorehole().as("borehole_id");

    // fills and evaluates all mui dropdowns on location tab (identifiers are tested separately)
    setSelect("restrictionId", 2);
    isDisabled("restrictionUntil", true);
    setSelect("restrictionId", 3);
    isDisabled("restrictionUntil", false);
    setBooleanSelect("nationalInterest", null); // not specified
    setSelect("originalReferenceSystem", 0);
    setSelect("locationPrecisionId", 2);
    setSelect("elevationPrecisionId", 2);
    setSelect("referenceElevationPrecisionId", 2);
    setSelect("referenceElevationTypeId", 4);

    evaluateSelect("restrictionId", "20111003");
    evaluateSelect("nationalInterest", "2");
    evaluateSelect("originalReferenceSystem", "20104001");
    evaluateSelect("locationPrecisionId", "20113002");
    evaluateSelect("elevationPrecisionId", "20114002");
    evaluateSelect("referenceElevationPrecisionId", "20114002");
    evaluateSelect("referenceElevationTypeId", "20117004");

    saveWithSaveBar();
    // navigate away and back to check if values are saved
    cy.get('[data-cy="borehole-menu-item"]').click();
    cy.get('[data-cy="location-menu-item"]').click();
    evaluateSelect("restrictionId", "20111003");
    evaluateSelect("nationalInterest", "2");
    evaluateSelect("originalReferenceSystem", "20104001");
    evaluateSelect("locationPrecisionId", "20113002");
    evaluateSelect("elevationPrecisionId", "20114002");
    evaluateSelect("referenceElevationPrecisionId", "20114002");
    evaluateSelect("referenceElevationTypeId", "20117004");

    // fill all dropdowns on borehole tab
    cy.get('[data-cy="borehole-menu-item"]').click();
    setSelect("purposeId", 1);
    setSelect("typeId", 1);
    setSelect("depthPrecisionId", 1);
    setSelect("statusId", 1);

    evaluateSelect("purposeId", "22103001");
    evaluateSelect("typeId", "20101001");
    evaluateSelect("depthPrecisionId", "22108001");
    evaluateSelect("statusId", "22104001");

    saveWithSaveBar();

    // navigate away and back to check if values are saved
    cy.get('[data-cy="location-menu-item"]').click();
    cy.get('[data-cy="borehole-menu-item"]').click();

    evaluateSelect("purposeId", "22103001");
    evaluateSelect("typeId", "20101001");
    evaluateSelect("depthPrecisionId", "22108001");
    evaluateSelect("statusId", "22104001");
  });

  it("Fills all inputs on borehole tab and saves", () => {
    createBorehole({ "extended.original_name": "AAA_Ferret", "custom.alternate_name": "AAA_Ferret" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}/borehole`);
      startBoreholeEditing();

      setSelect("purposeId", 1);
      setSelect("typeId", 1);
      setSelect("depthPrecisionId", 1);
      setSelect("statusId", 1);
      setSelect("lithologyTopBedrockId", 1);
      setSelect("lithostratigraphyTopBedrockId", 1);
      setSelect("chronostratigraphyTopBedrockId", 1);
      setBooleanSelect("hasGroundwater", true);
      setBooleanSelect("topBedrockIntersected", false);

      setInput("totalDepth", 700);
      setInput("topBedrockFreshMd", 0.60224);
      setInput("topBedrockWeatheredMd", 78945100);
      setInput("remarks", "This is a test remark");

      // navigate away is blocked before saving
      getElementByDataCy("location-menu-item").click();

      const messageUnsavedChanges = "There are unsaved changes. Do you want to discard all changes?";
      handlePrompt(messageUnsavedChanges, "cancel");

      saveWithSaveBar();
      getElementByDataCy("location-menu-item").click();
      cy.contains("Boreholes.swissgeol.ch ID");
      getElementByDataCy("borehole-menu-item").click();
      evaluateSelect("lithostratigraphyTopBedrockId", "15300583");
      evaluateSelect("chronostratigraphyTopBedrockId", "15001001");
      cy.contains("Bodensee-Nagelfluh").should("exist");
      cy.contains("Phanerozoic").should("exist");
    });
  });

  it("Updates topbedrock intersected when top bedrock values change", () => {
    createBorehole({ "extended.original_name": "AAA_Ferret", "custom.alternate_name": "AAA_Ferret" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}/borehole`);
      startBoreholeEditing();

      // updated top bedrock intersected when top bedrock values change
      evaluateBooleanSelect("topBedrockIntersected", null); // not specified
      setInput("topBedrockFreshMd", 897);
      evaluateBooleanSelect("topBedrockIntersected", true);
      setInput("topBedrockFreshMd", " ");
      evaluateBooleanSelect("topBedrockIntersected", null);
      setInput("topBedrockWeatheredMd", 564);
      evaluateBooleanSelect("topBedrockIntersected", true);
      saveWithSaveBar();

      // navigate away and return
      getElementByDataCy("location-menu-item").click();
      getElementByDataCy("borehole-menu-item").click();
      evaluateBooleanSelect("topBedrockIntersected", true);

      // can save value for top bedrock intersected which does not correspond to automatically set values
      setBooleanSelect("topBedrockIntersected", false);
      saveWithSaveBar();
      // navigate away and return
      getElementByDataCy("location-menu-item").click();
      getElementByDataCy("borehole-menu-item").click();
      evaluateBooleanSelect("topBedrockIntersected", false);
      evaluateInput("topBedrockFreshMd", "");
      evaluateInput("topBedrockFreshMd", "");
      evaluateInput("topBedrockWeatheredMd", "564");
    });
  });

  it("Updates TVD Values when depth values change in boreholeform", () => {
    createBorehole({ "extended.original_name": "AAA_Penguin", "custom.alternate_name": "AAA_Penguin" }).as(
      "borehole_id",
    );
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}/borehole`);
      startBoreholeEditing();
      evaluateBooleanSelect("topBedrockIntersected", null);
      setInput("totalDepth", 700);
      setInput("topBedrockFreshMd", 0.60224);
      setInput("topBedrockWeatheredMd", 78945100);

      evaluateInput("totalDepth", "700");
      evaluateInput("topBedrockFreshMd", "0.60224");
      evaluateInput("topBedrockWeatheredMd", "78'945'100");

      // in display only inputs the label is used for the data-cy instead of the field name
      evaluateInput("total_depth_tvd", "700");
      evaluateInput("top_bedrock_fresh_tvd", "0.6");
      evaluateInput("top_bedrock_weathered_tvd", "78'945'100");

      saveWithSaveBar();

      returnToOverview();
      showTableAndWaitForData();
      clickOnRowWithText("AAA_Penguin");
      cy.get('[data-cy="borehole-menu-item"]').click();
      evaluateInput("totalDepth", "700");
      evaluateInput("topBedrockFreshMd", "0.60224");
      evaluateInput("topBedrockWeatheredMd", "78'945'100");

      evaluateInput("total_depth_tvd", "700");
      evaluateInput("top_bedrock_fresh_tvd", "0.6");
      evaluateInput("top_bedrock_weathered_tvd", "78'945'100");
    });
  });

  it("Checks if form values are updated when borehole changes", () => {
    goToRouteAndAcceptTerms(`/`);
    showTableAndWaitForData();
    // sort by Name descending
    sortBy("Name");
    clickOnRowWithText("Zena Rath");

    evaluateInput("originalName", "Zena Rath");
    evaluateInput("name", "Zena Rath");
    evaluateInput("projectName", "Reactive asymmetric alliance");
    evaluateSelect("restrictionId", "");
    cy.get(`[data-cy="nationalInterest-formSelect"] input`).should("have.attr", "value", "0");
    evaluateSelect("originalReferenceSystem", "20104002"); // LV03
    evaluateSelect("locationPrecisionId", "20113005");

    evaluateInput("elevationZ", "3'519.948980314633");
    evaluateInput("referenceElevation", "3'554.9389396584306");
    evaluateSelect("elevationPrecisionId", "");
    evaluateSelect("referenceElevationPrecisionId", "20114007"); // not specified
    evaluateSelect("referenceElevationTypeId", "30000013"); // kelly bushing

    returnToOverview();
    clickOnRowWithText("Zena Mraz");
    evaluateInput("originalName", "Zena Mraz");
    evaluateInput("name", "Zena Mraz");
    evaluateInput("projectName", "Ergonomic heuristic installation");
    evaluateSelect("restrictionId", "");
    evaluateBooleanSelect("nationalInterest", true);
    evaluateSelect("originalReferenceSystem", "20104002"); // LV03
    evaluateSelect("locationPrecisionId", "20113007"); // not specified

    evaluateInput("elevationZ", "3'062.9991330499756");
    evaluateInput("referenceElevation", "3'478.1368118609007");
    evaluateSelect("elevationPrecisionId", "20114003"); // 1
    evaluateSelect("referenceElevationPrecisionId", "20114005"); //0.1
    evaluateSelect("referenceElevationTypeId", "30000013"); // kelly bushing
  });

  it("switches tabs", () => {
    let boreholeId;
    createBorehole({ "extended.original_name": "LSENALZE" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      boreholeId = id;
      goToRouteAndAcceptTerms(`/${id}/borehole`);
      cy.wait(["@borehole", "@borehole_by_id"]);
    });
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/borehole`);
      expect(location.hash).to.eq("#general");
    });

    cy.get('[data-cy="sections-tab"]').click();
    cy.wait("@get-sections-by-boreholeId");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/borehole`);
      expect(location.hash).to.eq("#sections");
    });

    cy.get('[data-cy="geometry-tab"]').click();
    cy.wait("@boreholegeometry_GET");
    cy.location().should(location => {
      expect(location.pathname).to.eq(`/${boreholeId}/borehole`);
      expect(location.hash).to.eq("#geometry");
    });
  });

  it("displays 0 in input fields", () => {
    // create borehole with 0 in all numeric inputs
    createBorehole({
      "extended.original_name": "AAA_RINO",
      "custom.alternate_name": "AAA_RINO",
      total_depth: 0,
      "extended.top_bedrock_fresh_md": 0.0,
      "custom.top_bedrock_weathered_md": 0.0,
      elevation_z: 0,
      reference_elevation: 0.0,
    }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}/location`);
      evaluateInput("elevationZ", "0");
      evaluateInput("referenceElevation", "0");

      getElementByDataCy("borehole-menu-item").click();

      evaluateInput("totalDepth", "0");
      evaluateInput("topBedrockWeatheredMd", "0");
      evaluateInput("topBedrockFreshMd", "0");

      evaluateInput("total_depth_tvd", "0");
      evaluateInput("top_bedrock_fresh_tvd", "0");
      evaluateInput("top_bedrock_weathered_tvd", "0");
    });
  });

  it("Resets borehole form values on reset button click", () => {
    createBorehole({ "extended.original_name": "AAA_EEL", "custom.alternate_name": "AAA_EEL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}/borehole`);
      startBoreholeEditing();
      setInput("totalDepth", 1234);
      setInput("topBedrockFreshMd", 5678);
      setInput("topBedrockWeatheredMd", 9101);
      setSelect("purposeId", 1);
      setSelect("typeId", 1);
      setSelect("depthPrecisionId", 1);
      setSelect("statusId", 1);
      setSelect("lithologyTopBedrockId", 1);
      setSelect("lithostratigraphyTopBedrockId", 1);
      setSelect("chronostratigraphyTopBedrockId", 1);
      setInput("remarks", "New remark");

      saveWithSaveBar();

      evaluateInput("totalDepth", "1'234");
      evaluateInput("topBedrockFreshMd", "5'678");
      evaluateInput("topBedrockWeatheredMd", "9'101");
      evaluateSelect("purposeId", "22103001");
      evaluateSelect("typeId", "20101001");
      evaluateSelect("depthPrecisionId", "22108001");
      evaluateSelect("statusId", "22104001");
      evaluateSelect("lithologyTopBedrockId", "15104449");
      evaluateSelect("lithostratigraphyTopBedrockId", "15300583");
      evaluateSelect("chronostratigraphyTopBedrockId", "15001001");
      evaluateTextarea("remarks", "New remark");

      // update values
      setInput("totalDepth", 100);
      setInput("topBedrockFreshMd", 100);
      setInput("topBedrockWeatheredMd", 100);
      setSelect("purposeId", 2);
      setSelect("typeId", 2);
      setSelect("depthPrecisionId", 2);
      setSelect("statusId", 2);
      setSelect("lithologyTopBedrockId", 2);
      setSelect("lithostratigraphyTopBedrockId", 2);
      setSelect("chronostratigraphyTopBedrockId", 2);
      setInput("remarks", "Updated remark");

      evaluateInput("totalDepth", "100");
      evaluateInput("topBedrockFreshMd", "100");
      evaluateInput("topBedrockWeatheredMd", "100");
      evaluateSelect("purposeId", "22103002");
      evaluateSelect("typeId", "30000307");
      evaluateSelect("depthPrecisionId", "22108002");
      evaluateSelect("statusId", "22104002");
      evaluateSelect("lithologyTopBedrockId", "15104450");
      evaluateSelect("lithostratigraphyTopBedrockId", "15300495");
      evaluateSelect("chronostratigraphyTopBedrockId", "15001002");
      evaluateTextarea("remarks", "Updated remark");

      discardChanges();

      evaluateInput("totalDepth", "1'234");
      evaluateInput("topBedrockFreshMd", "5'678");
      evaluateInput("topBedrockWeatheredMd", "9'101");
      evaluateSelect("purposeId", "22103001");
      evaluateSelect("typeId", "20101001");
      evaluateSelect("depthPrecisionId", "22108001");
      evaluateSelect("statusId", "22104001");
      evaluateSelect("lithologyTopBedrockId", "15104449");
      evaluateSelect("lithostratigraphyTopBedrockId", "15300583");
      evaluateSelect("chronostratigraphyTopBedrockId", "15001001");
      evaluateTextarea("remarks", "New remark");
    });
  });

  it("verifies textfield border color for editing enabled or disabled", () => {
    createBorehole({ "extended.original_name": "AAA_EEL", "custom.alternate_name": "AAA_EEL" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}/borehole`);
      cy.get('[data-cy="topBedrockWeatheredMd-formInput"] fieldset').should(
        "have.css",
        "border-color",
        "rgb(223, 228, 233)",
      ); //#DFE4E9

      cy.get('[data-cy="top_bedrock_weathered_tvd-formInput"] fieldset').should(
        "have.css",
        "border-color",
        "rgb(223, 228, 233)",
      ); // #DFE4E9

      startBoreholeEditing();

      cy.get('[data-cy="topBedrockWeatheredMd-formInput"] fieldset').should(
        "have.css",
        "border-color",
        "rgb(89, 105, 120)",
      ); // #596978

      cy.get('[data-cy="top_bedrock_weathered_tvd-formInput"] fieldset').should(
        "have.css",
        "border-color",
        "rgb(223, 228, 233)",
      ); // #DFE4E9 is not editable and should not change color
    });
  });

  it("stops editing when going back to overview", () => {
    createBorehole({ "extended.original_name": "AAA_HIPPOPOTHAMUS", "custom.alternate_name": "AAA_HIPPOPOTHAMUS" }).as(
      "borehole_id",
    );
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}`);
      ensureEditingDisabled();
      startBoreholeEditing();
      ensureEditingEnabled();
      returnToOverview(); // navigating with swissgeol back button stops editing
      showTableAndWaitForData();
      clickOnRowWithText("AAA_HIPPOPOTHAMUS");
      ensureEditingDisabled();
      startBoreholeEditing();
      goToRouteAndAcceptTerms(`/`); //  navigating with browser does not stop editing
      showTableAndWaitForData();
      clickOnRowWithText("AAA_HIPPOPOTHAMUS");
      ensureEditingEnabled();
    });
  });
});
