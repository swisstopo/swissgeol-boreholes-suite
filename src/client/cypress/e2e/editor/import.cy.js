import { getImportFileFromFixtures, loginAsAdmin } from "../../e2e/helpers/testHelpers";

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

    // Select borehole attachments
    let attachmentFileList = new DataTransfer();
    getImportFileFromFixtures("borehole_attachment_1.pdf", "utf-8").then(fileContent => {
      const file = new File([fileContent], "borehole_attachment_1.pdf", {
        type: "application/pdf",
      });
      attachmentFileList.items.add(file);
    });
    getImportFileFromFixtures("borehole_attachment_2.zip", "utf-8").then(fileContent => {
      const file = new File([fileContent], "borehole_attachment_2.zip", {
        type: "application/zip",
      });
      attachmentFileList.items.add(file);
    });
    cy.get('[data-cy="import-boreholeFile-attachments-input"]').within(() => {
      cy.get("input[type=file]", { force: true }).then(input => {
        input[0].files = attachmentFileList.files;
        input[0].dispatchEvent(new Event("change", { bubbles: true }));
      });
    });

    // Select lithology csv file
    let lithologyFile = new DataTransfer();
    getImportFileFromFixtures("lithology-single-valid.csv", null).then(fileContent => {
      const file = new File([fileContent], "lithology-single-valid.csv", {
        type: "text/csv",
      });
      lithologyFile.items.add(file);
    });
    cy.get('[data-cy="import-lithologyFile-input"]').within(() => {
      cy.get("input[type=file]", { force: true }).then(input => {
        input[0].files = lithologyFile.files;
        input[0].dispatchEvent(new Event("change", { bubbles: true }));
      });
    });

    // Intercept upload request
    cy.intercept("/api/v2/upload?workgroupId=1").as("borehole-upload");

    // Import boreholes and attachments
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

    cy.intercept("/api/v2/upload?workgroupId=1").as("borehole-upload");

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

  it("Displays lithology validation errors.", () => {
    loginAsAdmin();
    cy.get('[data-cy="import-borehole-button"]').click();

    // Select borehole csv file
    getImportFileFromFixtures("boreholes-multiple-valid.csv", null)
      .then(fileContent => {
        const file = new File([fileContent], "boreholes-multiple-valid.csv", {
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

    // Select lithology csv file
    getImportFileFromFixtures("lithology-single-not-valid.csv", null, "invalid-lithology")
      .then(fileContent => {
        const file = new File([fileContent], "lithology-single-not-valid.csv", {
          type: "text/csv",
        });
        let lithologyFile = new DataTransfer();
        lithologyFile.items.add(file);
        return lithologyFile;
      })
      .then(lithologyFile => {
        cy.get('[data-cy="import-lithologyFile-input"]').within(() => {
          cy.get("input[type=file]", { force: true }).then(input => {
            input[0].files = lithologyFile.files;
            input[0].dispatchEvent(new Event("change", { bubbles: true }));
          });
        });
      });

    cy.intercept("/api/v2/upload?workgroupId=1").as("borehole-upload");

    cy.get('[data-cy="import-button"]').click();

    cy.wait("@borehole-upload");

    cy.get('[data-cy="borehole-import-error-modal-content"]')
      .should("not.contain", "Row0")
      .should("contain", "Row1")
      .should("contain", "Field 'to_depth' is required.")
      .should("contain", "Borehole with ImportId '123456' not found.");
  });
});
