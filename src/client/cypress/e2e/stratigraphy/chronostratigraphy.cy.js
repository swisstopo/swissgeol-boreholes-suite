import {
  createBorehole,
  createStratigraphy,
  goToDetailRouteAndAcceptTerms,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for the chronostratigraphy editor.", () => {
  beforeEach(function () {
    // Add new borehole with stratigraphy
    createBorehole({ originalName: "INTEADAL" })
      .as("borehole_id")
      .then(id => createStratigraphy(id, 3000).as("stratigraphy_id"));

    // open chronostratigraphy editor
    cy.get("@borehole_id").then(id => {
      cy.get("@stratigraphy_id").then(stratigraphyId => {
        goToDetailRouteAndAcceptTerms(`/${id}/stratigraphy/${stratigraphyId}#chronostratigraphy`);
      });
    });

    // start editing session
    startBoreholeEditing();
    cy.wait("@chronostratigraphy_GET");
  });

  it("Creates, updates and deletes chronostratigraphy layers", () => {
    // create chronostratigraphy
    cy.get('[data-cy="add-layer-button"]').click({ force: true });
    cy.wait("@chronostratigraphy_POST");

    // edit chronostratigraphy
    cy.get('[data-cy="layer-card"] [data-testid="EditIcon"]').click();
    cy.get('[data-cy="layer-card"] :nth-child(4)').click();

    // Ensure clone and delete buttons in header are disabled for chronostratigraphy.
    cy.get('[data-cy="clone-and-delete-buttons"]').should("not.exist");

    cy.get('.MuiPaper-elevation [role="listbox"]').find('[role="option"]').eq(1).click();
    cy.wait("@chronostratigraphy_PUT");
    cy.get('[data-cy="layer-card"] [data-testid="CloseIcon"]').click();

    // delete chronostratigraphy
    cy.get('[data-cy="layer-card"] [data-testid="DeleteIcon"]').click();
    cy.wait("@chronostratigraphy_DELETE");
    stopBoreholeEditing();
  });
});
