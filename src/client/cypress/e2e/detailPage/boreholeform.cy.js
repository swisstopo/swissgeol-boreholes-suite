import { exportItem, saveLocationForm } from "../helpers/buttonHelpers";
import { clickOnRowWithText, showTableAndWaitForData, sortBy } from "../helpers/dataGridHelpers";
import { evaluateInput, evaluateSelect, isDisabled, setInput, setSelect } from "../helpers/formHelpers";
import {
  createBorehole,
  deleteDownloadedFile,
  goToRouteAndAcceptTerms,
  handlePrompt,
  newEditableBorehole,
  readDownloadedFile,
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
    // create boreholes
    newEditableBorehole().as("borehole_id");

    // fills and evaluates all mui dropdowns on location tab (identifiers are tested separately)
    setSelect("restrictionId", 2);
    isDisabled("restrictionUntil", true);
    setSelect("restrictionId", 3);
    isDisabled("restrictionUntil", false);
    setSelect("nationalInterest", 2);
    setSelect("originalReferenceSystem", 0);
    setSelect("locationPrecisionId", 2);
    setSelect("elevationPrecisionId", 2);
    setSelect("qtReferenceElevationId", 2);
    setSelect("referenceElevationTypeId", 4);

    evaluateSelect("restrictionId", "20111003");
    evaluateSelect("nationalInterest", "2");
    evaluateSelect("originalReferenceSystem", "20104001");
    evaluateSelect("locationPrecisionId", "20113002");
    evaluateSelect("elevationPrecisionId", "20114002");
    evaluateSelect("qtReferenceElevationId", "20114002");
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
    evaluateSelect("qtReferenceElevationId", "20114002");
    evaluateSelect("referenceElevationTypeId", "20117004");

    // fill all dropdowns on borehole tab
    cy.get('[data-cy="borehole-menu-item"]').click();
    setSelect("purposeId", 1);
    setSelect("typeId", 1);
    setSelect("qtDepthId", 1);
    setSelect("statusId", 1);

    evaluateSelect("purposeId", "22103001");
    evaluateSelect("typeId", "20101001");
    evaluateSelect("qtDepthId", "22108001");
    evaluateSelect("statusId", "22104001");

    saveWithSaveBar();

    // navigate away and back to check if values are saved
    cy.get('[data-cy="location-menu-item"]').click();
    cy.get('[data-cy="borehole-menu-item"]').click();

    evaluateSelect("purposeId", "22103001");
    evaluateSelect("typeId", "20101001");
    evaluateSelect("qtDepthId", "22108001");
    evaluateSelect("statusId", "22104001");
  });

  it("Fills all inputs on borehole tab and saves", () => {
    createBorehole({ "extended.original_name": "AAA_Ferret", "custom.alternate_name": "AAA_Ferret" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}/borehole`);
      startBoreholeEditing();

      setSelect("purposeId", 1);
      setSelect("typeId", 1);
      setSelect("qtDepthId", 1);
      setSelect("statusId", 1);
      setSelect("lithologyTopBedrockId", 1);
      setSelect("lithostratigraphyId", 1);
      setSelect("chronostratigraphyId", 1);
      setSelect("hasGroundwater", 1);

      setInput("totalDepth", 700);
      setInput("topBedrockFreshMd", 0.60224);
      setInput("topBedrockWeatheredMd", 78945100);
      setInput("remarks", "This is a test remark");

      // navigate away is blocked before saving
      cy.get('[data-cy="location-menu-item"]').click();

      const messageUnsavedChanges = "There are unsaved changes. Do you want to discard all changes?";
      handlePrompt(messageUnsavedChanges, "cancel");

      saveWithSaveBar();
      cy.get('[data-cy="location-menu-item"]').click();
      cy.contains("Boreholes.swissgeol.ch ID");
    });
  });

  it("Updates TVD Values when depth values change in boreholeform", () => {
    createBorehole({ "extended.original_name": "AAA_Ferret", "custom.alternate_name": "AAA_Ferret" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}/borehole`);
      startBoreholeEditing();
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
      clickOnRowWithText("AAA_Ferret");
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
    showTableAndWaitForData();
    // sort by Name descending
    sortBy("Name");
    clickOnRowWithText("Zena Rath");

    evaluateInput("originalName", "Zena Rath");
    evaluateInput("alternateName", "Zena Rath");
    evaluateInput("projectName", "Reactive asymmetric alliance");
    evaluateSelect("restrictionId", "");
    cy.get(`[data-cy="nationalInterest-formSelect"] input`).should("have.attr", "value", "0");
    evaluateSelect("originalReferenceSystem", "20104002"); // LV03
    evaluateSelect("locationPrecisionId", "20113005");

    evaluateInput("elevationZ", "3'519.948980314633");
    evaluateInput("referenceElevation", "3'554.9389396584306");
    evaluateSelect("elevationPrecisionId", "");
    evaluateSelect("qtReferenceElevationId", "20114007"); // not specified
    evaluateSelect("referenceElevationTypeId", "30000013"); // kelly bushing

    returnToOverview();
    clickOnRowWithText("Zena Mraz");
    evaluateInput("originalName", "Zena Mraz");
    evaluateInput("alternateName", "Zena Mraz");
    evaluateInput("projectName", "Ergonomic heuristic installation");
    evaluateSelect("restrictionId", "");
    evaluateSelect("nationalInterest", "1"); // Yes
    evaluateSelect("originalReferenceSystem", "20104002"); // LV03
    evaluateSelect("locationPrecisionId", "20113007"); // not specified

    evaluateInput("elevationZ", "3'062.9991330499756");
    evaluateInput("referenceElevation", "3'478.1368118609007");
    evaluateSelect("elevationPrecisionId", "20114003"); // 1
    evaluateSelect("qtReferenceElevationId", "20114005"); //0.1
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

  it("Exports a borehole", () => {
    const boreholeAlternateName = "AAA_HIPPOPOTHAMUS";
    createBorehole({
      "extended.original_name": boreholeAlternateName,
      "custom.alternate_name": boreholeAlternateName,
    }).as("borehole_id");

    deleteDownloadedFile(`${boreholeAlternateName}.json`);

    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}`);
      ensureEditingDisabled();
      exportItem();
    });

    readDownloadedFile(`${boreholeAlternateName}.json`);
  });
});
