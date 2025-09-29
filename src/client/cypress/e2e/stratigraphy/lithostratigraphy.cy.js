import {
  bearerAuth,
  createBorehole,
  createStratigraphy,
  goToDetailRouteAndAcceptTerms,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for the lithostratigraphy editor.", () => {
  beforeEach(function () {
    // Add new borehole with stratigraphy
    createBorehole({ originalName: "INTEADAL" })
      .as("borehole_id")
      .then(id => createStratigraphy(id, 3000).as("stratigraphy_id"));

    // open lithostratigraphy editor
    cy.get("@borehole_id").then(id => {
      cy.get("@stratigraphy_id").then(stratigraphyId => {
        goToDetailRouteAndAcceptTerms(`/${id}/stratigraphy/${stratigraphyId}#lithostratigraphy`);
      });
    });

    // start editing session
    startBoreholeEditing();
    cy.wait("@lithostratigraphy_GET");
  });

  it("Creates, updates and deletes lithostratigraphy layers", () => {
    // create lithostratigraphy
    cy.get('[data-cy="add-layer-button"]').click({ force: true });
    cy.wait("@lithostratigraphy_POST");

    // edit lithostratigraphy
    cy.get('[data-cy="layer-card"] [data-testid="EditIcon"]').click();
    cy.get('[data-cy="layer-card"] :nth-child(2) > .MuiAutocomplete-root').click();

    // ensure clone and delete buttons in header are disabled for lithostratigraphy.
    cy.get('[data-cy="clone-and-delete-buttons"]').should("not.exist");

    cy.get('.MuiPaper-elevation [role="listbox"]').find('[role="option"]').eq(1).click();
    cy.wait("@lithostratigraphy_PUT");

    // edit to depth with value containing thousand separator
    cy.get('[data-cy="layer-card"] :nth-child(2) > .MuiInputBase-input').last().type("5000");
    cy.contains("Formation").click(); // click anywhere to trigger on blur on input
    cy.wait("@lithostratigraphy_PUT");

    // delete lithostratigraphy
    cy.get('[data-cy="layer-card"] [data-testid="DeleteIcon"]').click();
    cy.wait("@lithostratigraphy_DELETE");
    stopBoreholeEditing();
  });
});
