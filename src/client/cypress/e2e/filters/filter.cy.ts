import { WorkflowStatus } from "@swissgeol/ui-core";
import { hasPagination, showTableAndWaitForData, verifyPaginationText } from "../helpers/dataGridHelpers";
import { setInput, setSelect, setYesNoSelect } from "../helpers/formHelpers";
import { createBorehole, goToRouteAndAcceptTerms } from "../helpers/testHelpers";

function openFilter(filterTitle: string) {
  goToRouteAndAcceptTerms("/");
  cy.dataCy("show-filter-button").click();
  cy.contains(filterTitle).click();
}

function checkFilterChipExistsAndRemove(filterName: string) {
  cy.dataCy(`filter-chip-${filterName}`).should("exist");
  cy.dataCy(`filter-chip-${filterName}`).within(() => {
    cy.get("svg").click();
  });
  cy.dataCy(`filter-chip-${filterName}`).should("not.exist");
}

function testYesNoFilter(
  title: string,
  filterSection: string,
  fieldName: string,
  option: string,
  expectedCount: string,
) {
  it(`filters boreholes by ${title}`, () => {
    openFilter(filterSection);
    setYesNoSelect(fieldName, option);
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
    setInput(fieldName, value);
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
    setSelect(fieldName, optionIndex);
    cy.dataCy("boreholes-number-preview").should("have.text", expectedCount);
    checkFilterChipExistsAndRemove(fieldName);
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
    cy.dataCy(WorkflowStatus.Draft).click();
    cy.dataCy("boreholes-number-preview").should("have.text", "3'000");
    cy.dataCy(WorkflowStatus.Reviewed).click();
    cy.dataCy("boreholes-number-preview").should("have.text", "0");
  });

  // ─── WORKGROUP FILTER ──────────────────────────────────────────────────────

  it("filters boreholes by workgroup", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    showTableAndWaitForData();
    cy.contains("Workgroup").click();
    cy.dataCy("boreholes-number-preview").should("have.text", "3'000");
    cy.dataCy("filter-chip-workgroupId").should("not.exist");
    cy.dataCy("Default").click();
    cy.dataCy("filter-chip-workgroupId").should("exist");
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy("all").click();
    cy.dataCy("filter-chip-workgroupId").should("not.exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "3'000");
  });

  // ─── LOCATION FILTERS ──────────────────────────────────────────────────────
  it("filters boreholes by national interest", () => {
    createBorehole({ originalName: "NI test 1", nationalInterest: false }).as("bh1");
    createBorehole({ originalName: "NI test 2", nationalInterest: false }).as("bh2");
    createBorehole({ originalName: "NI test 3", nationalInterest: false }).as("bh3");
    createBorehole({ originalName: "NI test 4", nationalInterest: null }).as("bh4");

    openFilter("Location");

    setYesNoSelect("nationalInterest", "Yes");
    showTableAndWaitForData();
    verifyPaginationText("1–100 of 300");
    cy.dataCy("boreholes-number-preview").should("have.text", "300");
    cy.dataCy("filter-chip-nationalInterest").should("exist");

    setYesNoSelect("nationalInterest", "Not specified");
    hasPagination(false);
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy("filter-chip-nationalInterest").should("exist");

    setYesNoSelect("nationalInterest", "No");
    verifyPaginationText("1–100 of 2703");
    cy.dataCy("boreholes-number-preview").should("have.text", "2'703");
    checkFilterChipExistsAndRemove("nationalInterest");
    verifyPaginationText("1–100 of 3004");
    cy.dataCy("boreholes-number-preview").should("have.text", "3'004");
  });

  testInputFilter("original name", "Location", "originalName", "Abigail", "7");
  testInputFilter("project name", "Location", "projectName", "engin", "106");
  testInputFilter("alternate name", "Location", "name", "Eric", "26");

  testSelectFilter("restriction", "Location", "restrictionId", 0, "376");

  it("filters boreholes by restriction date range", () => {
    openFilter("Location");
    setInput("restrictionUntilFrom", "2021-01-01");
    cy.wait("@borehole_filter");
    cy.location().its("search").should("contain", "2021-01-01");
    cy.dataCy("filter-chip-restrictionUntilFrom").should("exist");
    cy.dataCy("boreholes-number-preview").should("exist");

    setInput("restrictionUntilTo", "2022-01-31");
    cy.wait("@borehole_filter");
    cy.location().its("search").should("contain", "2022-01-31");
    cy.dataCy("boreholes-number-preview").should("have.text", "126");
    checkFilterChipExistsAndRemove("restrictionUntilFrom");
    checkFilterChipExistsAndRemove("restrictionUntilTo");
  });

  // ─── BOREHOLE FILTERS ──────────────────────────────────────────────────────
  it("filters boreholes by total depth range", () => {
    openFilter("Borehole");
    setInput("totalDepthMin", "800");
    cy.focused().blur();
    cy.dataCy("boreholes-number-preview").should("have.text", "1'800");
    checkFilterChipExistsAndRemove("totalDepthMin");
    setInput("totalDepthMax", "1000");
    cy.focused().blur();
    cy.dataCy("boreholes-number-preview").should("have.text", "1'499");
    checkFilterChipExistsAndRemove("totalDepthMax");
  });

  it("filters boreholes by top bedrock fresh md range", () => {
    openFilter("Borehole");
    setInput("topBedrockFreshMdMin", "700");
    cy.focused().blur();
    cy.dataCy("filter-chip-topBedrockFreshMdMin").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "851");
    setInput("topBedrockFreshMdMax", "710");
    cy.focused().blur();
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
  testSelectFilter("purpose", "Borehole", "purposeId", 0, "112");
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
    setYesNoSelect("hasDocuments", "No");
    cy.dataCy("boreholes-number-preview").should("have.text", "2'930");
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy(`filter-chip-hasDocuments`).should("exist");
    cy.dataCy("reset-filter-button").click();
    cy.dataCy(`filter-chip-hasDocuments`).should("not.exist");
  });
});
