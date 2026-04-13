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

  it("filters boreholes by original name", () => {
    openFilter("Location");
    setInput("originalName", "Abigail");
    cy.dataCy("boreholes-number-preview").should("have.text", "7");
    checkFilterChipExistsAndRemove("originalName");
  });

  it("filters boreholes by project name", () => {
    openFilter("Location");
    setInput("projectName", "engin");
    cy.dataCy("boreholes-number-preview").should("have.text", "106");
    checkFilterChipExistsAndRemove("projectName");
  });

  it("filters boreholes by alternate name", () => {
    openFilter("Location");
    setInput("name", "Eric");
    cy.dataCy("boreholes-number-preview").should("have.text", "26");
    checkFilterChipExistsAndRemove("name");
  });

  it("filters boreholes by restriction", () => {
    openFilter("Location");
    setSelect("restrictionId", 0);
    cy.dataCy("boreholes-number-preview").should("have.text", "376");
    checkFilterChipExistsAndRemove("restrictionId");
  });

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

  it("filters boreholes by borehole type", () => {
    openFilter("Borehole");
    setSelect("typeId", 0);
    cy.dataCy("boreholes-number-preview").should("have.text", "171");
    checkFilterChipExistsAndRemove("typeId");
  });

  it("filters boreholes by purpose", () => {
    openFilter("Borehole");
    setSelect("purposeId", 0);
    cy.dataCy("boreholes-number-preview").should("have.text", "112");
    checkFilterChipExistsAndRemove("purposeId");
  });

  it("filters boreholes by borehole status", () => {
    openFilter("Borehole");
    setSelect("statusId", 2);
    cy.dataCy("boreholes-number-preview").should("have.text", "314");
    checkFilterChipExistsAndRemove("statusId");
  });

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

  it("filters boreholes by groundwater", () => {
    openFilter("Borehole");
    setYesNoSelect("hasGroundwater", "Not specified");
    cy.dataCy("boreholes-number-preview").should("have.text", "601");
    checkFilterChipExistsAndRemove("hasGroundwater");
  });

  it("filters boreholes by top bedrock intersected", () => {
    openFilter("Borehole");
    setYesNoSelect("topBedrockIntersected", "No");
    cy.dataCy("boreholes-number-preview").should("have.text", "1'209");
    checkFilterChipExistsAndRemove("topBedrockIntersected");
  });

  it("filters boreholes by geometry available", () => {
    openFilter("Borehole");
    setYesNoSelect("hasGeometry", "Yes");
    cy.dataCy("boreholes-number-preview").should("have.text", "100");
    checkFilterChipExistsAndRemove("hasGeometry");
  });

  // ─── LOG FILTER ────────────────────────────────────────────────────────────

  it("filters boreholes by logs available", () => {
    openFilter("LOG");
    setYesNoSelect("hasLogs", "Yes");
    cy.dataCy("boreholes-number-preview").should("have.text", "101");
    checkFilterChipExistsAndRemove("hasLogs");
  });

  // ─── ATTACHMENT FILTERS ────────────────────────────────────────────────────

  it("filters boreholes by profiles available", () => {
    openFilter("Attachments");
    setYesNoSelect("hasProfiles", "No");
    cy.dataCy("boreholes-number-preview").should("have.text", "2'912");
    checkFilterChipExistsAndRemove("hasProfiles");
  });

  it("filters boreholes by photos available", () => {
    openFilter("Attachments");
    setYesNoSelect("hasPhotos", "Yes");
    cy.dataCy("boreholes-number-preview").should("have.text", "71");
    checkFilterChipExistsAndRemove("hasPhotos");
  });

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
