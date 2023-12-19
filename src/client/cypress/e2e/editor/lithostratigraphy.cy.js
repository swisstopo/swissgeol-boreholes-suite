import {
  createBorehole,
  createStratigraphy,
  adminUserAuth,
  login,
} from "../testHelpers";

describe("Tests for the lithostratigraphy editor.", () => {
  beforeEach(function () {
    // Add new borehole with some lithology layers
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => createStratigraphy(id, 3000))
      .then(response => {
        expect(response).to.have.property("status", 200);

        [
          {
            lithologyId: 15101044,
            fromDepth: 0,
            toDepth: 25,
          },
          {
            lithologyId: 15102027,
            fromDepth: 25,
            toDepth: 35,
          },
          {
            fromDepth: 35,
            toDepth: 40,
          },
          {
            fromDepth: 40,
            toDepth: 43,
          },
        ].forEach(layer => {
          cy.request({
            method: "POST",
            url: "/api/v2/layer",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              stratigraphyId: response.body.id,
              ...layer,
            },
            auth: adminUserAuth,
          }).then(response => {
            expect(response).to.have.property("status", 200);
          });
        });
      });

    // open lithostratigraphy editor
    cy.get("@borehole_id").then(id =>
      login(`editor/${id}/stratigraphy/lithostratigraphy`),
    );
    cy.wait("@get-layers-by-profileId");

    // start editing session
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");
    cy.wait("@lithostratigraphy_GET");
  });

  it("Creates, updates and deletes lithostratigraphy layers", () => {
    // create lithostratigraphy
    cy.get('[data-cy="add-layer-button"]').click({ force: true });
    cy.wait("@lithostratigraphy_POST");

    // edit lithostratigraphy
    cy.get('[data-cy="layer-card"] [data-testid="EditIcon"]').click();
    cy.get(
      '[data-cy="layer-card"] :nth-child(2) > .MuiAutocomplete-root',
    ).click();

    // Ensure clone and delete buttons in header are disabled for lithostratigraphy.
    cy.get('[data-cy="clone-and-delete-buttons"]').should("not.exist");

    cy.get('.MuiPaper-elevation [role="listbox"]')
      .find('[role="option"]')
      .eq(1)
      .click();
    cy.wait("@lithostratigraphy_PUT");
    cy.get('[data-cy="layer-card"] [data-testid="CloseIcon"]').click();

    // delete lithostratigraphy
    cy.get('[data-cy="layer-card"] [data-testid="DeleteIcon"]').click();
    cy.wait("@lithostratigraphy_DELETE");
  });
});
