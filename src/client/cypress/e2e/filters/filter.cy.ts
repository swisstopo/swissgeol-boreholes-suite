import { hasPagination, showTableAndWaitForData, verifyPaginationText } from "../helpers/dataGridHelpers";
import {
  checkFilterChipExistsAndRemove,
  clickDomainButtonByIndex,
  clickYesNoButton,
  openFilter,
  removeFirstMultiselectChip,
  setAutocompleteText,
} from "../helpers/filterHelpers.ts";
import { setInput } from "../helpers/formHelpers";
import { createBorehole, goToRouteAndAcceptTerms } from "../helpers/testHelpers";

function testYesNoFilter(
  title: string,
  filterSection: string,
  fieldName: string,
  option: string,
  expectedCount: string,
) {
  it(`filters boreholes by ${title}`, () => {
    openFilter(filterSection);
    clickYesNoButton(fieldName, option);
    cy.dataCy("boreholes-number-preview").should("have.text", expectedCount);
    checkFilterChipExistsAndRemove(fieldName);
  });
}

function testInputFilter(
  title: string,
  filterSection: string,
  fieldName: string,
  value: string,
  expectedCount: string,
) {
  it(`filters boreholes by ${title}`, () => {
    openFilter(filterSection);
    setAutocompleteText(fieldName, value);
    cy.wait("@borehole_filter");
    cy.dataCy("boreholes-number-preview").should("have.text", expectedCount);
    checkFilterChipExistsAndRemove(fieldName);
  });
}

function testSelectFilter(
  title: string,
  filterSection: string,
  fieldName: string,
  optionIndex: number,
  expectedCount: string,
) {
  it(`filters boreholes by ${title}`, () => {
    openFilter(filterSection);
    clickDomainButtonByIndex(fieldName, optionIndex);
    cy.dataCy("boreholes-number-preview").should("have.text", expectedCount);
    cy.get(`[data-cy^="filter-chip-${fieldName}-"]`).should("have.length.at.least", 1);
    removeFirstMultiselectChip(fieldName);
    cy.get(`[data-cy^="filter-chip-${fieldName}-"]`).should("not.exist");
  });
}

function testLargeSelectFilter(
  title: string,
  filterSection: string,
  fieldName: string,
  options: string[],
  expectedCount: string,
) {
  it(`filters boreholes by ${title}`, () => {
    openFilter(filterSection);
    const selector = `[data-cy="${fieldName}-formSelect"]`;
    cy.get(selector).scrollIntoView();
    cy.get(selector).click();
    options.forEach(option => {
      cy.contains(option).click();
      cy.wait("@borehole_filter");
    });
    cy.get("body").click(0, 0);
    cy.dataCy("boreholes-number-preview").should("have.text", expectedCount);
    cy.get(`[data-cy^="filter-chip-${fieldName}-"]`).should("have.length", options.length);
    options.forEach(() => removeFirstMultiselectChip(fieldName));
    cy.get(`[data-cy^="filter-chip-${fieldName}-"]`).should("not.exist");
  });
}

