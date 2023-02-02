import { newEditableBorehole } from "../testHelpers";

describe("Tests for the lithological description column.", () => {
  it("Creates ... ??? ", () => {
    // create boreholes
    newEditableBorehole().as("borehole_id");

    // navigate to stratigraphy
    cy.get('[data-cy="stratigraphy-menu-item"]').click();
    cy.get('[data-cy="add-stratigraphy-button"]').click();
    cy.wait("@stratigraphy_edit_create");

    // try add lithological description without lithology
    cy.get('[data-cy="add-litho-desc-icon"]').click();

    // stop editing
    cy.contains("a", "Stop editing").click();
    cy.wait("@edit_unlock");
    cy.contains("h3", "Done").click();
    cy.wait(["@edit_list", "@borehole"]);
  });
});
