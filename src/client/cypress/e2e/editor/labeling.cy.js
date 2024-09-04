import { newUneditableBorehole, startBoreholeEditing, stopBoreholeEditing } from "../helpers/testHelpers.js";

describe("Test labeling tool", () => {
  it("can show labeling panel", () => {
    newUneditableBorehole().as("borehole_id");
    // only show in editing mode
    cy.get('[data-cy="labeling-toggle-button"]').should("not.exist");

    // panel is closed by default
    startBoreholeEditing();
    cy.get('[data-cy="labeling-toggle-button"]').should("exist");
    cy.get('[data-cy="labeling-panel"]').should("not.exist");

    // panel can be opened and closed
    cy.get('[data-cy="labeling-toggle-button"]').click();
    cy.get('[data-cy="labeling-panel"]').should("exist");
    cy.get('[data-cy="labeling-toggle-button"]').click();
    cy.get('[data-cy="labeling-panel"]').should("not.exist");

    // panel open state should be reset when editing is stopped, panel position should be preserved
    cy.get('[data-cy="labeling-toggle-button"]').click();
    cy.get('[data-cy="labeling-panel"]').should("exist");
    cy.get('[data-cy="labeling-panel-position-right"]').should("have.class", "Mui-selected");
    cy.get('[data-cy="labeling-panel-position-bottom"]').click();
    cy.get('[data-cy="labeling-panel-position-right"]').should("not.have.class", "Mui-selected");
    cy.get('[data-cy="labeling-panel-position-bottom"]').should("have.class", "Mui-selected");

    stopBoreholeEditing();
    cy.get('[data-cy="labeling-panel"]').should("not.exist");
    startBoreholeEditing();
    cy.get('[data-cy="labeling-panel"]').should("not.exist");
    cy.get('[data-cy="labeling-toggle-button"]').click();
    cy.get('[data-cy="labeling-panel-position-bottom"]').should("have.class", "Mui-selected");
  });
});
