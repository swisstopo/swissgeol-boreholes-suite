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
    // Add new borehole with some lithology layers
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => createStratigraphy(id, 3000).as("stratigraphy_id"))
      .then(stratigraphyId => {
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
                  stratigraphyId: stratigraphyId,
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
      cy.get("@stratigraphy_id").then(stratigraphyId => {
        goToDetailRouteAndAcceptTerms(`/${id}/stratigraphy/${stratigraphyId}#lithostratigraphy`);
      });
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
