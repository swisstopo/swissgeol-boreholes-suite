import {
  bearerAuth,
  createBorehole,
  createStratigraphy,
  loginAsAdmin,
  startBoreholeEditing,
} from "../helpers/testHelpers";

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
            lithologyId: 15104758,
            fromDepth: 0,
            toDepth: 25,
          },
          {
            lithologyId: 15104759,
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
          cy.get("@id_token").then(token =>
            cy
              .request({
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
                auth: bearerAuth(token),
              })
              .then(response => {
                expect(response).to.have.property("status", 200);
              }),
          );
        });
      });

    // open lithostratigraphy editor
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/${id}/stratigraphy/lithostratigraphy`);
    });
    cy.wait("@get-layers-by-profileId");

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

    // Ensure clone and delete buttons in header are disabled for lithostratigraphy.
    cy.get('[data-cy="clone-and-delete-buttons"]').should("not.exist");

    cy.get('.MuiPaper-elevation [role="listbox"]').find('[role="option"]').eq(1).click();
    cy.wait("@lithostratigraphy_PUT");
    cy.get('[data-cy="layer-card"] [data-testid="CloseIcon"]').click();

    // delete lithostratigraphy
    cy.get('[data-cy="layer-card"] [data-testid="DeleteIcon"]').click();
    cy.wait("@lithostratigraphy_DELETE");
  });
});
