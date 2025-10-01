import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers.js";
import { goToRouteAndAcceptTerms, newUneditableBorehole, startBoreholeEditing } from "../helpers/testHelpers";

describe("Messages for empty profiles", () => {
  it("Displays correct messages for stratigraphy", () => {
    goToRouteAndAcceptTerms(`/`);

    newUneditableBorehole().as("borehole_id");
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    cy.contains("No stratigraphies available...");
    startBoreholeEditing();
    cy.contains("button", "Create empty stratigraphy").should("be.visible").and("be.enabled");
    cy.contains("button", "Extract stratigraphy from profile").should("be.visible").and("be.enabled");
  });
});