describe("Search filter tests", () => {
  it("has search filters", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Filters");
    cy.dataCy("boreholes-number-preview").should("have.text", "3'000");
  });

  // ─── STATUS FILTER ─────────────────────────────────────────────────────────

  it("filters boreholes by workflow status", () => {
    openFilter("Workflow status");
    cy.dataCy("boreholes-number-preview").should("have.text", "3'000");
    cy.dataCy("workflow-status-button-Draft").should("contain", "3000");
    cy.dataCy("workflow-status-button-Reviewed").should("contain", "0");
    cy.dataCy("workflow-status-button-Reviewed").should("be.disabled");

    cy.dataCy("workflow-status-button-Draft").click();
    cy.dataCy("boreholes-number-preview").should("have.text", "3'000");
    cy.dataCy("filter-chip-workflowStatus-Draft").should("exist");

    // Toggling Draft off clears the workflowStatus filter entirely.
    cy.dataCy("workflow-status-button-Draft").click();
    cy.dataCy("filter-chip-workflowStatus-Draft").should("not.exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "3'000");
  });

  // ─── WORKGROUP FILTER ──────────────────────────────────────────────────────

  it("filters boreholes by workgroup", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    showTableAndWaitForData();
    cy.contains("Workgroup").click();
    cy.dataCy("boreholes-number-preview").should("have.text", "3'000");
    cy.get('[data-cy^="filter-chip-workgroupId-"]').should("not.exist");
    cy.dataCy("workgroup-button-1").click();
    cy.dataCy("filter-chip-workgroupId-1").should("exist");
    cy.dataCy("boreholes-number-preview").should("exist");

    // Clicking the same button again toggles the selection off
    cy.dataCy("workgroup-button-1").click();
    cy.get('[data-cy^="filter-chip-workgroupId-"]').should("not.exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "3'000");
  });

  // ─── BOREHOLE FILTERS ──────────────────────────────────────────────────────
  it("filters boreholes by national interest", () => {
    createBorehole({ originalName: "NI test 1", nationalInterest: false }).as("bh1");
    createBorehole({ originalName: "NI test 2", nationalInterest: false }).as("bh2");
    createBorehole({ originalName: "NI test 3", nationalInterest: false }).as("bh3");
    createBorehole({ originalName: "NI test 4", nationalInterest: null }).as("bh4");

    openFilter("Borehole");

    clickYesNoButton("nationalInterest", "Yes");
    showTableAndWaitForData();
    verifyPaginationText("1–100 of 300");
    cy.dataCy("boreholes-number-preview").should("have.text", "300");
    cy.dataCy("filter-chip-nationalInterest").should("exist");

    clickYesNoButton("nationalInterest", "Not specified");
    hasPagination(false);
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy("filter-chip-nationalInterest").should("exist");

    clickYesNoButton("nationalInterest", "No");
    verifyPaginationText("1–100 of 2703");
    cy.dataCy("boreholes-number-preview").should("have.text", "2'703");
    checkFilterChipExistsAndRemove("nationalInterest");
    verifyPaginationText("1–100 of 3004");
    cy.dataCy("boreholes-number-preview").should("have.text", "3'004");
  });

  testInputFilter("original name", "Borehole", "originalName", "Abigail", "1");
  testInputFilter("project name", "Borehole", "projectName", "Intuitive", "1");
  testInputFilter("alternate name", "Borehole", "name", "Eric", "1");

  testSelectFilter("restriction", "Borehole", "restrictionId", 0, "376");

  it("filters boreholes by restriction date range", () => {
    openFilter("Borehole");
    setInput("restrictionUntilFrom", "2021-01-01");
    cy.wait("@borehole_filter");
    cy.location().its("search").should("contain", "2021-01-01");
    cy.dataCy("filter-chip-restrictionUntilFrom").should("exist");
    cy.dataCy("boreholes-number-preview").should("exist");

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    setInput("restrictionUntilTo", "2022-01-31");
    cy.wait("@borehole_filter");
    cy.location().its("search").should("contain", "2022-01-31");
    cy.dataCy("boreholes-number-preview").should("have.text", "126");
    checkFilterChipExistsAndRemove("restrictionUntilFrom");
    checkFilterChipExistsAndRemove("restrictionUntilTo");
  });

  it("filters boreholes by total depth range", () => {
    openFilter("Borehole");
    setInput("totalDepthMin", "800");
    cy.dataCy("boreholes-number-preview").should("have.text", "1'800");
    checkFilterChipExistsAndRemove("totalDepthMin");
    setInput("totalDepthMax", "1000");
    cy.dataCy("boreholes-number-preview").should("have.text", "1'499");
    checkFilterChipExistsAndRemove("totalDepthMax");
  });

  it("filters boreholes by top bedrock fresh md range", () => {
    openFilter("Borehole");
    setInput("topBedrockFreshMdMin", "700");
    cy.dataCy("filter-chip-topBedrockFreshMdMin").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "851");
    setInput("topBedrockFreshMdMax", "710");
    cy.dataCy("boreholes-number-preview").should("have.text", "30");
    checkFilterChipExistsAndRemove("topBedrockFreshMdMax");
    cy.dataCy("boreholes-number-preview").should("have.text", "851");
  });

  it("filters boreholes by top bedrock weathered md range", () => {
    openFilter("Borehole");
    setInput("topBedrockWeatheredMdMin", "1");
    cy.dataCy("boreholes-number-preview").should("have.text", "1'448");
    checkFilterChipExistsAndRemove("topBedrockWeatheredMdMin");
    setInput("topBedrockWeatheredMdMax", "920");
    cy.dataCy("filter-chip-topBedrockWeatheredMdMax").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "2'855");
  });

  testSelectFilter("borehole type", "Borehole", "typeId", 0, "171");
  testLargeSelectFilter("purpose", "Borehole", "purposeId", ["hydrocarbon exploration", "mineral resources"], "233");
  testSelectFilter("borehole status", "Borehole", "statusId", 2, "314");

  testYesNoFilter("groundwater", "Borehole", "hasGroundwater", "Not specified", "601");
  testYesNoFilter("top bedrock intersected", "Borehole", "topBedrockIntersected", "No", "1'209");
  testYesNoFilter("geometry available", "Borehole", "hasGeometry", "Yes", "100");

  // ─── LOG FILTER ────────────────────────────────────────────────────────────

  testYesNoFilter("logs available", "LOG", "hasLogs", "Yes", "101");

  // ─── ATTACHMENT FILTERS ────────────────────────────────────────────────────

  testYesNoFilter("profiles available", "Attachments", "hasProfiles", "No", "2'912");
  testYesNoFilter("photos available", "Attachments", "hasPhotos", "Yes", "71");

  it("filters boreholes by documents available and resets filters", () => {
    openFilter("Attachments");
    clickYesNoButton("hasDocuments", "No");
    cy.dataCy("boreholes-number-preview").should("have.text", "2'930");
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy(`filter-chip-hasDocuments`).should("exist");
    cy.dataCy("reset-filter-button").click();
    cy.dataCy(`filter-chip-hasDocuments`).should("not.exist");
  });

  it("shows autocomplete suggestions and commits a selection for originalName", () => {
    openFilter("Borehole");
    cy.dataCy("originalName-formInput").click();
    cy.dataCy("originalName-formInput").type("Ra");
    cy.get('[data-cy^="originalName-suggestion-"]').should("have.length.at.least", 1);
    cy.get('[data-cy^="originalName-suggestion-"]').first().click();
    cy.dataCy("boreholes-number-preview").invoke("text").should("not.equal", "3'000");
    checkFilterChipExistsAndRemove("originalName");
  });

  it("does not fetch suggestions for a single character", () => {
    cy.intercept("GET", "/api/v2/borehole/suggest*").as("suggestRequest");
    openFilter("Borehole");
    cy.dataCy("originalName-formInput").click();
    cy.dataCy("originalName-formInput").type("a");
    // Wait past the debounce window (300ms) to be sure no call fired
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    cy.get("@suggestRequest.all").should("have.length", 0);
  });

  it("toggles button selections for restrictionId (< 10 options)", () => {
    openFilter("Borehole");
    cy.get('[data-cy^="restrictionId-button-"]').eq(0).click();
    cy.get('[data-cy^="restrictionId-button-"]').eq(1).click();
    cy.get('[data-cy^="restrictionId-button-"].MuiButton-contained').should("have.length.at.least", 2);
    // Multiselect renders one chip per selected value.
    cy.get('[data-cy^="filter-chip-restrictionId-"]').should("have.length.at.least", 2);
    // Deselect one
    cy.get('[data-cy^="restrictionId-button-"]').eq(1).click();
    // Deselect the other → filter should clear
    cy.get('[data-cy^="restrictionId-button-"]').eq(0).click();
    cy.get('[data-cy^="filter-chip-restrictionId-"]').should("not.exist");
  });

  it("multiselect filter chips show selected values and support per-value removal", () => {
    openFilter("Borehole");
    // Select two borehole status values. The status schema ("extended.status")
    // has < 10 options, so FilterDomainSelect renders them as toggle buttons
    // with data-cy="statusId-button-<codelistId>".
    cy.dataCy("statusId-button-22104001").click();
    cy.dataCy("statusId-button-22104002").click();

    // Two chips should render — one per selected value (not one combined chip).
    cy.get('[data-cy^="filter-chip-statusId-"]').should("have.length", 2);
    cy.dataCy("filter-chip-statusId-22104001").should("be.visible");
    cy.dataCy("filter-chip-statusId-22104002").should("be.visible");

    // URL reflects both selections.
    cy.location("search").should("contain", "statusId=22104001");
    cy.location("search").should("contain", "22104002");

    // Delete the first chip — only that value should be removed.
    checkFilterChipExistsAndRemove("statusId-22104001");

    cy.get('[data-cy^="filter-chip-statusId-"]').should("have.length", 1);
    cy.dataCy("filter-chip-statusId-22104002").should("be.visible");

    // The toggle button for the removed status is no longer selected;
    // the still-active status keeps its selected (contained) state.
    cy.dataCy("statusId-button-22104001").should("not.have.class", "MuiButton-contained");
    cy.dataCy("statusId-button-22104002").should("have.class", "MuiButton-contained");

    // URL keeps the remaining selection and drops the removed one.
    cy.location("search").should("contain", "statusId=22104002");
    cy.location("search").should("not.contain", "statusId=22104001");

    // Delete the last remaining chip — filter is fully cleared.
    checkFilterChipExistsAndRemove("statusId-22104002");

    cy.get('[data-cy^="filter-chip-statusId-"]').should("not.exist");
    cy.dataCy("statusId-button-22104002").should("not.have.class", "MuiButton-contained");
    cy.location("search").should("not.contain", "statusId=");
  });
});
