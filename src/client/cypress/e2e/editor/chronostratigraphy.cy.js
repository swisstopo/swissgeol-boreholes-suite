import { createBorehole, adminUserAuth, login } from "../testHelpers";

describe("Tests for the chronostratigraphy editor.", () => {
  beforeEach(function () {
    // Add new borehole with some lithology layers
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id => {
        cy.request({
          method: "POST",
          url: "/api/v1/borehole/stratigraphy/edit",
          body: {
            action: "CREATE",
            id: id,
            kind: 3000,
          },
          auth: adminUserAuth,
        });
      })
      .then(response => {
        expect(response.body).to.have.property("success", true);

        [
          {
            lithologyId: 15101044,
            lithostratigraphyId: 15200091,
            fromDepth: 0,
            toDepth: 45,
          },
          {
            lithologyId: 15102027,
            fromDepth: 45,
            toDepth: 65,
          },
          {
            fromDepth: 65,
            toDepth: 75,
          },
          {
            lithostratigraphyId: 15200235,
            fromDepth: 75,
            toDepth: 80,
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

    // open chronostratigraphy editor
    cy.get("@borehole_id").then(id =>
      login(`editor/${id}/stratigraphy/chronostratigraphy`),
    );
    cy.wait("@layer-by-profileId");

    // start editing session
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");
  });

  it.only("Creates, updates and deletes chronostratigraphy layers", () => {
    // create chronostratigraphy
    cy.get('[data-cy="add-chrono-button"]').click({ force: true });
    cy.wait("@chronostratigraphy_POST");

    // edit chronostratigraphy
    cy.get(
      '[data-cy="chrono-layers"]:nth-child(1) [data-testid="EditIcon"]',
    ).click();
    cy.get('[data-cy="chrono-layers"]:nth-child(1) :nth-child(4)').click();

    cy.get('.MuiPaper-elevation [role="listbox"]')
      .find('[role="option"]')
      .eq(1)
      .click();
    cy.wait("@chronostratigraphy_PUT");
    cy.get(
      '[data-cy="chrono-layers"]:nth-child(1) [data-testid="CloseIcon"]',
    ).click();

    // delete chronostratigraphy
    cy.get(
      '[data-cy="chrono-layers"]:nth-child(1) [data-testid="DeleteIcon"]',
    ).click();
    cy.wait("@chronostratigraphy_DELETE");
  });
});
