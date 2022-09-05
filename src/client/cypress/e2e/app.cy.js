describe("General app tests", () => {
  it("Displays the login page", () => {
    cy.visit("/");
    cy.contains("Sign in");
  });
});
