import { evaluateSelect, setInput, setSelect } from "../helpers/formHelpers.js";
import {
  getElementByDataCy,
  goToRouteAndAcceptTerms,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers.js";

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

  it("Can request review from users with controller privilege", () => {
    goToRouteAndAcceptTerms(`/1000011/status?dev=true`);
    startBoreholeEditing();
    getElementByDataCy("workflow-status-chip").should("contain", "Draft");
    // assert that the draft step is active
    getElementByDataCy("workflow-status-Draft-active").should("exist");
    getElementByDataCy("workflow-status-InReview-inactive").should("exist");
    getElementByDataCy("workflow-status-Reviewed-inactive").should("exist");
    getElementByDataCy("request-review-button").click();
    evaluateSelect("newAssigneeId", "");
    cy.get('textarea[name="comment"]').should("be.empty");
    getElementByDataCy("request-review-dialog-button").should("be.disabled");
    getElementByDataCy("newAssigneeId-formSelect").click();
    // 5 users with controller privileges should be selectable
    cy.get(".MuiMenuItem-root").should("have.length", 6);
    cy.get(".MuiMenuItem-root").contains("Viewer User").should("not.exist");
    cy.get(".MuiMenuItem-root").contains("Editor User").should("not.exist");
    cy.get(".MuiMenuItem-root").contains("Controller User").should("exist");
    cy.get("body").click(0, 0); // click on dialog title to close dropdown again
    setInput("comment", "I wanted to request a review, but then cancelled");
    getElementByDataCy("cancel-button").click();

    cy.get('[data-cy^="workflow-history-entry-"]')
      .contains("I wanted to request a review, but then cancelled")
      .should("not.exist");

    getElementByDataCy("request-review-button").click();
    evaluateSelect("newAssigneeId", "");
    cy.get('textarea[name="comment"]').should("be.empty");
    setSelect("newAssigneeId", 5); // Validator User
    setInput("comment", "I requested a review!");
    getElementByDataCy("request-review-dialog-button").should("not.be.disabled");
    getElementByDataCy("request-review-dialog-button").click();

    // assert new history entry
    cy.get('[data-cy^="workflow-history-entry-"]').contains("Admin User").should("be.visible");
    cy.get('[data-cy^="workflow-history-entry-"]').contains("Changed status from Draft to Review").should("be.visible");
    cy.get('[data-cy^="workflow-history-entry-"]').contains("I requested a review!").should("be.visible");

    // assert status update
    getElementByDataCy("workflow-status-Draft-inactive").should("exist");
    getElementByDataCy("workflow-status-InReview-active").should("exist");
    getElementByDataCy("workflow-status-Reviewed-inactive").should("exist");

    // assert new assigned user
    getElementByDataCy("assigned-user-name").should("contain", "Validator User");

    // assert status update in header
    getElementByDataCy("workflow-status-chip").should("contain", "Review");
    stopBoreholeEditing();
  });
});
