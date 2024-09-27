import { setSelect } from "../helpers/formHelpers";
import { createBorehole, getImportFileFromFixtures, loginAsAdmin, startBoreholeEditing } from "../helpers/testHelpers";

describe("Geometry crud tests", () => {
  beforeEach(() => {
    createBorehole({ "extended.original_name": "LSENALZE" }).as("borehole_id");

    // open section editor
    cy.get("@borehole_id").then(id => {
      loginAsAdmin(`/${id}/borehole#geometry`);
    });

    // start editing session
    startBoreholeEditing();
  });

  it("adds and deletes borehole geometry", () => {
    cy.get('[data-cy="boreholegeometryimport-button"]').should("be.disabled");

    // Select geometry csv file
    let geometryFile = new DataTransfer();
    getImportFileFromFixtures("geometry_azimuth_inclination.csv", null).then(fileContent => {
      const file = new File([fileContent], "geometry_azimuth_inclination.csv", {
        type: "text/csv",
      });
      geometryFile.items.add(file);
    });
    cy.get('[data-cy="import-geometry-input"]').within(() => {
      cy.get("input[type=file]", { force: true }).then(input => {
        input[0].files = geometryFile.files;
        input[0].dispatchEvent(new Event("change", { bubbles: true }));
      });
    });

    cy.get('[data-cy="boreholegeometryimport-button"]').should("be.enabled");

    // the selected format is wrong expect an alert
    setSelect("geometryFormat", 0);
    cy.get('[data-cy="boreholegeometryimport-button"]').click();
    cy.wait("@boreholegeometry_POST");
    cy.get(".MuiAlert-message").contains("Header with name 'X_m'[0] was not found.");
    cy.get(".MuiAlert-action > .MuiButtonBase-root").click();

    // correct format for selected CSV
    setSelect("geometryFormat", 1);
    cy.get('[data-cy="boreholegeometryimport-button"]').click();
    cy.wait("@boreholegeometry_POST");
    cy.wait("@boreholegeometry_GET");
    cy.get(".MuiTableBody-root").should("exist");

    // delete geometry
    cy.get('[data-cy="delete-button"]').click();
    cy.wait("@boreholegeometry_DELETE");
    cy.wait("@boreholegeometry_GET");
    cy.get(".MuiTableBody-root").should("not.exist");
  });
});
