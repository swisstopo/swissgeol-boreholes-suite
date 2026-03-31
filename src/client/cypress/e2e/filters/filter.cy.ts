import { WorkflowStatus } from "@swissgeol/ui-core";
import { hasPagination, showTableAndWaitForData, verifyPaginationText } from "../helpers/dataGridHelpers";
import { setInput, setSelect, setYesNoSelect } from "../helpers/formHelpers";
import { createBorehole, goToRouteAndAcceptTerms } from "../helpers/testHelpers";

describe("Search filter tests", () => {
  it("has search filters", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Filters");
    cy.dataCy("boreholes-number-preview").should("have.text", "3'000");
  });

  // ─── STATUS FILTER ─────────────────────────────────────────────────────────

  it("filters boreholes by workflow status", () => {
    goToRouteAndAcceptTerms("");
    cy.dataCy("show-filter-button").click();
    cy.contains("Workflow status").click();
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

    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Location").click();

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
    cy.dataCy("filter-chip-nationalInterest").should("exist");

    cy.dataCy("filter-chip-nationalInterest")
      .should("exist")
      .within(() => {
        cy.get("svg").click();
      });
    cy.dataCy("filter-chip-nationalInterest").should("not.exist");
    verifyPaginationText("1–100 of 3004");
    cy.dataCy("boreholes-number-preview").should("have.text", "3'004");
  });

  it("filters boreholes by original name", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Location").click();
    setInput("originalName", "Abigail");
    cy.dataCy("filter-chip-originalName").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "7");
    cy.dataCy("filter-chip-originalName").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-originalName").should("not.exist");
  });

  it("filters boreholes by project name", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Location").click();
    setInput("projectName", "engin");
    cy.dataCy("filter-chip-projectName").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "106");
    cy.dataCy("filter-chip-projectName").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-projectName").should("not.exist");
  });

  it("filters boreholes by alternate name", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Location").click();
    setInput("name", "Eric");
    cy.dataCy("filter-chip-name").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "26");
    cy.dataCy("filter-chip-name").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-name").should("not.exist");
  });

  it("filters boreholes by restriction", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Location").click();
    setSelect("restrictionId", 0);
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "376");
    cy.dataCy("filter-chip-restrictionId").should("exist");
    cy.dataCy("filter-chip-restrictionId").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-restrictionId").should("not.exist");
  });

  it("filters boreholes by restriction date range", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Location").click();
    setInput("restrictionUntilFrom", "2021-01-01");
    cy.dataCy("filter-chip-restrictionUntilFrom").should("exist");
    cy.dataCy("boreholes-number-preview").should("exist");
    setInput("restrictionUntilTo", "2022-01-31");
    cy.dataCy("filter-chip-restrictionUntilTo").should("exist");
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "126");
    cy.dataCy("filter-chip-restrictionUntilFrom").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-restrictionUntilFrom").should("not.exist");
    cy.dataCy("filter-chip-restrictionUntilTo").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-restrictionUntilTo").should("not.exist");
  });

  // ─── BOREHOLE FILTERS ──────────────────────────────────────────────────────

  it("filters boreholes by borehole type", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Borehole").click();
    setSelect("typeId", 0);
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy("filter-chip-typeId").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "171");
    cy.dataCy("filter-chip-typeId").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-typeId").should("not.exist");
  });

  it("filters boreholes by purpose", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Borehole").click();
    setSelect("purposeId", 0);
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "112");
    cy.dataCy("filter-chip-purposeId").should("exist");
    cy.dataCy("filter-chip-purposeId").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-purposeId").should("not.exist");
  });

  it("filters boreholes by borehole status", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Borehole").click();
    setSelect("statusId", 2);
    cy.dataCy("boreholes-number-preview").should("have.text", "314");
    cy.dataCy("filter-chip-statusId").should("exist");
    cy.dataCy("filter-chip-statusId").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-statusId").should("not.exist");
  });

  it("filters boreholes by total depth range", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Borehole").click();
    setInput("totalDepthMin", "800");
    cy.dataCy("filter-chip-totalDepthMin").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "1'800");
    cy.dataCy("filter-chip-totalDepthMin").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-totalDepthMin").should("not.exist");

    setInput("totalDepthMax", "1000");
    cy.dataCy("filter-chip-totalDepthMax").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "1'499");
    cy.dataCy("filter-chip-totalDepthMax").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-totalDepthMax").should("not.exist");
  });

  it("filters boreholes by top bedrock fresh md range", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Borehole").click();
    setInput("topBedrockFreshMdMin", "700");
    cy.dataCy("filter-chip-topBedrockFreshMdMin").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "851");
    cy.wait("@borehole_filter");
    setInput("topBedrockFreshMdMax", "710");
    cy.dataCy("filter-chip-topBedrockFreshMdMax").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "30");
    cy.dataCy("filter-chip-topBedrockFreshMdMax").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-topBedrockFreshMdMax").should("not.exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "851");
  });

  it("filters boreholes by top bedrock weathered md range", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Borehole").click();
    setInput("topBedrockWeatheredMdMin", "1");
    cy.dataCy("filter-chip-topBedrockWeatheredMdMin").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "1'448");
    cy.dataCy("filter-chip-topBedrockWeatheredMdMin").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-topBedrockWeatheredMdMin").should("not.exist");
    setInput("topBedrockWeatheredMdMax", "920");
    cy.dataCy("filter-chip-topBedrockWeatheredMdMax").should("exist");
    cy.dataCy("boreholes-number-preview").should("have.text", "2'855");
  });

  it("filters boreholes by groundwater", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Borehole").click();
    setYesNoSelect("hasGroundwater", "Yes");
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy("filter-chip-hasGroundwater").should("exist");
    cy.dataCy("filter-chip-hasGroundwater").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-hasGroundwater").should("not.exist");
  });

  it("filters boreholes by top bedrock intersected", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Borehole").click();
    setYesNoSelect("topBedrockIntersected", "Yes");
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy("filter-chip-topBedrockIntersected").should("exist");
    cy.dataCy("filter-chip-topBedrockIntersected").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-topBedrockIntersected").should("not.exist");
  });

  it("filters boreholes by geometry available", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Borehole").click();
    setYesNoSelect("hasGeometry", "Yes");
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy("filter-chip-hasGeometry").should("exist");
    cy.dataCy("filter-chip-hasGeometry").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-hasGeometry").should("not.exist");
  });

  // ─── LOG FILTER ────────────────────────────────────────────────────────────

  it("filters boreholes by logs available", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("LOG").click();
    setYesNoSelect("hasLogs", "Yes");
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy("filter-chip-hasLogs").should("exist");
    cy.dataCy("filter-chip-hasLogs").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-hasLogs").should("not.exist");
  });

  // ─── ATTACHMENT FILTERS ────────────────────────────────────────────────────

  it("filters boreholes by profiles available", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Attachments").click();
    setYesNoSelect("hasProfiles", "Yes");
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy("filter-chip-hasProfiles").should("exist");
    cy.dataCy("filter-chip-hasProfiles").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-hasProfiles").should("not.exist");
  });

  it("filters boreholes by photos available", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Attachments").click();
    setYesNoSelect("hasPhotos", "Yes");
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy("filter-chip-hasPhotos").should("exist");
    cy.dataCy("filter-chip-hasPhotos").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-hasPhotos").should("not.exist");
  });

  it("filters boreholes by documents available", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("Attachments").click();
    setYesNoSelect("hasDocuments", "Yes");
    cy.dataCy("boreholes-number-preview").should("exist");
    cy.dataCy("filter-chip-hasDocuments").should("exist");
    cy.dataCy("filter-chip-hasDocuments").within(() => {
      cy.get("svg").click();
    });
    cy.dataCy("filter-chip-hasDocuments").should("not.exist");
  });
});
