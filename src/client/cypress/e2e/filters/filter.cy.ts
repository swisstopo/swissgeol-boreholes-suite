import { hasPagination, showTableAndWaitForData, verifyPaginationText } from "../helpers/dataGridHelpers";
import {
  checkFilterChipExistsAndRemove,
  clickDomainButtonByIndex,
  clickYesNoButton,
  getYesNoButton,
  openFilter,
  removeFirstMultiSelectChip,
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
    if (Number(expectedCount) === 0) {
      getYesNoButton(fieldName, option).should("be.disabled");
    } else {
      clickYesNoButton(fieldName, option);
      cy.dataCy("boreholes-number-preview").should("have.text", expectedCount);
      checkFilterChipExistsAndRemove(fieldName);
    }
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
    removeFirstMultiSelectChip(fieldName);
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
    options.forEach(option => {
      cy.get(selector).scrollIntoView();
      cy.get(selector).click();
      cy.get(`[data-cy^="${fieldName}-option-"]`).contains(option).click();
      cy.wait("@borehole_filter");
    });
    cy.dataCy("boreholes-number-preview").should("have.text", expectedCount);
    cy.get(`[data-cy^="filter-chip-${fieldName}-"]`).should("have.length", options.length);
    options.forEach(() => removeFirstMultiSelectChip(fieldName));
    cy.get(`[data-cy^="filter-chip-${fieldName}-"]`).should("not.exist");
  });
}

