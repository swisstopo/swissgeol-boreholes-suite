import { login } from "../../e2e/testHelpers";

describe("Test for importing boreholes.", () => {
  it("Sucessfully imports multiple boreholes.", () => {
    login("/editor");
    cy.contains("a", "Import").click();

    cy.fixture("/import/boreholes-multiple-valid.csv", { encoding: null }).as(
      "boreholes-multiple-valid",
    );
    cy.get("input[type=file]").selectFile("@boreholes-multiple-valid");

    cy.intercept("/api/v2/upload?workgroupId=1").as("borehole-upload");

    cy.contains("button", "Import").click();

    cy.wait("@borehole-upload");

    cy.contains("boreholes were imported");
  });

  it("Displays validation errors.", () => {
    login("/editor");
    cy.contains("a", "Import").click();

    cy.fixture("/import/boreholes-missing-fields-and-duplicates.csv", {
      encoding: null,
    }).as("boreholes-missing-fields-and-duplicated");
    cy.get("input[type=file]").selectFile(
      "@boreholes-missing-fields-and-duplicated",
    );

    cy.intercept("/api/v2/upload?workgroupId=1").as("borehole-upload");

    cy.contains("button", "Import").click();

    cy.wait("@borehole-upload");

    cy.get('[data-cy="borehole-import-error-modal-content"]')
      .should("not.contain", "Row0")
      .should("contain", "Row1")
      .should("contain", "Field 'location_x' is required.")
      .should("contain", "Row2")
      .should("contain", "Row4")
      .should("contain", "Row5")
      .should(
        "contain",
        "Borehole with same Coordinates (+/- 2m) and same TotalDepth is provied multiple times.",
      );
  });
});
