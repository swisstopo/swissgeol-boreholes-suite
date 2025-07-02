import {
  assertEmptyRequestReviewModal,
  assertWorkflowSteps,
  checkWorkflowChangeContent,
  clickSgcButtonWithContent,
  evaluateComment,
} from "../helpers/swissgeolCoreHelpers.js";
import {
  createBorehole,
  getElementByDataCy,
  goToDetailRouteAndAcceptTerms,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers.js";

describe("Tests the publication workflow.", () => {
  it("Displays DEV workflow when feature flag is set", () => {
    goToDetailRouteAndAcceptTerms(`/1000036/status`);
    // displays legacy workflow form by default
    cy.contains("h4", "Publication workflow").should("exist");
    goToDetailRouteAndAcceptTerms(`/1000036/status?dev=true`);
    cy.contains("h4", "Publication workflow").should("not.exist");

    cy.get("sgc-translate").contains("Status").should("exist");
    cy.get("sgc-translate").contains("Draft").should("exist");
    cy.get("sgc-translate").contains("Zugewiesene Person").should("exist");
    cy.get(".assignee").contains("validator user").should("exist");

    checkWorkflowChangeContent("editor user", "Status von Published zu Reviewed geändert", "Omnis ut in.");
    checkWorkflowChangeContent(
      "controller user",
      "Borehole editor user zugewiesen",
      "Rerum repudiandae nihil accusamus sed omnis tempore laboriosam eaque est.",
    ); // Translation not yet available in core UI
  });

  it("Can request review from users with controller privilege", () => {
    createBorehole({
      "extended.original_name": "Flinchy clown fish",
      "custom.alternate_name": "Flinchy clown fish",
    }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}/status?dev=true`);
      startBoreholeEditing();

      // temporary workaround to update boreholeV1 to borehole V2 and get WorkflowV2 until borehole is created with api v2
      stopBoreholeEditing();
      goToDetailRouteAndAcceptTerms(`/${id}/status?dev=true`);
      startBoreholeEditing();

      getElementByDataCy("workflow-status-chip").should("contain", "Draft");
      // assert that the draft step is active
      assertWorkflowSteps("Draft");

      cy.get("sgc-button").find("sgc-translate").contains("Review anfordern").click();
      assertEmptyRequestReviewModal();

      // button in modal to request review should be disabled
      cy.get("sgc-button[disabled]").find("sgc-translate").contains("Review anfordern");

      cy.get(".select-trigger").click();

      cy.get(".select-option").should("have.length", 6);
      // 2 users without controller privileges should not exist
      cy.get(".select-option").contains("viewer user").should("not.exist");
      cy.get(".select-option").contains("editor user").should("not.exist");

      // 6 users with controller privileges should be selectable
      cy.get(".select-option").contains("controller user").should("exist");
      cy.get(".select-option").contains("publisher user").should("exist");
      cy.get(".select-option").contains("user_that_can be_deleted").should("exist");
      cy.get(".select-option").contains("user_that_only has_files").should("exist");
      cy.get(".select-option").contains("validator user").should("exist");
      cy.get(".select-option").contains("Admin User").should("exist");

      cy.contains("Weiterleiten").click(); // click on dialog title to close dropdown again

      cy.get("sgc-text-area").find("textarea").type("I wanted to request a review, but then cancelled");
      clickSgcButtonWithContent("Abbrechen");
      // no comment should be added
      cy.get("sgc-workflow-change-template").find(".comment").should("not.exist");
      clickSgcButtonWithContent("Review anfordern");

      assertEmptyRequestReviewModal();

      cy.get(".select-trigger").click();
      // 5 users with controller privileges should be selectable
      cy.get(".select-option").contains("validator user").click();
      cy.get("sgc-text-area").find("textarea").type("I requested a review!");

      cy.get("sgc-modal-wrapper").find("sgc-button").find("sgc-translate").contains("Review anfordern").click();

      // assert new history entry
      cy.get("sgc-workflow-change-template").find(".highlight").contains("Admin User").scrollIntoView();
      cy.get("sgc-workflow-change-template").find(".highlight").contains("Admin User").should("be.visible");

      cy.get("sgc-workflow-change-template")
        .find("li")
        .contains("Status von Draft zu Review geändert")
        .should("be.visible");

      evaluateComment("I requested a review!", true);

      // assert status update
      assertWorkflowSteps("Review");

      // assert new assigned user
      cy.get(".assignee").should("contain", "validator user");

      // assert status update in header
      getElementByDataCy("workflow-status-chip").should("contain", "Review");
      stopBoreholeEditing();
    });
  });
});
