describe("Test the borehole bulk edit feature.", () => {
  beforeEach(() => {
    cy.intercept("/api/v1/geoapi/canton").as("geoapi");
    cy.intercept("/api/v1/borehole").as("borehole");
    cy.intercept("/api/v1/borehole/edit", req => {
      return (req.alias = `edit_${req.body.action.toLowerCase()}`);
    });

    // login
    cy.visit("/editor");
    cy.contains("button", "Login").click();
    cy.wait("@geoapi");
  });

  it("opens the bulk edit dialog", () => {
    cy.get('[data-cy="borehole-table"] thead .checkbox').click();
    cy.contains("button", "Bulk editing").click();
    cy.wait("@edit_ids");
  });
});
