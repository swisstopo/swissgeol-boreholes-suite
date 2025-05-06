import { getElementByDataCy, goToRouteAndAcceptTerms } from "../helpers/testHelpers.js";

describe("Tests the publication workflow.", () => {
  it("Displays DEV workflow when feature flag is set", () => {
    goToRouteAndAcceptTerms(`/1000036/status`);
    // displays legacy workflow form by default
    cy.contains("h4", "Publication workflow").should("exist");
    goToRouteAndAcceptTerms(`/1000036/status?dev=true`);
    cy.contains("h4", "Publication workflow").should("not.exist");

    getElementByDataCy("workflow-status-card").contains("h5", "Status").should("exist");
    getElementByDataCy("workflow-status-card").contains("h5", "Draft").should("exist");

    getElementByDataCy("workflow-assigned-user-card").contains("h5", "Assigned Person").should("exist");
    getElementByDataCy("workflow-assigned-user-card").contains("p", "Validator User").should("exist");

    getElementByDataCy("workflow-history-entry-15000183").should("contain", "Editor User");
    getElementByDataCy("workflow-history-entry-15000183").should("contain", "16. Nov. 2021");
    getElementByDataCy("workflow-history-entry-15000183").should(
      "contain",
      "Changed status from Published to Reviewed",
    );
    getElementByDataCy("workflow-history-entry-15000112").should("contain", "Borehole assigned to Editor User");
    getElementByDataCy("workflow-history-entry-15000112").should(
      "contain",
      "Rerum repudiandae nihil accusamus sed omnis tempore laboriosam eaque est.",
    );
    getElementByDataCy("review-tab").click();
    cy.contains("thead", "Reviewed").should("exist");

    //verify all checkboxes are unchecked
    cy.get(".PrivateSwitchBase-input").should("not.be.checked");
  });
});
