import {
  bearerAuth,
  createBorehole,
  createStratigraphy,
  goToDetailRouteAndAcceptTerms,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for the chronostratigraphy editor.", () => {
  beforeEach(function () {
    // Add new borehole with some lithology layers
    createBorehole({ originalName: "INTEADAL" })
      .as("borehole_id")
      .then(id => createStratigraphy(id, 3000).as("stratigraphy_id"))
      .then(stratigraphyId => {
        const layers = {
          layer: [
            {
              lithologyId: 15104751,
              fromDepth: 0,
              toDepth: 25,
            },
            {
              lithologyId: 15104753,
              fromDepth: 25,
              toDepth: 35,
            },
            {
              fromDepth: 35,
              toDepth: 43,
            },
          ],
          lithostratigraphy: [
            {
              lithostratigraphyId: 15300363,
              fromDepth: 0,
              toDepth: 35,
            },
            {
              fromDepth: 35,
              toDepth: 40,
            },
            {
              lithostratigraphyId: 15300093,
              fromDepth: 40,
              toDepth: 43,
            },
          ],
        };
        Object.entries(layers).forEach(([key, value]) => {
          cy.get("@id_token").then(token => {
            value.forEach(layer => {
              cy.request({
                method: "POST",
                url: "/api/v2/" + key,
                cache: "no-cache",
                credentials: "same-origin",
                headers: {
                  "Content-Type": "application/json",
                },
                body: {
                  stratigraphyId: stratigraphyId,
                  ...layer,
                },
                auth: bearerAuth(token),
              }).then(response => {
                expect(response).to.have.property("status", 200);
              });
            });
          });
        });
      });

    // open chronostratigraphy editor
    cy.get("@borehole_id").then(id => {
      cy.get("@stratigraphy_id").then(stratigraphyId => {
        goToDetailRouteAndAcceptTerms(`/${id}/stratigraphy/${stratigraphyId}#chronostratigraphy`);
      });
    });
    cy.wait("@get-layers-by-profileId");

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