describe("Search filter tests", () => {
  it("has search filters", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Filters");
    cy.dataCy("boreholes-number-preview").should("have.text", "100");
  });

  // ─── STATUS FILTER ─────────────────────────────────────────────────────────

  it("filters boreholes by workflow status", () => {
    openFilter("Workflow status");
    cy.dataCy("boreholes-number-preview").should("have.text", "100");
    cy.dataCy("workflow-status-button-Draft").should("contain", "100");
    cy.dataCy("workflow-status-button-Reviewed").should("contain", "0");
    cy.dataCy("workflow-status-button-Reviewed").should("be.disabled");

    cy.dataCy("workflow-status-button-Draft").click();
    cy.dataCy("boreholes-number-preview").should("have.text", "100");
    cy.dataCy("filter-chip-workflowStatus-Draft").should("exist");

    // Toggling Draft off clears the workflowStatus filter entirely.
    cy.dataCy("workflow-status-button-Draft").click();
    cy.dataCy("filter-chip-workflowStatus-Draft").should("not.exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "100");
  });

  // ─── WORKGROUP FILTER ──────────────────────────────────────────────────────

  it("filters boreholes by workgroup", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    showTableAndWaitForData();
    cy.contains("Workgroup").click();
    cy.dataCy("boreholes-number-preview").should("have.text", "100");
    cy.get('[data-cy^="filter-chip-workgroupId-"]').should("not.exist");
    cy.dataCy("workgroupId-button-1").click();
    cy.dataCy("filter-chip-workgroupId-1").should("exist");
    cy.dataCy("boreholes-number-preview").should("exist");

    // Clicking the same button again toggles the selection off
    cy.dataCy("workgroupId-button-1").click();
    cy.get('[data-cy^="filter-chip-workgroupId-"]').should("not.exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "100");
  });

  // ─── BOREHOLE FILTERS ──────────────────────────────────────────────────────
  it("filters boreholes by national interest", () => {
    createBorehole({ originalName: "NI test 1", nationalInterest: false }).as("bh1");
    createBorehole({ originalName: "NI test 2", nationalInterest: false }).as("bh2");
    createBorehole({ originalName: "NI test 3", nationalInterest: false }).as("bh3");
    createBorehole({ originalName: "NI test 4", nationalInterest: null }).as("bh4");

    openFilter("Borehole");

    clickYesNoButton("nationalInterest", "yes");
    showTableAndWaitForData();
    // Exactly every tenth seeded borehole has nationalInterest = true (10 out of 100).
    hasPagination(false);
    cy.dataCy("boreholes-number-preview").should("have.text", "10");
    cy.dataCy("filter-chip-nationalInterest").should("exist");

    clickYesNoButton("nationalInterest", "not specified");
    hasPagination(false);
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy("filter-chip-nationalInterest").should("exist");

    clickYesNoButton("nationalInterest", "no");
    // 90 seeded boreholes (false) + 3 newly created with nationalInterest = false.
    hasPagination(false);
    cy.dataCy("boreholes-number-preview").should("have.text", "93");
    checkFilterChipExistsAndRemove("nationalInterest");
    // 100 seeded + 4 created in this test.
    verifyPaginationText("1–100 of 104");
    cy.dataCy("boreholes-number-preview").should("have.text", "104");
  });

  // Substrings chosen to match a known borehole in the current 96-borehole seed.
  testInputFilter("original name", "Borehole", "originalName", "Aisha", "1");
  testInputFilter("project name", "Borehole", "projectName", "Compatible sta", "1");
  testInputFilter("alternate name", "Borehole", "name", "Zelma", "1");

  testSelectFilter("restriction", "Borehole", "restrictionId", 0, "8");

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
    cy.dataCy("boreholes-number-preview").should("have.text", "3");

    // Register fresh intercepts so the waits below resolve on the chip-removal
    // requests, not on stale unclaimed requests from earlier date typing.
    cy.intercept("POST", "/api/v2/borehole/filter").as("borehole_filter_chip_remove");
    cy.intercept("POST", "/api/v2/borehole/filter/stats").as("borehole_filter_stats_chip_remove");
    checkFilterChipExistsAndRemove("restrictionUntilFrom");
    cy.wait("@borehole_filter_stats_chip_remove");
    cy.dataCy("filter-chip-restrictionUntilTo").should("exist");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    checkFilterChipExistsAndRemove("restrictionUntilTo");
  });

  it("filters boreholes by total depth range", () => {
    openFilter("Borehole");
    setInput("totalDepthMin", "800");
    cy.dataCy("boreholes-number-preview").should("have.text", "56");
    checkFilterChipExistsAndRemove("totalDepthMin");
    setInput("totalDepthMax", "1000");
    cy.dataCy("boreholes-number-preview").should("have.text", "51");
    checkFilterChipExistsAndRemove("totalDepthMax");
  });

  it("filters boreholes by top bedrock fresh md range", () => {
    openFilter("Borehole");
    setInput("topBedrockFreshMdMin", "700");
    cy.dataCy("filter-chip-topBedrockFreshMdMin").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "32");
    setInput("topBedrockFreshMdMax", "710");
    cy.dataCy("boreholes-number-preview").should("have.text", "1");
    checkFilterChipExistsAndRemove("topBedrockFreshMdMax");
    cy.dataCy("boreholes-number-preview").should("have.text", "32");
  });

  it("filters boreholes by top bedrock weathered md range", () => {
    openFilter("Borehole");
    setInput("topBedrockWeatheredMdMin", "1");
    cy.dataCy("boreholes-number-preview").should("have.text", "43");
    checkFilterChipExistsAndRemove("topBedrockWeatheredMdMin");
    setInput("topBedrockWeatheredMdMax", "920");
    cy.dataCy("filter-chip-topBedrockWeatheredMdMax").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "95");
  });

  testSelectFilter("borehole type", "Borehole", "typeId", 0, "5");
  testLargeSelectFilter("purpose", "Borehole", "purposeId", ["hydrocarbon exploration", "mineral resources"], "7");
  testLargeSelectFilter("borehole status", "Borehole", "statusId", ["decayed"], "8");

  testYesNoFilter("groundwater", "Borehole", "hasGroundwater", "not specified", "22");
  testYesNoFilter("top bedrock intersected", "Borehole", "topBedrockIntersected", "no", "42");
  // Every seeded borehole has geometry, so the filter is sent but does not narrow.
  testYesNoFilter("geometry available", "Borehole", "hasGeometry", "yes", "100");

  // ─── LOCATION FILTERS ──────────────────────────────────────────────────────
  testLargeSelectFilter("canton", "Location", "canton", ["California"], "1");
  // The seed assigns each borehole a unique municipality; pick one that is known to exist.
  testLargeSelectFilter("municipality", "Location", "municipality", ["Abbyfort"], "1");

  // ─── LOG FILTER ────────────────────────────────────────────────────────────
  // 1000 LogRuns are spread across all 100 boreholes, so every borehole has logs.
  testYesNoFilter("logs available", "LOG", "hasLogs", "yes", "100");
  testLargeSelectFilter("log tool type", "LOG", "logToolTypeId", ["Caliper", "Gamma Ray"], "100");

  // ─── ATTACHMENT FILTERS ────────────────────────────────────────────────────
  // Every seeded borehole has profiles, so filtering for "no profiles" returns 0.
  testYesNoFilter("profiles available", "Attachments", "hasProfiles", "no", "0");
  testYesNoFilter("photos available", "Attachments", "hasPhotos", "yes", "71");

  it("filters boreholes by documents available and resets filters", () => {
    openFilter("Attachments");
    clickYesNoButton("hasDocuments", "no");
    cy.dataCy("boreholes-number-preview").should("have.text", "30");
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy(`filter-chip-hasDocuments`).should("exist");
    cy.dataCy("reset-filter-button").click();
    cy.dataCy(`filter-chip-hasDocuments`).should("not.exist");
  });

  // ─── AUTOCOMPLETE FILTERS ────────────────────────────────────────────────────
  it("shows autocomplete suggestions and commits a selection for originalName", () => {
    openFilter("Borehole");
    cy.dataCy("originalName-formInput").click();
    cy.dataCy("originalName-formInput").type("Ra");
    cy.get('[data-cy^="originalName-suggestion-"]').should("have.length.at.least", 1);
    cy.get('[data-cy^="originalName-suggestion-"]').first().click();
    cy.dataCy("boreholes-number-preview").should($el => {
      expect($el.text().trim()).to.not.equal("100");
    });
    checkFilterChipExistsAndRemove("originalName");
  });

  it("constrains autocomplete suggestions to boreholes that match the active filter", () => {
    // Two boreholes share an "AA_SUGGEST_" prefix but only one has nationalInterest=true.
    // Applying the nationalInterest=yes filter must restrict the suggestion list to the matching one.
    createBorehole({ originalName: "AA_SUGGEST_match", nationalInterest: true });
    createBorehole({ originalName: "AA_SUGGEST_other", nationalInterest: false });

    cy.intercept("POST", "/api/v2/borehole/suggest*").as("suggestRequest");
    openFilter("Borehole");

    // Without a filter both seeded values appear.
    cy.dataCy("originalName-formInput").click();
    cy.dataCy("originalName-formInput").type("AA_SUGGEST_");
    cy.wait("@suggestRequest").its("request.body").should("deep.equal", {});
    cy.get('[data-cy^="originalName-suggestion-"]').should("have.length", 2);

    // Reset typed text without committing the autocomplete (filter remains uncommitted).
    cy.dataCy("originalName-formInput").clear();
    cy.get("body").click(0, 0);

    // Apply the nationalInterest filter and re-open the autocomplete.
    clickYesNoButton("nationalInterest", "yes");
    cy.wait("@borehole_filter");

    cy.dataCy("originalName-formInput").click();
    cy.dataCy("originalName-formInput").type("AA_SUGGEST_");
    cy.wait("@suggestRequest").then(intercept => {
      // The active filter must be forwarded in the suggest request body.
      // NullableBooleanFilter is a numeric enum on the client; True serializes as 1.
      expect(intercept.request.body).to.include({ nationalInterest: 1 });
    });

    cy.get('[data-cy^="originalName-suggestion-"]').should("have.length", 1);
    cy.get('[data-cy^="originalName-suggestion-"]').first().should("contain", "AA_SUGGEST_match");
  });

  // ─── MULTISELECT FILTERS ────────────────────────────────────────────────────
  it("toggles button selections for restrictionId (<= 7 options)", () => {
    openFilter("Borehole");
    cy.get('[data-cy^="restrictionId-button-"]').eq(0).click();
    cy.get('[data-cy^="restrictionId-button-"]').eq(1).click();
    cy.get('[data-cy^="restrictionId-button-"].MuiButton-contained').should("have.length.at.least", 2);
    // MultiSelect renders one chip per selected value.
    cy.get('[data-cy^="filter-chip-restrictionId-"]').should("have.length.at.least", 2);
    // Deselect one
    cy.get('[data-cy^="restrictionId-button-"]').eq(1).click();
    // Deselect the other → filter should clear
    cy.get('[data-cy^="restrictionId-button-"]').eq(0).click();
    cy.get('[data-cy^="filter-chip-restrictionId-"]').should("not.exist");
  });

  it("multiselect filter chips show selected values and support per-value removal", () => {
    openFilter("Borehole");
    // Select two borehole type values. The status schema ("borehole_type")
    // has <= 7 options, so FilterDomainSelect renders them as toggle buttons
    cy.dataCy("typeId-button-20101002").click();
    cy.dataCy("typeId-button-30000307").click();

    // Two chips should render — one per selected value (not one combined chip).
    cy.get('[data-cy^="filter-chip-typeId-"]').should("have.length", 2);
    cy.dataCy("filter-chip-typeId-20101002").should("be.visible");
    cy.dataCy("filter-chip-typeId-30000307").should("be.visible");

    // URL reflects both selections.
    cy.location("search").should("contain", "typeId=20101002");
    cy.location("search").should("contain", "30000307");

    // Delete the first chip — only that value should be removed.
    checkFilterChipExistsAndRemove("typeId-20101002");

    cy.get('[data-cy^="filter-chip-typeId-"]').should("have.length", 1);
    cy.dataCy("filter-chip-typeId-30000307").should("be.visible");

    // The toggle button for the removed type is no longer selected;
    // the still-active type keeps its selected (contained) state.
    cy.dataCy("typeId-button-20101002").should("not.have.class", "MuiButton-contained");
    cy.dataCy("typeId-button-30000307").should("have.class", "MuiButton-contained");

    // URL keeps the remaining selection and drops the removed one.
    cy.location("search").should("contain", "typeId=30000307");
    cy.location("search").should("not.contain", "typeId=20101002");

    // Delete the last remaining chip — filter is fully cleared.
    checkFilterChipExistsAndRemove("typeId-30000307");

    cy.get('[data-cy^="filter-chip-typeId-"]').should("not.exist");
    cy.dataCy("typeId-button-30000307").should("not.have.class", "MuiButton-contained");
    cy.location("search").should("not.contain", "typeId=");
  });

  // ─── IDENTIFIER FILTER ─────────────────────────────────────────────────────
  it("filters boreholes by identifier type only", () => {
    openFilter("IDs");
    cy.dataCy("identifierTypeId-button-100000000").click(); // GeODin ID
    cy.url().should("include", "identifierTypeId=");
    cy.get('[data-cy^="filter-chip-identifierTypeId-"]').should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "56");
  });

  it("filters boreholes by identifier value only", () => {
    openFilter("IDs");
    cy.dataCy(`identifierValue-formInput`).type("8c{enter}", { delay: 10 });
    cy.url().should("include", "identifierValue=8c");
    cy.dataCy("filter-chip-identifierValue").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "2");
  });

  it("filters boreholes by identifier type and value combined", () => {
    openFilter("IDs");
    cy.dataCy("identifierTypeId-button-100000005").click(); // canton ID
    cy.dataCy("boreholes-number-preview").should("have.text", "48");
    cy.dataCy(`identifierValue-formInput`).type("8{enter}", { delay: 10 });
    cy.url().should("include", "identifierTypeId=100000005").and("include", "identifierValue=8");
    // Both chips visible.
    cy.dataCy("filter-chip-identifierTypeId-100000005").should("exist");
    cy.dataCy("filter-chip-identifierValue").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "13");
    //removing the identifier type chip clears only the value field
    cy.dataCy("filter-chip-identifierTypeId-100000005").within(() => cy.get("svg").click());
    cy.dataCy("boreholes-number-preview").should("have.text", "60");
    cy.url().should("include", "identifierValue=").and("not.include", "identifierTypeId=");
  });
});
