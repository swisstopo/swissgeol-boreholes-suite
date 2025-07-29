import { setSelect } from "../helpers/formHelpers";
import {
  createBorehole,
  dropGeometryCSVFile,
  goToDetailRouteAndAcceptTerms,
  startBoreholeEditing,
} from "../helpers/testHelpers";

describe("Geometry crud tests", () => {
  beforeEach(() => {
    createBorehole({ originalName: "LSENALZE" }).as("borehole_id");

    // open section editor
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}/borehole#geometry`);
      cy.wait(["@boreholegeometry_GET"]);
    });

    // start editing session
    startBoreholeEditing();
    cy.wait(["@boreholegeometry_GET", "@boreholegeometry_formats"]);
  });

  it("adds and deletes borehole geometry", () => {
    cy.get('[data-cy="boreholegeometryimport-button"]').should("be.disabled");

    // Select geometry csv file
    dropGeometryCSVFile();

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
