import { getImportFileFromFixtures, loginAsAdmin } from "../helpers/testHelpers";

describe("Test for importing boreholes.", () => {
  it("Successfully imports multiple boreholes.", () => {
    loginAsAdmin();
    cy.get('[data-cy="import-borehole-button"]').click();

    // Select borehole csv file
    let boreholeFile = new DataTransfer();
    getImportFileFromFixtures("boreholes-multiple-valid.csv", "utf-8").then(fileContent => {
      const file = new File([fileContent], "boreholes-multiple-valid.csv", {
        type: "text/csv",
      });
      boreholeFile.items.add(file);
    });

    cy.get('[data-cy="import-boreholeFile-input"]').within(() => {
      cy.get("input[type=file]", { force: true }).then(input => {
        input[0].files = boreholeFile.files;
        input[0].dispatchEvent(new Event("change", { bubbles: true }));
      });
    });

    // Import boreholes
    cy.get('[data-cy="import-button"]').click();
    cy.wait("@borehole-upload");

    // Check if boreholes were imported
    cy.contains("boreholes were imported");
  });

  it("Displays borehole validation errors.", () => {
    loginAsAdmin();
    cy.get('[data-cy="import-borehole-button"]').click();

    // Select borehole csv file
    getImportFileFromFixtures("boreholes-missing-fields-and-duplicates.csv", null)
      .then(fileContent => {
        const file = new File([fileContent], "boreholes-missing-fields-and-duplicates.csv", {
          type: "text/csv",
        });
        let boreholeFile = new DataTransfer();
        boreholeFile.items.add(file);
        return boreholeFile;
      })
      .then(boreholeFile => {
        cy.get('[data-cy="import-boreholeFile-input"]').within(() => {
          cy.get("input[type=file]", { force: true }).then(input => {
            input[0].files = boreholeFile.files;
            input[0].dispatchEvent(new Event("change", { bubbles: true }));
          });
        });
      });
    cy.get('[data-cy="import-button"]').click();

    cy.wait("@borehole-upload");

    cy.get('[data-cy="borehole-import-error-modal-content"]')
      .should("not.contain", "Row0")
      .should("contain", "Row1")
      .should("contain", "Field 'location_x' is required.")
      .should("contain", "Row2")
      .should("contain", "Row4")
      .should("contain", "Row5")
      .should("contain", "Borehole with same Coordinates (+/- 2m) and same TotalDepth is provided multiple times.");
  });
});
